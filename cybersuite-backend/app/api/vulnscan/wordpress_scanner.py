import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from app.models.vuln_models import WordPressScanRequest, WordPressScanResponse, WPFinding
from app.core.security import sanitize_url
from app.api.auth.auth import get_current_user
from app.core.audit import log_scan

router = APIRouter()

WP_PATHS = {
    "login_page":        "/wp-login.php",
    "xmlrpc":            "/xmlrpc.php",
    "readme":            "/readme.html",
    "wp_json":           "/wp-json/",
    "wp_content":        "/wp-content/",
    "admin":             "/wp-admin/",
    "upgrade":           "/wp-admin/upgrade.php",
    "install":           "/wp-admin/install.php",
    "wp_cron":           "/wp-cron.php",
    "license":           "/license.txt",
    "debug_log":         "/wp-content/debug.log",
}

VULNERABLE_PLUGINS = [
    "contact-form-7", "woocommerce", "elementor",
    "yoast-seo", "wpforms-lite", "all-in-one-seo-pack",
]


async def _probe(client: httpx.AsyncClient, base: str, path: str) -> tuple[str, int]:
    try:
        r = await client.get(base + path, follow_redirects=True, timeout=6)
        return path, r.status_code
    except Exception:
        return path, 0


@router.post("/wordpress-scan", response_model=WordPressScanResponse, summary="WordPress Scanner")
async def wordpress_scan(
    request: WordPressScanRequest,
    http_request: Request,
    current_user: dict = Depends(get_current_user),
):
    """Scan a WordPress site for vulnerabilities. Requires JWT auth and consent."""
    if not getattr(request, "consent_confirmed", False):
        raise HTTPException(status_code=403, detail="You must confirm authorization before scanning.")
    url = sanitize_url(request.url)
    client_ip = http_request.client.host if http_request.client else "unknown"
    log_scan(current_user["email"], "wordpress-scan", url, client_ip)

    findings: list[WPFinding] = []
    wp_version = None
    is_wordpress = False

    async with httpx.AsyncClient(timeout=8, follow_redirects=True) as client:
        # Check homepage for WP signatures
        try:
            home = await client.get(url)
            body = home.text.lower()
            if "wp-content" in body or "wp-includes" in body or "wordpress" in body:
                is_wordpress = True
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Unable to reach site: {exc}")

        if not is_wordpress:
            return WordPressScanResponse(
                url=url, is_wordpress=False,
                login_page_exposed=False, xmlrpc_enabled=False,
                readme_exposed=False, findings=[], risk_score=0,
            )

        # Probe all known paths
        tasks = [_probe(client, url, p) for p in WP_PATHS.values()]
        import asyncio
        results = dict(await asyncio.gather(*tasks))

    login_exposed     = results.get("/wp-login.php", 0) == 200
    xmlrpc_enabled    = results.get("/xmlrpc.php", 0) in (200, 405)
    readme_exposed    = results.get("/readme.html", 0) == 200
    debug_log_exposed = results.get("/wp-content/debug.log", 0) == 200
    install_exposed   = results.get("/wp-admin/install.php", 0) == 200

    if login_exposed:
        findings.append(WPFinding(
            type="config", name="Login Page Exposed",
            severity="medium", detail="wp-login.php is publicly accessible."
        ))
    if xmlrpc_enabled:
        findings.append(WPFinding(
            type="config", name="XML-RPC Enabled",
            severity="high", detail="xmlrpc.php is active — brute-force amplification risk."
        ))
    if readme_exposed:
        findings.append(WPFinding(
            type="config", name="Readme Exposed",
            severity="low", detail="readme.html may leak WP version info."
        ))
    if debug_log_exposed:
        findings.append(WPFinding(
            type="config", name="Debug Log Accessible",
            severity="critical", detail="/wp-content/debug.log is publicly readable."
        ))
    if install_exposed:
        findings.append(WPFinding(
            type="config", name="Install Script Accessible",
            severity="critical", detail="wp-admin/install.php is accessible — reinstall risk."
        ))

    # Severity → score weight
    total_risk = sum({
        "critical": 30, "high": 20, "medium": 10, "low": 5
    }.get(f.severity, 0) for f in findings)
    risk_score = min(100, total_risk)

    return WordPressScanResponse(
        url=url,
        is_wordpress=is_wordpress,
        wp_version=wp_version,
        login_page_exposed=login_exposed,
        xmlrpc_enabled=xmlrpc_enabled,
        readme_exposed=readme_exposed,
        findings=findings,
        risk_score=risk_score,
    )
