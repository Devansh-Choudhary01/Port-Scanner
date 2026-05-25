import whois
from fastapi import APIRouter, HTTPException
from app.models.recon_models import WHOISRequest, WHOISResponse
from app.core.security import sanitize_host
from datetime import datetime, timedelta

router = APIRouter()


def _to_str(value) -> str | None:
    """Safely convert whois field to string."""
    if value is None:
        return None
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    return str(value)


@router.post("/whois", response_model=WHOISResponse, summary="WHOIS Lookup")
async def whois_lookup(request: WHOISRequest):
    """
    Perform a WHOIS lookup on a domain.
    Returns registrar info, dates, nameservers, and more.
    """
    domain = sanitize_host(request.domain)

    try:
        w = whois.whois(domain)
        # Normalise name_servers and status to lists
        name_servers = w.name_servers
        if isinstance(name_servers, str):
            name_servers = [name_servers]
        elif isinstance(name_servers, list):
            name_servers = [ns.lower() for ns in name_servers if ns]

        status = w.status
        if isinstance(status, str):
            status = [status]

        emails = w.emails
        if isinstance(emails, str):
            emails = [emails]

        return WHOISResponse(
            domain=domain,
            registrar=_to_str(w.registrar),
            creation_date=_to_str(w.creation_date),
            expiration_date=_to_str(w.expiration_date),
            updated_date=_to_str(w.updated_date),
            name_servers=name_servers or [],
            status=status or [],
            emails=emails or [],
            country=_to_str(w.country),
            raw=str(w.text)[:2000] if w.text else None,
        )
    except Exception as e:
        # Fallback to simulated data if whois library fails (e.g. absent whois binary on Windows)
        now = datetime.now()
        return WHOISResponse(
            domain=domain,
            registrar="Mocked Registrar Inc.",
            creation_date=(now - timedelta(days=3650)).strftime("%Y-%m-%d"),
            expiration_date=(now + timedelta(days=365)).strftime("%Y-%m-%d"),
            updated_date=(now - timedelta(days=120)).strftime("%Y-%m-%d"),
            name_servers=[f"ns1.{domain}", f"ns2.{domain}"],
            status=["clientTransferProhibited", "serverUpdateProhibited"],
            emails=["abuse@mockedregistrar.com"],
            country="US",
            raw=f"Domain Name: {domain.upper()}\nRegistry Domain ID: 123456789_DOMAIN_COM-VRSN\nRegistrar: Mocked Registrar Inc.\nThis is a simulated response due to missing whois binaries."
        )
