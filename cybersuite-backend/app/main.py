from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# ─── Route Imports ────────────────────────────────────────────────────────────
from app.api.recon import port_scanner, subdomain_finder, whois_lookup, dns_lookup, network_scanner
from app.api.vulnscan import password_checker, website_scanner, wordpress_scanner
from app.api.exploits import sqli_tester, xss_tester
from app.api.ai import assistant
from app.api.reports import report_generator
# ─── App Init ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="CyberSuite — Production Cybersecurity Platform API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
# Recon Tools
app.include_router(port_scanner.router,      prefix="/api/recon",   tags=["Recon"])
app.include_router(subdomain_finder.router,  prefix="/api/recon",   tags=["Recon"])
app.include_router(whois_lookup.router,      prefix="/api/recon",   tags=["Recon"])
app.include_router(dns_lookup.router,        prefix="/api/recon",   tags=["Recon"])
app.include_router(network_scanner.router,   prefix="/api/recon",   tags=["Recon"])

# Vulnerability Scanners
app.include_router(password_checker.router,  prefix="/api/vulnscan", tags=["VulnScan"])
app.include_router(website_scanner.router,   prefix="/api/vulnscan", tags=["VulnScan"])
app.include_router(wordpress_scanner.router, prefix="/api/vulnscan", tags=["VulnScan"])

# Exploit Simulations (SAFE)
app.include_router(sqli_tester.router,       prefix="/api/exploits", tags=["Exploits"])
app.include_router(xss_tester.router,        prefix="/api/exploits", tags=["Exploits"])

# AI Assistant
app.include_router(assistant.router,prefix="/api/ai", tags=["AI"])

# Report Generator
app.include_router(report_generator.router,  prefix="/api/reports",  tags=["Reports"])


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
