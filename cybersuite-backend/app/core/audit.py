"""
B3 — Consent Audit Logging
Logs each confirmed scan to logs/audit.log.
"""
import logging
import os
from datetime import datetime, timezone
from pathlib import Path

# ─── Setup ────────────────────────────────────────────────────────────────────
LOG_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "audit.log"

_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
_handler.setFormatter(logging.Formatter("%(message)s"))

audit_logger = logging.getLogger("cybersuite.audit")
audit_logger.setLevel(logging.INFO)
audit_logger.addHandler(_handler)
audit_logger.propagate = False


def log_scan(user_email: str, tool_name: str, target: str, ip_address: str) -> None:
    """Write one audit log line for a confirmed scan."""
    ts = datetime.now(timezone.utc).isoformat(timespec="seconds")
    audit_logger.info(f"{ts} | {user_email} | {tool_name} | {target} | {ip_address}")
