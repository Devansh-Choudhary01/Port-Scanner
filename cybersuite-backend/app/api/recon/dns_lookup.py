import dns.resolver
import asyncio
from fastapi import APIRouter, Depends, HTTPException, Request
from app.models.recon_models import DNSRequest, DNSResponse, DNSRecord
from app.core.security import sanitize_host
from app.api.auth.auth import get_current_user
from app.core.audit import log_scan

router = APIRouter()

RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "PTR", "SRV"]


def query_record(domain: str, rtype: str) -> list[DNSRecord]:
    """Query a single DNS record type; returns empty list on NXDOMAIN/NoAnswer."""
    records = []
    try:
        answers = dns.resolver.resolve(domain, rtype, lifetime=5)
        for rdata in answers:
            records.append(DNSRecord(
                type=rtype,
                value=str(rdata),
                ttl=answers.rrset.ttl if answers.rrset else None,
            ))
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.exception.DNSException):
        pass
    return records


@router.post("/dns", response_model=DNSResponse, summary="DNS Lookup")
async def dns_lookup(
    request: DNSRequest,
    http_request: Request,
    current_user: dict = Depends(get_current_user),
):
    """Perform DNS lookups. Requires JWT auth and consent."""
    if not getattr(request, "consent_confirmed", False):
        raise HTTPException(status_code=403, detail="You must confirm authorization before scanning.")
    domain = sanitize_host(request.domain)
    client_ip = http_request.client.host if http_request.client else "unknown"
    log_scan(current_user["email"], "dns", domain, client_ip)
    rtype = request.record_type.upper() if request.record_type else "ALL"

    if rtype != "ALL" and rtype not in RECORD_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported record type. Choose from: {', '.join(RECORD_TYPES)} or ALL"
        )

    loop = asyncio.get_event_loop()

    if rtype == "ALL":
        all_records: list[DNSRecord] = []
        tasks = [
            loop.run_in_executor(None, query_record, domain, rt)
            for rt in RECORD_TYPES
        ]
        results = await asyncio.gather(*tasks)
        for r in results:
            all_records.extend(r)
        records = all_records
    else:
        records = await loop.run_in_executor(None, query_record, domain, rtype)

    if not records:
        raise HTTPException(status_code=404, detail="No DNS records found for this domain.")

    return DNSResponse(domain=domain, records=records)
