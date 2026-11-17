"""Шәкірт: браузерлік тест.  python3 -m http.server -d dist 8765 &  python3 tests/test_site.py"""
import os, sys, pathlib
from playwright.sync_api import sync_playwright
U = os.environ.get("SHAKIRT_URL", "http://localhost:8765/")
OUT = pathlib.Path(__file__).parent / "shots"; OUT.mkdir(exist_ok=True)
errs = []
def play(pg, wrong_diag=False, wrong_build=False, accept=None, conf=80, shots=None):
    truth = pg.evaluate("()=>{const R=__R();return __E.isRight(R.t1,__E.solve(R.bug,R.t1))}")
    say = truth if accept is None else accept
    pg.click(f'[data-j="{"true" if say else "false"}"]'); pg.click(f'[data-c="{conf}"]')
    if shots: pg.screenshot(path=f"{OUT}/{shots}_1a.png")
    pg.click("#go"); pg.wait_for_timeout(700)
    if shots: pg.screenshot(path=f"{OUT}/{shots}_1b.png", full_page=True)
    pg.click("#go")
    idx = pg.evaluate("""()=>{const R=__R();const a=__E.solve(R.bug,R.t2);return R.opts2.findIndex(x=>R.tp==='cmp'?x===a:(__E.D.eq(x,a)&&(x.raw||'')===(a.raw||'')))}""")
    assert idx >= 0, "Erlan answer missing from options"
    pg.click('[data-hl="0"]'); pg.click(f'[data-p="{idx}"]')
    if shots: pg.screenshot(path=f"{OUT}/{shots}_2.png", full_page=True)
    pg.click("#go")
    bug = pg.evaluate("()=>__R().bug")
    if wrong_diag:
        other = pg.evaluate("()=>__R().cards.find(c=>c!==__R().bug)")
        pg.click(f'[data-d="{other}"]'); pg.wait_for_timeout(700)
        assert pg.locator("#go").count() == 0, "wrong diagnosis must not advance"
        if shots: pg.screenshot(path=f"{OUT}/{shots}_3hint.png", full_page=True)
    pg.click(f'[data-d="{bug}"]'); pg.wait_for_timeout(200)
    if shots: pg.screenshot(path=f"{OUT}/{shots}_3.png", full_page=True)
    pg.click("#go")
    if shots: pg.screenshot(path=f"{OUT}/{shots}_4a.png", full_page=True)
    if wrong_build:
        pg.click("#run"); pg.wait_for_timeout(900)
        assert pg.locator("#again").count() == 0, "Erlan's own rule must fail"
        if shots: pg.screenshot(path=f"{OUT}/{shots}_4fail.png", full_page=True)
    pg.click('[data-sw="0:0"]'); pg.click('[data-sw="1:0"]'); pg.click("#run"); pg.wait_for_timeout(900)
    assert pg.locator("#again").count() == 1, "correct build must pass"
    if shots: pg.screenshot(path=f"{OUT}/{shots}_4ok.png", full_page=True)
    return bug
