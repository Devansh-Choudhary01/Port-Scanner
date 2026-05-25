"""
CyberSuite Report Generator
Generates PDF security assessment reports from scan results.
"""
import io
import uuid
import time
from datetime import datetime
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from app.models.report_models import ReportRequest, ReportResponse

router = APIRouter()

RISK_COLORS = {
    "critical": colors.HexColor("#FF2D55"),
    "high":     colors.HexColor("#FF9500"),
    "medium":   colors.HexColor("#FFCC00"),
    "low":      colors.HexColor("#34C759"),
    "none":     colors.HexColor("#8E8E93"),
}


def _build_pdf(req: ReportRequest) -> bytes:
    """Build and return PDF bytes for the report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "title", parent=styles["Title"],
        fontSize=22, textColor=colors.HexColor("#00D4FF"),
        spaceAfter=6
    )
    h2_style = ParagraphStyle(
        "h2", parent=styles["Heading2"],
        fontSize=14, textColor=colors.HexColor("#1A1A2E"),
        spaceBefore=12, spaceAfter=4
    )
    body_style = ParagraphStyle(
        "body", parent=styles["Normal"],
        fontSize=9, leading=14
    )

    story = []
    now = datetime.now().strftime("%Y-%m-%d %H:%M UTC")

    # ── Header ────────────────────────────────────────────────────────────────
    story.append(Paragraph("🛡 CyberSuite Security Report", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#00D4FF")))
    story.append(Spacer(1, 10))

    meta_data = [
        ["Report Title", req.title],
        ["Target",       req.target],
        ["Analyst",      req.analyst or "CyberSuite Automated Scanner"],
        ["Generated At", now],
        ["Total Scans",  str(len(req.scans))],
    ]
    meta_table = Table(meta_data, colWidths=[4*cm, 13*cm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#1A1A2E")),
        ("TEXTCOLOR",  (0, 0), (0, -1), colors.white),
        ("FONTNAME",   (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (1, 0), (1, -1), [colors.HexColor("#F8F9FA"), colors.white]),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("PADDING",    (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 16))

    # ── Executive Summary ─────────────────────────────────────────────────────
    story.append(Paragraph("Executive Summary", h2_style))
    summary_text = req.executive_summary or (
        f"This automated security assessment was conducted against <b>{req.target}</b>. "
        f"A total of <b>{len(req.scans)}</b> scan(s) were performed. "
        "The findings below represent potential security risks identified during testing. "
        "All tests were conducted using safe, non-destructive methods."
    )
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 12))

    # ── Risk Breakdown ────────────────────────────────────────────────────────
    risk_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "none": 0}
    for scan in req.scans:
        risk_counts[scan.risk_level] = risk_counts.get(scan.risk_level, 0) + 1

    story.append(Paragraph("Risk Breakdown", h2_style))
    risk_rows = [["Risk Level", "Count", "Colour"]]
    for level, count in risk_counts.items():
        risk_rows.append([level.capitalize(), str(count), ""])
    risk_table = Table(risk_rows, colWidths=[5*cm, 3*cm, 9*cm])
    risk_styles = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1A1A2E")),
        ("TEXTCOLOR",  (0, 0), (-1, 0), colors.white),
        ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE",   (0, 0), (-1, -1), 9),
        ("GRID",       (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
        ("PADDING",    (0, 0), (-1, -1), 6),
    ]
    for i, (level, _) in enumerate(risk_counts.items(), start=1):
        risk_styles.append(("BACKGROUND", (2, i), (2, i), RISK_COLORS.get(level, colors.gray)))
    risk_table.setStyle(TableStyle(risk_styles))
    story.append(risk_table)
    story.append(Spacer(1, 16))

    # ── Scan Details ──────────────────────────────────────────────────────────
    story.append(Paragraph("Detailed Findings", h2_style))
    for i, scan in enumerate(req.scans, 1):
        story.append(Paragraph(f"{i}. {scan.tool} — {scan.target}", ParagraphStyle(
            f"scan_h_{i}", parent=styles["Heading3"],
            fontSize=11, textColor=RISK_COLORS.get(scan.risk_level, colors.black),
        )))
        story.append(Paragraph(f"<b>Risk:</b> {scan.risk_level.capitalize()} | <b>Time:</b> {scan.timestamp}", body_style))
        story.append(Spacer(1, 4))

        if scan.findings:
            for finding in scan.findings:
                story.append(Paragraph(f"• {finding}", body_style))
        else:
            story.append(Paragraph("No significant findings.", body_style))

        if req.include_recommendations:
            recs = {
                "critical": "Immediate remediation required. Escalate to security team.",
                "high":     "Remediate within 7 days. Review affected systems.",
                "medium":   "Schedule fix within 30 days. Monitor until resolved.",
                "low":      "Address in next maintenance window.",
                "none":     "No action required.",
            }
            story.append(Paragraph(
                f"<b>Recommendation:</b> {recs.get(scan.risk_level, '')}",
                ParagraphStyle("rec", parent=body_style, textColor=colors.HexColor("#333333"))
            ))

        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#DDDDDD")))
        story.append(Spacer(1, 6))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "⚠️ This report is generated by CyberSuite for authorized security assessment only. "
        "Do not use findings for unauthorized activities.",
        ParagraphStyle("footer", parent=body_style, textColor=colors.gray, fontSize=8)
    ))

    doc.build(story)
    return buffer.getvalue()


@router.post("/generate", summary="Generate PDF Security Report")
async def generate_report(req: ReportRequest):
    """
    Generate a professional PDF security report from scan results.
    Returns the PDF file as a streaming response.
    """
    pdf_bytes = _build_pdf(req)
    report_id = str(uuid.uuid4())[:8].upper()
    filename = f"CyberSuite_Report_{report_id}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/preview", response_model=ReportResponse, summary="Report Metadata Preview")
async def report_preview(req: ReportRequest):
    """Return report metadata without generating the PDF."""
    risk_breakdown = {}
    for scan in req.scans:
        risk_breakdown[scan.risk_level] = risk_breakdown.get(scan.risk_level, 0) + 1

    return ReportResponse(
        report_id=str(uuid.uuid4())[:8].upper(),
        title=req.title,
        generated_at=datetime.now().isoformat(),
        target=req.target,
        total_issues=len(req.scans),
        risk_breakdown=risk_breakdown,
        download_url="/api/reports/generate",
        format="PDF",
    )
