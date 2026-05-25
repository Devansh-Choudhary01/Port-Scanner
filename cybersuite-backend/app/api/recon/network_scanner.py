import asyncio
import socket
import time
from fastapi import APIRouter, HTTPException
from app.models.recon_models import NetworkScanRequest, NetworkScanResponse
from app.core.security import sanitize_host, resolve_host

router = APIRouter()

# Quick-check ports used to fingerprint the host
QUICK_PORTS = [22, 80, 443, 3306, 3389, 5900, 8080, 8443]

OS_FINGERPRINT_HINTS = {
    (22, 80): "Linux/Ubuntu (SSH + HTTP)",
    (22, 443): "Linux/Nginx (SSH + HTTPS)",
    (3389,): "Windows (RDP enabled)",
    (3306,): "Linux/MySQL Server",
    (445,): "Windows (SMB/File Sharing)",
    (5900,): "macOS/Linux (VNC enabled)",
}


async def _check_port(ip: str, port: int, timeout: float = 1.5) -> bool:
    try:
        _, writer = await asyncio.wait_for(
            asyncio.open_connection(ip, port), timeout=timeout
        )
        writer.close()
        return True
    except Exception:
        return False


def _guess_os(open_ports: list[int]) -> str:
    for ports, guess in OS_FINGERPRINT_HINTS.items():
        if all(p in open_ports for p in ports):
            return guess
    return "Unknown"


@router.post("/network-scan", response_model=NetworkScanResponse, summary="Network Scanner")
async def network_scan(request: NetworkScanRequest):
    """
    Perform a lightweight network scan on a host:
    - Checks if host is alive (ICMP-like via TCP probe)
    - Tests quick-check ports
    - Provides a rough OS fingerprint
    """
    host = sanitize_host(request.host)
    ip = resolve_host(host)

    if not ip:
        raise HTTPException(status_code=404, detail=f"Could not resolve host: {host}")

    start = time.monotonic()

    # Probe quick ports simultaneously
    tasks = [_check_port(ip, p) for p in QUICK_PORTS]
    results = await asyncio.gather(*tasks)

    latency_ms = round((time.monotonic() - start) * 1000, 2)
    open_ports = [QUICK_PORTS[i] for i, ok in enumerate(results) if ok]
    is_alive = len(open_ports) > 0

    return NetworkScanResponse(
        host=host,
        ip=ip,
        is_alive=is_alive,
        latency_ms=latency_ms,
        open_ports=open_ports,
        os_guess=_guess_os(open_ports) if is_alive else None,
    )
