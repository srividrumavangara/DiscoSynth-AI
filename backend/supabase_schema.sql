-- ==============================================================================
-- DISCOSYNTH AI — PRODUCTION SUPABASE POSTGRESQL SCHEMA & ROW LEVEL SECURITY
-- ==============================================================================
-- Paste this script into the Supabase SQL Editor (Project -> SQL Editor -> New Query)
-- and click Run. Safe to re-run (idempotent).

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";

-- 2. Profiles Table (Linked to Supabase Auth users)
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email varchar(255) not null,
    display_name varchar(255),
    avatar_url varchar(512),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists ix_profiles_email on public.profiles(email);

-- 3. Trigger to auto-create profile on Supabase auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, display_name)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    )
    on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.profiles.display_name),
        updated_at = now();
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert or update on auth.users
    for each row execute procedure public.handle_new_user();

-- 4. Datasets Table (Scoped to user_id)
create table if not exists public.datasets (
    id varchar(36) primary key default uuid_generate_v4()::text,
    user_id uuid references public.profiles(id) on delete cascade,
    name varchar(255) not null,
    scenario varchar(64) not null,
    num_records integer not null,
    complexity varchar(32) not null default 'intermediate',
    generation_method varchar(32) not null default 'rule-based',
    status varchar(32) not null default 'pending',
    quality_score double precision,
    seed integer,
    config_json jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists ix_datasets_user_id on public.datasets(user_id);
create index if not exists ix_datasets_created_at on public.datasets(created_at desc);

-- 5. Document Metadata Table (Document records for litigation benchmarks)
create table if not exists public.document_metadata (
    id bigserial primary key,
    dataset_id varchar(36) not null references public.datasets(id) on delete cascade,
    document_id varchar(64) not null,
    case_id varchar(64) not null,
    document_type varchar(32) not null,
    custodian_id varchar(64) not null,
    custodian_role varchar(32) not null,
    fictional_custodian_name varchar(128) not null,
    fictional_organization varchar(128) not null,
    date_created timestamptz not null,
    date_modified timestamptz not null,
    file_type varchar(16) not null,
    communication_channel varchar(32),
    confidentiality_level varchar(32) not null,
    privilege_status varchar(32) not null,
    responsive boolean not null default false,
    issue_tags jsonb not null default '[]'::jsonb,
    legal_hold boolean not null default false,
    review_status varchar(32) not null default 'pending',
    redaction_required boolean not null default false,
    document_family_id varchar(64),
    attachment_count integer not null default 0,
    file_size_kb double precision not null,
    language varchar(8) not null default 'en',
    jurisdiction varchar(64) not null
);

create index if not exists ix_docmeta_dataset_id on public.document_metadata(dataset_id);
create index if not exists ix_docmeta_document_type on public.document_metadata(document_type);
create index if not exists ix_docmeta_responsive on public.document_metadata(responsive);
create index if not exists ix_docmeta_privilege_status on public.document_metadata(privilege_status);

-- 6. Generation History Table (Audit log)
create table if not exists public.generation_history (
    id varchar(36) primary key default uuid_generate_v4()::text,
    user_id uuid references public.profiles(id) on delete cascade,
    dataset_id varchar(36) references public.datasets(id) on delete cascade,
    generation_status varchar(32) not null default 'completed',
    generation_config jsonb,
    created_at timestamptz not null default now()
);

create index if not exists ix_gen_hist_user_id on public.generation_history(user_id);
create index if not exists ix_gen_hist_dataset_id on public.generation_history(dataset_id);

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES (Idempotent)
-- ==============================================================================

-- Enable RLS on all user-owned tables
alter table public.profiles enable row level security;
alter table public.datasets enable row level security;
alter table public.document_metadata enable row level security;
alter table public.generation_history enable row level security;

-- Profiles Policies
drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
    on public.profiles for select
    using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
    on public.profiles for update
    using (auth.uid() = id);

-- Datasets Policies
drop policy if exists "Users can read own datasets" on public.datasets;
create policy "Users can read own datasets"
    on public.datasets for select
    using (auth.uid() = user_id);

drop policy if exists "Users can insert own datasets" on public.datasets;
create policy "Users can insert own datasets"
    on public.datasets for insert
    with check (auth.uid() = user_id);

drop policy if exists "Users can update own datasets" on public.datasets;
create policy "Users can update own datasets"
    on public.datasets for update
    using (auth.uid() = user_id);

drop policy if exists "Users can delete own datasets" on public.datasets;
create policy "Users can delete own datasets"
    on public.datasets for delete
    using (auth.uid() = user_id);

-- Document Metadata Policies (Derived from Dataset Ownership)
drop policy if exists "Users can read documents belonging to their own datasets" on public.document_metadata;
create policy "Users can read documents belonging to their own datasets"
    on public.document_metadata for select
    using (
        exists (
            select 1 from public.datasets d
            where d.id = document_metadata.dataset_id
            and d.user_id = auth.uid()
        )
    );

drop policy if exists "Users can insert documents into their own datasets" on public.document_metadata;
create policy "Users can insert documents into their own datasets"
    on public.document_metadata for insert
    with check (
        exists (
            select 1 from public.datasets d
            where d.id = document_metadata.dataset_id
            and d.user_id = auth.uid()
        )
    );

drop policy if exists "Users can delete documents belonging to their own datasets" on public.document_metadata;
create policy "Users can delete documents belonging to their own datasets"
    on public.document_metadata for delete
    using (
        exists (
            select 1 from public.datasets d
            where d.id = document_metadata.dataset_id
            and d.user_id = auth.uid()
        )
    );

-- Generation History Policies
drop policy if exists "Users can read own generation history" on public.generation_history;
create policy "Users can read own generation history"
    on public.generation_history for select
    using (auth.uid() = user_id);

drop policy if exists "Users can insert own generation history" on public.generation_history;
create policy "Users can insert own generation history"
    on public.generation_history for insert
    with check (auth.uid() = user_id);
