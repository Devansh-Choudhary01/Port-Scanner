from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ─── Report Generator ─────────────────────────────────────────────────────────

class ReportScanEntry(BaseModel):
    tool: str
    target: str
    timestamp: str
    risk_level: str    # "none" | "low" | "medium" | "high" | "critical"
    findings: List[str]
    raw_data: Optional[Dict[str, Any]] = None


class ReportRequest(BaseModel):
    title: str = Field(default="CyberSuite Security Report", example="Security Assessment - Example.com")
    target: str = Field(..., example="example.com")
    analyst: Optional[str] = Field(default="CyberSuite Automated Scanner")
    scans: List[ReportScanEntry]
    executive_summary: Optional[str] = None
    include_recommendations: bool = True


class ReportResponse(BaseModel):
    report_id: str
    title: str
    generated_at: str
    target: str
    total_issues: int
    risk_breakdown: Dict[str, int]   # {"critical": 2, "high": 5, ...}
    download_url: str
    format: str = "PDF"
