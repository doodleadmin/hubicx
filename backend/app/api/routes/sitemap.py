from fastapi import APIRouter, Request
from fastapi.responses import Response

router = APIRouter(tags=["sitemap"])

SITEMAP_URLS = [
    {"loc": "https://hubicx.ru/", "priority": "1.0", "changefreq": "weekly"},
    {"loc": "https://hubicx.ru/#features", "priority": "0.8", "changefreq": "monthly"},
    {"loc": "https://hubicx.ru/#templates", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "https://hubicx.ru/#live", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "https://hubicx.ru/#models", "priority": "0.8", "changefreq": "monthly"},
    {"loc": "https://hubicx.ru/#pricing", "priority": "0.9", "changefreq": "weekly"},
    {"loc": "https://hubicx.ru/#faq", "priority": "0.6", "changefreq": "monthly"},
    # Blog
    {"loc": "https://hubicx.ru/blog/", "priority": "0.8", "changefreq": "weekly"},
    {"loc": "https://hubicx.ru/blog/ai-foto-gid", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "https://hubicx.ru/blog/neiroseti-2026", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "https://hubicx.ru/blog/ai-chat-boty", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "https://hubicx.ru/blog/video-iz-teksta", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "https://hubicx.ru/blog/30-rilsov-za-vecher", "priority": "0.7", "changefreq": "monthly"},
    {"loc": "https://hubicx.ru/blog/10-priemov-promptinga", "priority": "0.7", "changefreq": "monthly"},
    # Pages
    {"loc": "https://hubicx.ru/pages/contacts", "priority": "0.5", "changefreq": "monthly"},
    {"loc": "https://hubicx.ru/pages/help", "priority": "0.6", "changefreq": "monthly"},
    {"loc": "https://hubicx.ru/pages/terms", "priority": "0.4", "changefreq": "yearly"},
    {"loc": "https://hubicx.ru/pages/privacy", "priority": "0.4", "changefreq": "yearly"},
]


@router.get("/sitemap.xml", response_class=Response)
async def sitemap(request: Request):
    """Generate sitemap.xml for search engines."""
    host = str(request.base_url).rstrip("/")
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    for url in SITEMAP_URLS:
        loc = url["loc"]
        # If the URL is relative to the host, make it absolute using the request's base URL
        if loc.startswith("/"):
            loc = host + loc
        xml += "  <url>\n"
        xml += f"    <loc>{loc}</loc>\n"
        xml += f"    <priority>{url['priority']}</priority>\n"
        xml += f"    <changefreq>{url['changefreq']}</changefreq>\n"
        xml += "  </url>\n"
    xml += "</urlset>"
    return Response(content=xml, media_type="application/xml")
