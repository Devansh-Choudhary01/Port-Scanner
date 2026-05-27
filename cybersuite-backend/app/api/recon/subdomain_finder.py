import asyncio
import socket
from fastapi import APIRouter, Depends, HTTPException, Request
from app.models.recon_models import SubdomainRequest, SubdomainResponse, SubdomainResult
from app.core.security import sanitize_host
from app.api.auth.auth import get_current_user
from app.core.audit import log_scan

router = APIRouter()

# Built-in wordlist — production would use a large external list
SUBDOMAIN_WORDLIST = [
    "www", "mail", "ftp", "admin", "api", "dev", "staging", "test",
    "portal", "app", "secure", "login", "dashboard", "blog", "shop",
    "cdn", "static", "assets", "media", "images", "docs", "support",
    "help", "status", "monitor", "vpn", "remote", "smtp", "pop", "imap",
    "mx", "ns1", "ns2", "dns", "webmail", "cpanel", "whm", "git",
    "gitlab", "jenkins", "jira", "confluence", "wiki", "forum", "community",
    "beta", "alpha", "internal", "intranet", "extranet", "backend", "v1", "v2",
]


async def check_subdomain(subdomain: str, domain: str) -> SubdomainResult:
    """DNS resolve a subdomain to check if it is alive."""
    fqdn = f"{subdomain}.{domain}"
    loop = asyncio.get_event_loop()
    try:
        ip = await loop.run_in_executor(None, socket.gethostbyname, fqdn)
        return SubdomainResult(subdomain=fqdn, ip=ip, status="alive")
    except socket.gaierror:
        return SubdomainResult(subdomain=fqdn, ip=None, status="dead")


@router.post("/subdomain-finder", response_model=SubdomainResponse, summary="Subdomain Enumerator")
async def subdomain_finder(
    request: SubdomainRequest,
    http_request: Request,
    current_user: dict = Depends(get_current_user),
):
    """Enumerate subdomains. Requires JWT auth and consent."""
    if not getattr(request, "consent_confirmed", False):
        raise HTTPException(status_code=403, detail="You must confirm authorization before scanning.")
    domain = sanitize_host(request.domain)
    client_ip = http_request.client.host if http_request.client else "unknown"
    log_scan(current_user["email"], "subdomain-finder", domain, client_ip)


    semaphore = asyncio.Semaphore(50)

    async def limited_check(sub: str) -> SubdomainResult:
        async with semaphore:
            return await check_subdomain(sub, domain)

    tasks = [limited_check(sub) for sub in SUBDOMAIN_WORDLIST]
    results = await asyncio.gather(*tasks)

    alive = [r for r in results if r.status == "alive"]

    return SubdomainResponse(
        domain=domain,
        found=alive,
        total_checked=len(results),
        total_found=len(alive),
    )
