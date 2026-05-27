import re
import math
import string
from fastapi import APIRouter, Depends, HTTPException, Request
from app.models.vuln_models import (
    PasswordRequest, PasswordResponse, PasswordStrength
)
from app.api.auth.auth import get_current_user
from app.core.audit import log_scan

router = APIRouter()


def _calc_entropy(password: str) -> float:
    """Estimate Shannon entropy bits based on character pool size."""
    pool = 0
    if any(c.islower() for c in password): pool += 26
    if any(c.isupper() for c in password): pool += 26
    if any(c.isdigit() for c in password): pool += 10
    if any(c in string.punctuation for c in password): pool += 32
    if pool == 0:
        return 0.0
    return round(len(password) * math.log2(pool), 2)


CRACK_TIME_MAP = [
    (28,  "< 1 second"),
    (35,  "A few seconds"),
    (45,  "Minutes"),
    (55,  "Hours"),
    (65,  "Days"),
    (75,  "Months"),
    (85,  "Years"),
    (999, "Centuries"),
]

COMMON_PASSWORDS = {
    "password", "123456", "password1", "qwerty", "abc123",
    "letmein", "123456789", "12345678", "iloveyou", "admin",
    "welcome", "monkey", "dragon", "master", "pass"
}


def _assess(password: str) -> PasswordResponse:
    checks = {
        "min_length_8":     len(password) >= 8,
        "min_length_12":    len(password) >= 12,
        "has_uppercase":    bool(re.search(r'[A-Z]', password)),
        "has_lowercase":    bool(re.search(r'[a-z]', password)),
        "has_digit":        bool(re.search(r'\d', password)),
        "has_symbol":       bool(re.search(r'[^A-Za-z0-9]', password)),
        "no_common":        password.lower() not in COMMON_PASSWORDS,
        "no_repeated_chars":not bool(re.search(r'(.)\1{2,}', password)),
    }

    score = sum([
        20 if checks["min_length_8"] else 0,
        10 if checks["min_length_12"] else 0,
        15 if checks["has_uppercase"] else 0,
        10 if checks["has_lowercase"] else 0,
        15 if checks["has_digit"] else 0,
        20 if checks["has_symbol"] else 0,
        5  if checks["no_common"] else -20,
        5  if checks["no_repeated_chars"] else 0,
    ])
    score = max(0, min(100, score))

    entropy = _calc_entropy(password)

    if score < 20:      strength = PasswordStrength.VERY_WEAK
    elif score < 40:    strength = PasswordStrength.WEAK
    elif score < 60:    strength = PasswordStrength.MODERATE
    elif score < 80:    strength = PasswordStrength.STRONG
    else:               strength = PasswordStrength.VERY_STRONG

    crack_time = "< 1 second"
    for threshold, label in CRACK_TIME_MAP:
        if entropy < threshold:
            crack_time = label
            break

    suggestions = []
    if not checks["min_length_8"]:    suggestions.append("Use at least 8 characters.")
    if not checks["min_length_12"]:   suggestions.append("Aim for 12+ characters for better security.")
    if not checks["has_uppercase"]:   suggestions.append("Add uppercase letters (A–Z).")
    if not checks["has_lowercase"]:   suggestions.append("Add lowercase letters (a–z).")
    if not checks["has_digit"]:       suggestions.append("Include at least one number.")
    if not checks["has_symbol"]:      suggestions.append("Add special characters (!@#$%).")
    if not checks["no_common"]:       suggestions.append("Avoid commonly used passwords.")
    if not checks["no_repeated_chars"]: suggestions.append("Avoid repeated characters (e.g. aaa).")

    return PasswordResponse(
        strength=strength,
        score=score,
        entropy_bits=entropy,
        suggestions=suggestions,
        checks=checks,
        crack_time_estimate=crack_time,
    )


@router.post("/password-check", response_model=PasswordResponse, summary="Password Strength Checker")
async def check_password(
    request: PasswordRequest,
    http_request: Request,
    current_user: dict = Depends(get_current_user),
):
    """
    Analyse a password for strength, entropy, and security issues.
    No passwords are stored or logged. Requires JWT auth.
    """
    return _assess(request.password)
