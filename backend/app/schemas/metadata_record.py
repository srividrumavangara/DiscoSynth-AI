from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class DocumentMetadata(BaseModel):
    doc_id: str = Field(..., description="Unique Bates or document identifier (e.g. DS-2026-X1-0001)")
    filename: str = Field(..., description="Realistic filename with extension (e.g. board_minutes_q3.pdf)")
    title: str = Field(..., description="Document subject line or descriptive title")
    doc_type: str = Field(..., description="Document category (e.g. Emails, Financial Records, Court Filings)")
    file_extension: str = Field(..., description="File format extension (msg, pdf, xlsx, docx, etc.)")
    file_size_kb: int = Field(..., ge=1, le=100000, description="Estimated file size in kilobytes")
    creation_date: str = Field(..., description="ISO 8601 creation date string (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)")
    modified_date: str = Field(..., description="ISO 8601 modified date string")
    custodian: str = Field(..., description="Document owner / custodian name and title")
    sender: Optional[str] = Field(None, description="Sender email or author name for communications")
    recipients: List[str] = Field(default_factory=list, description="List of recipient emails or names")
    source_system: str = Field(..., description="Originating repository (e.g. Microsoft 365 Exchange, SAP ERP, Local Drive)")
    confidentiality_level: str = Field(..., description="Public, Confidential, Highly Confidential, Restricted")
    privilege_status: str = Field(..., description="Not Privileged, Attorney-Client, Work Product, Joint Defense")
    privilege_basis: Optional[str] = Field(None, description="Legal basis for privilege claim if applicable")
    responsiveness: str = Field(..., description="Responsive, Non-Responsive")
    issue_tags: List[str] = Field(default_factory=list, description="Case-specific factual or legal tags")
    litigation_scenario: str = Field(..., description="Litigation scenario context")
    synthetic_marker: str = Field(default="SYNTHETIC_EVAL_RECORD", description="Explicit watermark denoting synthetic evaluation data")

class DocumentMetadataUpdate(BaseModel):
    title: Optional[str] = None
    doc_type: Optional[str] = None
    custodian: Optional[str] = None
    confidentiality_level: Optional[str] = None
    privilege_status: Optional[str] = None
    privilege_basis: Optional[str] = None
    responsiveness: Optional[str] = None
    issue_tags: Optional[List[str]] = None
