"""Шәкірт: src/ → dist/ (index.html + fonts + manifest + sw.js). Иконкалар мен og.png: python3 build.py --assets"""
import os, sys, json, hashlib, shutil
D = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(D, "src"); OUT = D
rd = lambda f: open(os.path.join(SRC, f), encoding="utf-8").read()
URL = "https://yersultan2000.github.io/shakirt/"
css = rd("site.css"); body = rd("body.html")
js = '"use strict";\n' + "\n".join(rd(f) for f in ["engine.js", "core.js", "landing.js", "app.js", "main.js"])
desc_kk = "Шәкірт — қатесі бар жасанды оқушыны түзету арқылы ондық бөлшектерді үйренетін веб-қосымша. Интернетсіз, тіркелусіз."
html = f"""<!DOCTYPE html>
<html lang="kk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Шәкірт — қатені түзетіп үйрен</title>
<meta name="description" content="{desc_kk}">
<meta name="theme-color" content="#F7F5EF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#111317" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="website"><meta property="og:url" content="{URL}">
<meta property="og:title" content="Шәкірт — AI жауап бермейді. Ал сен оны түзетесің.">
<meta property="og:description" content="{desc_kk}">
<meta property="og:image" content="{URL}og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="icon-192.png">
<link rel="preload" href="fonts/geist-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/geist-cyrillic.woff2" as="font" type="font/woff2" crossorigin>
<style>
{css}
</style>
</head>
<body data-mode="site">
{body}
<script>
{js}
</script>
</body>
</html>
"""
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(html)
ver = hashlib.sha1(html.encode()).hexdigest()[:10]
open(os.path.join(OUT, "sw.js"), "w").write(rd("sw.js").replace("__VERSION__", ver))
json.dump({"name": "Шәкірт", "short_name": "Шәкірт", "description": desc_kk, "lang": "kk", "start_url": "./#dashboard", "scope": "./",
           "display": "standalone", "background_color": "#F7F5EF", "theme_color": "#F7F5EF",
           "icons": [{"src": "icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
                     {"src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]},
          open(os.path.join(OUT, "manifest.webmanifest"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#F7F5EF"/><g stroke="#DCE3EE" stroke-width="1.2"><path d="M0 16h64M0 32h64M0 48h64M16 0v64M32 0v64M48 0v64"/></g><path d="M12 35c4.6 2.9 9.6 8.8 13.4 15C33 34 46.5 19.5 54 13" fill="none" stroke="#C92C1C" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
open(os.path.join(OUT, "icon.svg"), "w").write(ICON)
print("index.html", os.path.getsize(os.path.join(OUT, "index.html")), "sw", ver)

if "--assets" in sys.argv:
    from playwright.sync_api import sync_playwright
    fonts = os.path.join(OUT, "fonts")
    og = f"""<html><head><style>{css.replace('url(fonts/', 'url(file://' + fonts + '/')}
    body{{margin:0;width:1200px;height:630px;background:var(--paper)}}</style></head><body>
    <div style="position:absolute;inset:48px 56px;display:grid;grid-template-columns:1fr 520px;gap:48px;align-items:center">
     <div><div class="logo" style="font-size:34px;margin:0 0 30px"><svg style="width:46px;height:36px" viewBox="0 0 30 24"><path d="M3 13.5c2.2 1.4 4.6 4.2 6.4 7.2C13 13 19.6 6 27 2.8"/></svg>Шәкірт</div>
      <h1 style="font-size:60px;line-height:1.05;letter-spacing:-.025em;margin:0">AI жауап бермейді.<br>Ал сен оны түзетесің.</h1>
      <p style="font-size:24px;color:var(--graphite-2);margin-top:22px">Қатесі бар жасанды оқушыны түзету арқылы ондық бөлшектерді үйрен.</p></div>
     <div class="nb sheet" style="box-shadow:var(--sh)"><div class="lines gridpaper" style="padding:28px 24px 30px 70px">
      <div class="ln" style="font-size:44px"><span class="ans">0.5 + 0.7 = 0.12<svg class="ring" viewBox="0 0 100 40" preserveAspectRatio="none"><path pathLength="1" vector-effect="non-scaling-stroke" style="stroke-dashoffset:0;animation:none" d="M9 25C3 11 38 3 61 4c23 1 37 8 35 19-2 11-30 15-52 14C21 36 4 32 6 21c1-8 15-13 29-16"/></svg></span></div>
      <div class="ln"><span class="fix" style="font-size:38px;clip-path:none;animation:none">дұрысы: 1.2</span></div></div></div></div></body></html>"""
    open("/tmp/og.html", "w").write(og)
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--no-sandbox"]); pg = b.new_page(viewport={"width": 1200, "height": 630})
        pg.goto("file:///tmp/og.html"); pg.wait_for_timeout(600); pg.screenshot(path=os.path.join(OUT, "og.png"))
        for s in (192, 512):
            pg.set_viewport_size({"width": s, "height": s}); pg.set_content(f'<body style="margin:0">{ICON.replace("<svg ", f"<svg width={s} height={s} ")}</body>')
            pg.screenshot(path=os.path.join(OUT, f"icon-{s}.png"), omit_background=True)
        b.close()
    print("assets ok")
