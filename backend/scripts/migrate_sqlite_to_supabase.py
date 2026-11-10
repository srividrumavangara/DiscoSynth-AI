"""Script to safely migrate existing SQLite datasets to Supabase PostgreSQL."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import Session

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.models import Base, Dataset, DocumentMetadata, Profile


def migrate(sqlite_path: str, target_db_url: str, target_user_id: str, target_user_email: str) -> None:
    """Migrate all datasets and document metadata from SQLite to PostgreSQL."""
    print(f"[*] Reading source SQLite database: {sqlite_path}")
    sqlite_url = f"sqlite:///{sqlite_path}"
    source_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

    # Normalize target URL if needed
    if target_db_url.startswith("postgres://"):
        target_db_url = target_db_url.replace("postgres://", "postgresql://", 1)

    print(f"[*] Connecting to destination PostgreSQL: {target_db_url.split('@')[-1] if '@' in target_db_url else 'target'}")
    target_engine = create_engine(target_db_url, pool_pre_ping=True)

    # Ensure tables exist on target
    print("[*] Verifying destination schema...")
    Base.metadata.create_all(bind=target_engine)

    with Session(source_engine) as src_session, Session(target_engine) as dst_session:
        # Count source records
        src_ds_count = src_session.scalar(select(func.count(Dataset.id))) or 0
        src_doc_count = src_session.scalar(select(func.count(DocumentMetadata.id))) or 0
        print(f"[*] Source SQLite contains {src_ds_count} datasets and {src_doc_count} document records.")

        if src_ds_count == 0:
            print("[+] Source database has 0 datasets. Nothing to migrate.")
            return

        # Ensure target profile exists
        profile = dst_session.get(Profile, target_user_id)
        if not profile:
            profile = Profile(
                id=target_user_id,
                email=target_user_email,
                display_name=target_user_email.split("@")[0],
            )
            dst_session.add(profile)
            dst_session.commit()
            print(f"[+] Created target user profile: {target_user_id} ({target_user_email})")

        # Migrate Datasets
        datasets = src_session.query(Dataset).all()
        for ds in datasets:
            existing = dst_session.get(Dataset, ds.id)
            if not existing:
                new_ds = Dataset(
                    id=ds.id,
                    user_id=target_user_id,
                    name=ds.name,
                    scenario=ds.scenario,
                    num_records=ds.num_records,
                    complexity=ds.complexity,
                    generation_method=ds.generation_method,
                    status=ds.status,
                    quality_score=ds.quality_score,
                    seed=ds.seed,
                    config_json=ds.config_json,
                    created_at=ds.created_at,
                    updated_at=ds.updated_at,
                )
                dst_session.add(new_ds)
        dst_session.commit()
        print(f"[+] Migrated {len(datasets)} dataset headers.")

        # Migrate DocumentMetadata in batches
        BATCH_SIZE = 1000
        total_migrated_docs = 0
        docs = src_session.query(DocumentMetadata).yield_per(BATCH_SIZE)
        batch = []
        for doc in docs:
            new_doc = DocumentMetadata(
                dataset_id=doc.dataset_id,
                document_id=doc.document_id,
                case_id=doc.case_id,
                document_type=doc.document_type,
                custodian_id=doc.custodian_id,
                custodian_role=doc.custodian_role,
                fictional_custodian_name=doc.fictional_custodian_name,
                fictional_organization=doc.fictional_organization,
                date_created=doc.date_created,
                date_modified=doc.date_modified,
                file_type=doc.file_type,
                communication_channel=doc.communication_channel,
                confidentiality_level=doc.confidentiality_level,
                privilege_status=doc.privilege_status,
                responsive=doc.responsive,
                issue_tags=doc.issue_tags,
                legal_hold=doc.legal_hold,
                review_status=doc.review_status,
                redaction_required=doc.redaction_required,
                document_family_id=doc.document_family_id,
                attachment_count=doc.attachment_count,
                file_size_kb=doc.file_size_kb,
                language=doc.language,
                jurisdiction=doc.jurisdiction,
            )
            batch.append(new_doc)
            if len(batch) >= BATCH_SIZE:
                dst_session.bulk_save_objects(batch)
                dst_session.commit()
                total_migrated_docs += len(batch)
                print(f"[*] Processed {total_migrated_docs}/{src_doc_count} document records...")
                batch = []

        if batch:
            dst_session.bulk_save_objects(batch)
            dst_session.commit()
            total_migrated_docs += len(batch)

        # Verification step
        dst_ds_count = dst_session.scalar(select(func.count(Dataset.id)).filter(Dataset.user_id == target_user_id)) or 0
        dst_doc_count = dst_session.scalar(select(func.count(DocumentMetadata.id))) or 0

        print("\n================= MIGRATION VERIFICATION =================")
        print(f"Datasets: Source SQLite = {src_ds_count} | Destination PostgreSQL = {dst_ds_count}")
        print(f"Records:  Source SQLite = {src_doc_count} | Destination PostgreSQL = {dst_doc_count}")
        if dst_ds_count >= src_ds_count and dst_doc_count >= src_doc_count:
            print("[SUCCESS] All data migrated and verified successfully!")
        else:
            print("[WARNING] Record count mismatch. Please check target logs.")
        print("==========================================================\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Migrate DiscoSynth AI SQLite data to Supabase PostgreSQL")
    parser.add_argument("--sqlite", default="discosynth.db", help="Path to source SQLite file")
    parser.add_argument("--target-url", required=True, help="Target PostgreSQL Connection URI")
    parser.add_argument("--user-id", required=True, help="Supabase user UUID to assign migrated datasets to")
    parser.add_argument("--email", default="counsel@discosynth.ai", help="Email associated with the target user")

    args = parser.parse_args()
    migrate(args.sqlite, args.target_url, args.user_id, args.email)
