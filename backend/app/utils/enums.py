"""Enumeration types used throughout DiscoSynth AI."""

from __future__ import annotations

from enum import Enum


class DocumentType(str, Enum):
    """Supported document types in e-discovery datasets."""

    EMAIL = "email"
    PDF = "pdf"
    DOCX = "docx"
    XLSX = "xlsx"
    INTERNAL_MEMO = "internal_memo"
    FINANCIAL_REPORT = "financial_report"
    CONTRACT = "contract"


class Scenario(str, Enum):
    """Litigation scenario types for synthetic data generation."""

    CORPORATE_FRAUD = "corporate_fraud"
    IP_DISPUTE = "ip_dispute"
    EMPLOYMENT_LITIGATION = "employment_litigation"
    FINANCIAL_MISCONDUCT = "financial_misconduct"
    CONTRACT_DISPUTE = "contract_dispute"
    CUSTOM = "custom"


class Complexity(str, Enum):
    """Complexity levels governing data realism and variety."""

    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class ConfidentialityLevel(str, Enum):
    """Document confidentiality classification."""

    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    HIGHLY_CONFIDENTIAL = "highly_confidential"


class PrivilegeStatus(str, Enum):
    """Attorney-client privilege status."""

    PRIVILEGED = "privileged"
    NOT_PRIVILEGED = "not_privileged"
    PARTIALLY_PRIVILEGED = "partially_privileged"


class ReviewStatus(str, Enum):
    """Document review workflow status."""

    PENDING = "pending"
    REVIEWED = "reviewed"
    NEEDS_SECOND_REVIEW = "needs_second_review"
    ESCALATED = "escalated"


class CustodianRole(str, Enum):
    """Role of the document custodian within the organisation."""

    EXECUTIVE = "executive"
    LEGAL_COUNSEL = "legal_counsel"
    FINANCIAL_ANALYST = "financial_analyst"
    HR_MANAGER = "hr_manager"
    IT_ADMIN = "it_admin"
    SALES_REP = "sales_rep"
    CONSULTANT = "consultant"
    BOARD_MEMBER = "board_member"


class GenerationMethod(str, Enum):
    """How the synthetic data is generated."""

    AI_ASSISTED = "ai-assisted"
    RULE_BASED = "rule-based"


class DatasetStatus(str, Enum):
    """Lifecycle status of a dataset."""

    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class ClassificationDistribution(str, Enum):
    """How responsive/non-responsive classifications are distributed."""

    BALANCED = "balanced"
    REALISTIC = "realistic"
    CUSTOM = "custom"