with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox"])
    c = b.new_context(viewport={"width": 1440, "height": 900}, color_scheme="light")
    pg = c.new_page(); pg.set_default_timeout(5000)
    pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.goto(U); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(800)
    pg.screenshot(path=f"{OUT}/hero.png")
    # demo: nudge, keyboard, bet
    pg.click("#dgo", force=True); assert pg.locator("#demo [role=alert]").count() == 1
    pg.focus('[data-key="djtrue"]'); pg.keyboard.press("2"); pg.keyboard.press("ArrowRight")
    assert pg.evaluate("()=>document.activeElement&&document.activeElement.dataset.key")  # focus kept
    pg.click("#dgo"); pg.wait_for_timeout(800); pg.screenshot(path=f"{OUT}/hero_done.png")
    pg.click("#dnext")
    pg.goto(U + "#how"); pg.wait_for_timeout(600); pg.mouse.wheel(0, 900); pg.wait_for_timeout(700); pg.screenshot(path=f"{OUT}/how.png")
    pg.click('#filters [data-f="mul"]'); n = pg.evaluate("()=>[...document.querySelectorAll('.irow')].filter(x=>getComputedStyle(x).display!=='none').length"); assert n == 2, n
    pg.click('#filters [data-f="all"]'); pg.locator("#library").scroll_into_view_if_needed(); pg.wait_for_timeout(300); pg.screenshot(path=f"{OUT}/library.png")
    pg.click('.irow[data-bug="add_sep"]'); pg.wait_for_timeout(400); pg.screenshot(path=f"{OUT}/modal.png")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300); assert pg.locator(".modal").count() == 0
    pg.click('.irow[data-bug="cmp_long"]'); pg.click("#mgo"); pg.wait_for_timeout(300)
    assert pg.evaluate("()=>__R().bug") == "cmp_long"
    pg.screenshot(path=f"{OUT}/lesson_intro.png")
    # persistence mid-round
    pg.click('[data-j="false"]'); pg.click("#go"); pg.reload(); pg.wait_for_timeout(500)
    assert pg.evaluate("()=>__R().locked") is True, "round state must survive reload"
    pg.click("#go")  # to step 2
    pg.evaluate("()=>{const R=__R();R.step=1;R.locked=false;R.judge=null}"); pg.goto(U + "#dashboard"); pg.goto(U + "#lesson"); pg.wait_for_timeout(200)
    play(pg, wrong_diag=True, wrong_build=True, shots="r")
    seen = set()
    for i in range(10):
        pg.click("#again"); pg.wait_for_timeout(60)
        seen.add(play(pg, accept=(True if i % 3 == 0 else None), conf=[90, 60, 80, 70, 100][i % 5], wrong_diag=(i % 4 == 1), wrong_build=(i % 3 == 2)))
    print("bugs covered", len(seen))
    pg.goto(U + "#dashboard"); pg.wait_for_timeout(600); pg.screenshot(path=f"{OUT}/dashboard.png", full_page=True)
    pg.goto(U + "#mirror"); pg.wait_for_timeout(500); pg.screenshot(path=f"{OUT}/mirror.png", full_page=True)
    # language
    pg.goto(U); pg.wait_for_timeout(300); pg.click('[data-lang="ru"]'); pg.wait_for_timeout(300)
    h1 = pg.inner_text(".hero h1"); assert "ИИ" in h1, h1
    pg.screenshot(path=f"{OUT}/ru_full.png", full_page=True)
    print("page height", pg.evaluate("document.documentElement.scrollHeight"))
    pg.goto(U + "#lesson"); pg.wait_for_timeout(300); pg.screenshot(path=f"{OUT}/ru_lesson.png")
    pg.click('[data-lang="kk"]')
    pg.goto(U); pg.wait_for_timeout(300); pg.screenshot(path=f"{OUT}/full.png", full_page=True)
    st = c.storage_state()
    for scheme in ["light", "dark"]:
        m = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, color_scheme=scheme, storage_state=st)
        mp = m.new_page(); mp.on("pageerror", lambda e: errs.append("m:" + str(e)))
        mp.goto(U); mp.wait_for_timeout(500); mp.screenshot(path=f"{OUT}/m_{scheme}_hero.png")
        assert mp.evaluate("document.documentElement.scrollWidth-innerWidth") <= 0, "horizontal overflow"
        mp.click("#menuBtn"); mp.wait_for_timeout(200); mp.screenshot(path=f"{OUT}/m_{scheme}_menu.png"); mp.click('.menu a[href="#library"]'); mp.wait_for_timeout(600)
        mp.screenshot(path=f"{OUT}/m_{scheme}_full.png", full_page=True)
        mp.goto(U + "#lesson"); mp.wait_for_timeout(300); mp.click('[data-j="false"]'); mp.wait_for_timeout(500); mp.screenshot(path=f"{OUT}/m_{scheme}_lesson.png")
        assert mp.evaluate("document.documentElement.scrollWidth-innerWidth") <= 0, "horizontal overflow app"
        mp.goto(U + "#dashboard"); mp.wait_for_timeout(400); mp.screenshot(path=f"{OUT}/m_{scheme}_dash.png", full_page=True)
        m.close()
    print("errors", errs); b.close()
    assert not errs, errs
print("OK")
