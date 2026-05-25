from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from openai import AsyncOpenAI
import httpx
import re

from app.core.config import settings

router = APIRouter(tags=["ai"])
openai_client: Optional[AsyncOpenAI] = None
    

# ── Rule-based knowledge base (used when AI_MODEL=rule-based) ──────────────
KNOWLEDGE = {
    "sql injection": {
        "reply": "**SQL Injection** is a code injection technique that exploits vulnerabilities in an application's database layer.\n\n**How it works:**\nAttackers insert malicious SQL code into input fields, which gets executed by the database.\n\n```\n' OR '1'='1' -- \nSELECT * FROM users WHERE id='' OR '1'='1'\n```\n\n**Prevention:**\n- Use parameterized queries / prepared statements\n- Input validation and sanitization\n- Least privilege database accounts\n- Web Application Firewall (WAF)",
        "topic": "SQL Injection",
        "suggested_tools": ["Scanner", "Recon"],
    },
    "xss": {
        "reply": "**Cross-Site Scripting (XSS)** allows attackers to inject malicious scripts into web pages viewed by other users.\n\n**Types:**\n- **Stored XSS** – script saved in database, runs for every visitor\n- **Reflected XSS** – script in URL, executed immediately\n- **DOM-based XSS** – manipulation of the DOM environment\n\n**Prevention:**\n- Encode output (HTML entities)\n- Content Security Policy (CSP) headers\n- HTTPOnly and Secure cookie flags\n- Input validation",
        "topic": "Cross-Site Scripting",
        "suggested_tools": ["Scanner"],
    },
    "csrf": {
        "reply": "**CSRF (Cross-Site Request Forgery)** tricks authenticated users into submitting unwanted requests.\n\n**Prevention:**\n- CSRF tokens on all state-changing requests\n- SameSite cookie attribute\n- Verify Origin/Referer headers\n- Re-authentication for sensitive actions",
        "topic": "CSRF",
        "suggested_tools": ["Scanner"],
    },
    "port scan": {
        "reply": "**Port scanning** identifies open ports and services on a host.\n\n**Common ports:**\n- `22` – SSH\n- `80/443` – HTTP/HTTPS\n- `3306` – MySQL\n- `5432` – PostgreSQL\n- `6379` – Redis\n\n**Use CyberSuite Scanner** to scan any host and detect exposed services.",
        "topic": "Port Scanning",
        "suggested_tools": ["Scanner", "Recon"],
    },
    "password": {
        "reply": "**Password Security Best Practices:**\n\n- Minimum 12 characters, mix of upper/lower/numbers/symbols\n- Never store plaintext — use bcrypt, Argon2, or scrypt\n- Enforce MFA (multi-factor authentication)\n- Use a password manager\n- Check against HaveIBeenPwned breach database\n- Implement account lockout after failed attempts",
        "topic": "Password Security",
        "suggested_tools": [],
    },
    "ssl": {
        "reply": "**SSL/TLS** encrypts data in transit between client and server.\n\n**Common issues:**\n- Expired certificates\n- Weak cipher suites (RC4, DES)\n- TLS 1.0/1.1 still enabled\n- Missing HSTS header\n- Self-signed certificates in production\n\n**Fix:** Use TLS 1.2+ only, strong cipher suites, and HSTS with `includeSubDomains`.",
        "topic": "SSL/TLS",
        "suggested_tools": ["Recon"],
    },
    "subdomain": {
        "reply": "**Subdomain Takeover** occurs when a subdomain points to a service that has been deprovisioned.\n\n**Example:** `blog.example.com` → GitHub Pages repo deleted → attacker creates repo → controls content.\n\n**Prevention:**\n- Audit DNS records regularly\n- Remove CNAME records when decommissioning services\n- Use CyberSuite Recon to enumerate subdomains",
        "topic": "Subdomain Takeover",
        "suggested_tools": ["Recon"],
    },
    "security header": {
        "reply": "**Essential Security Headers:**\n\n```\nContent-Security-Policy: default-src 'self'\nX-Frame-Options: DENY\nX-Content-Type-Options: nosniff\nStrict-Transport-Security: max-age=31536000\nReferrer-Policy: strict-origin-when-cross-origin\nPermissions-Policy: geolocation=(), microphone=()\n```\n\nMissing headers are a quick win for attackers. Add them at the web server or reverse proxy level.",
        "topic": "Security Headers",
        "suggested_tools": ["Scanner"],
    },
}

SYSTEM_PROMPT = """You are CyberSuite AI, an expert cybersecurity assistant embedded in a port scanner and recon platform.

You help users understand:
- Web vulnerabilities (SQLi, XSS, CSRF, SSRF, XXE, etc.)
- Network security (port scanning, firewall rules, protocols)
- Cryptography and SSL/TLS
- Authentication and authorization
- OWASP Top 10 and CVEs
- Security best practices and hardening

Always respond in a structured, clear way. Use markdown formatting:
- **bold** for key terms
- ` backticks ` for commands/code
- ``` code blocks ``` for examples
- Bullet points for lists

Keep responses focused and actionable. If asked about illegal activity, decline politely.
At the end of each response, briefly mention which CyberSuite tool is relevant (Scanner, Recon, Reports) if applicable.
"""


def rule_based_reply(message: str) -> dict:
    msg_lower = message.lower()
    for keyword, data in KNOWLEDGE.items():
        if keyword in msg_lower:
            return data
    return {
        "reply": (
            f"I don't have a specific rule for **\"{message}\"** in offline mode.\n\n"
            "To enable full AI responses, either set `AI_MODEL=openai` and add your OpenAI API key in `.env`, "
            "or set `GROQ_API_KEY` and `AI_MODEL` to your Groq model name (for example `llama-3.3-70b-versatile`).\n\n"
            "Meanwhile, try asking about: SQL Injection, XSS, CSRF, Port Scanning, SSL/TLS, Security Headers, or Passwords."
        ),
        "topic": "General",
        "suggested_tools": [],
    }


# ── Request / Response schemas ─────────────────────────────────────────────
class HistoryMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[HistoryMessage]] = []

class ChatResponse(BaseModel):
    reply: str
    topic: Optional[str] = None
    suggested_tools: Optional[List[str]] = []


# ── Main chat endpoint ─────────────────────────────────────────────────────
@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # If running in rule-based mode explicitly, return local reply
    if settings.AI_MODEL == "rule-based":
        result = rule_based_reply(req.message)
        return ChatResponse(**result)

    # Build message history for context
    history = [
        {"role": m.role, "content": m.content}
        for m in (req.history or [])
        if m.role in ("user", "assistant")
    ][-6:]

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *history,
        {"role": "user", "content": req.message},
    ]

    async def _call_groq(model: str, messages: List[Dict[str, str]], max_tokens: int = 1000, temperature: float = 0.7) -> str:
        payload: Dict[str, Any] = {
            "model": model,
            "input": messages,
            "temperature": temperature,
            "max_output_tokens": max_tokens,
        }
        headers = {"Authorization": f"Bearer {settings.GROQ_API_KEY}", "Content-Type": "application/json"}
        url = settings.GROQ_API_URL.rstrip('/') + "/outputs"
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=payload, headers=headers, timeout=30.0)
            resp.raise_for_status()
            data = resp.json()

        # Try to extract text from common Groq response shapes
        if not data:
            return ""
        # Typical: {"outputs": [{"content": [{"type": "output_text", "text": "..."}] }]}
        outputs = data.get("outputs") if isinstance(data, dict) else None
        if outputs and isinstance(outputs, list) and outputs:
            first = outputs[0]
            if isinstance(first, dict):
                content = first.get("content")
                if isinstance(content, list):
                    parts = []
                    for c in content:
                        if isinstance(c, dict) and "text" in c:
                            parts.append(c.get("text", ""))
                        elif isinstance(c, str):
                            parts.append(c)
                    if parts:
                        return "\n".join(parts)
                if "text" in first and isinstance(first.get("text"), str):
                    return first.get("text")
            if isinstance(first, str):
                return first

        # Fallbacks
        if isinstance(data, dict) and "text" in data and isinstance(data.get("text"), str):
            return data.get("text")
        try:
            import json as _json

            return _json.dumps(data)
        except Exception:
            return str(data)

    async def _call_openai(messages: List[Dict[str, str]], max_tokens: int = 1000, temperature: float = 0.7) -> str:
        if not openai_client:
            raise RuntimeError("OpenAI client not configured")
        response = await openai_client.chat.completions.create(
            model=settings.AI_MODEL,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        # try common response shapes
        try:
            return response.choices[0].message.content
        except Exception:
            try:
                return response.choices[0].text
            except Exception:
                return str(response)

    try:
        # Prefer Groq if an API key is configured
        if settings.GROQ_API_KEY:
            reply = await _call_groq(settings.AI_MODEL or "llama-3.3-70b-versatile", messages, max_tokens=1000, temperature=0.7)
        elif settings.AI_MODEL == "openai" and settings.OPENAI_API_KEY:
            reply = await _call_openai(messages, max_tokens=1000, temperature=0.7)
        else:
            # Nothing configured for remote LLMs — fallback to rule-based
            result = rule_based_reply(req.message)
            return ChatResponse(**result)

        topic_match = re.search(r"\*\*(.*?)\*\*", reply)
        topic = topic_match.group(1) if topic_match else "Cybersecurity"

        return ChatResponse(reply=reply, topic=topic, suggested_tools=[])

    except httpx.HTTPStatusError as e:
        status = e.response.status_code if e.response is not None else None
        if status in (401, 403):
            raise HTTPException(status_code=502, detail="Invalid Groq API key. Check GROQ_API_KEY in .env")
        if status == 429:
            raise HTTPException(status_code=429, detail="Rate limit hit. Credits may be exhausted.")
        result = rule_based_reply(req.message)
        return ChatResponse(**result)

    except Exception as e:
        error_msg = str(e)
        if "401" in error_msg or "403" in error_msg:
            raise HTTPException(status_code=502, detail="Invalid OpenAI API key. Check OPENAI_API_KEY in .env")
        if "429" in error_msg:
            raise HTTPException(status_code=429, detail="Rate limit hit. Credits may be exhausted.")
        result = rule_based_reply(req.message)
        return ChatResponse(**result)