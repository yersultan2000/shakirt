# Шәкірт: сайт пен қосымшаның браузерлік тесті.  pip install playwright && playwright install chromium && python tests/test_site.py
from playwright.sync_api import sync_playwright
import os
import pathlib
ROOT=pathlib.Path(__file__).resolve().parent.parent
U=(ROOT/'index.html').as_uri(); O=str(ROOT/'tests'/'shots'); os.makedirs(O,exist_ok=True)
errs=[]
def play_round(pg, wrong_first=False, accept=None, conf=80):
    truth=pg.evaluate("()=>{const R=__R();return __E.isRight(R.t1,__E.solve(R.bug,R.t1))}")
    say=truth if accept is None else accept
    pg.click(f'[data-j="{"true" if say else "false"}"]')
    pg.evaluate(f"()=>{{const e=document.querySelector('#cf');e.value={conf};e.dispatchEvent(new Event('input'))}}")
    pg.click('#go'); pg.click('#go')
    idx=pg.evaluate("""()=>{const R=__R();const a=__E.solve(R.bug,R.t2);return R.opts2.findIndex(x=>R.tp==='cmp'?x===a:(__E.D.eq(x,a)&&(x.raw||'')===(a.raw||'')))}""")
    assert idx>=0
    pg.click(f'[data-p="{idx}"]'); pg.click('#go')
    bug=pg.evaluate("()=>__R().bug"); tp=pg.evaluate("()=>__R().tp")
    pg.click(f'[data-d="{bug}"]'); pg.click('#go'); pg.click('#go')
    if wrong_first:
        pg.click(f'[data-f="{bug}"]'); pg.click('#run'); assert pg.locator('#again').count()==0
    pg.click(f'[data-f="{tp}_ok"]'); pg.click('#run'); assert pg.locator('#again').count()==1
    return bug
with sync_playwright() as p:
    b=p.chromium.launch(args=['--no-sandbox'])
    c=b.new_context(viewport={'width':1440,'height':900},device_scale_factor=1)
    pg=c.new_page(); pg.set_default_timeout(4000)
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
    pg.goto(U); pg.wait_for_timeout(400)
    pg.screenshot(path=f'{O}/d_hero.png')
    # demo
    pg.click('#demo [data-dj="false"]'); pg.click('#dgo'); pg.wait_for_timeout(500); pg.screenshot(path=f'{O}/d_hero2.png')
    pg.click('#dnext')
    # library filter + modal
    pg.click('#chips [data-f="mul"]'); vis=pg.evaluate("()=>[...document.querySelectorAll('.bug')].filter(x=>getComputedStyle(x).display!=='none').length"); print('mul cards',vis)
    pg.click('#chips [data-f="all"]'); pg.locator('#library').scroll_into_view_if_needed(); pg.wait_for_timeout(500); pg.screenshot(path=f'{O}/d_lib.png')
    pg.click('.bug[data-bug="add_sep"]'); pg.wait_for_timeout(400); pg.screenshot(path=f'{O}/d_modal.png')
    pg.keyboard.press('Escape'); assert pg.locator('.modal').count()==0
    pg.click('.bug[data-bug="m10_int"]'); pg.click('#mgo'); pg.wait_for_timeout(200)
    print('forced', pg.evaluate("()=>__R().bug"), pg.evaluate("()=>document.body.dataset.mode"))
    play_round(pg, wrong_first=True)
    pg.wait_for_timeout(700); pg.screenshot(path=f'{O}/a_done.png', full_page=True)
    seen=set()
    for i in range(10):
        pg.click('#again'); pg.wait_for_timeout(50)
        seen.add(play_round(pg, accept=(True if i%3==0 else None), conf=[90,60,80,70,100][i%5], wrong_first=(i%4==1)))
    print('bugs', len(seen))
    pg.click('#again'); pg.click('[data-j="false"]'); pg.wait_for_timeout(300); pg.screenshot(path=f'{O}/a_step1.png')
    pg.click('#go'); pg.wait_for_timeout(300); pg.click('#go'); pg.wait_for_timeout(300); pg.screenshot(path=f'{O}/a_step2.png')
    pg.goto(U+'#dashboard'); pg.wait_for_timeout(600); pg.screenshot(path=f'{O}/a_dash.png', full_page=True)
    pg.goto(U+'#mirror'); pg.wait_for_timeout(500); pg.screenshot(path=f'{O}/a_mirror.png')
    pg.goto(U+'#how'); pg.wait_for_timeout(900); pg.click('[data-s="3"]'); pg.wait_for_timeout(700); pg.screenshot(path=f'{O}/d_how.png')
    pg.goto(U); pg.wait_for_timeout(300); pg.screenshot(path=f'{O}/d_full.png', full_page=True)
    root=c.storage_state()
    m=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,storage_state=root, color_scheme='dark')
    mp=m.new_page(); mp.on('pageerror',lambda e:errs.append('m:'+str(e)))
    mp.goto(U); mp.wait_for_timeout(400); mp.screenshot(path=f'{O}/m_hero.png')
    print('overflow site', mp.evaluate("()=>document.documentElement.scrollWidth-innerWidth"))
    mp.screenshot(path=f'{O}/m_full.png', full_page=True)
    mp.goto(U+'#lesson'); mp.click('[data-j="false"]'); mp.wait_for_timeout(300); mp.screenshot(path=f'{O}/m_lesson.png')
    print('overflow app', mp.evaluate("()=>document.documentElement.scrollWidth-innerWidth"))
    mp.goto(U+'#dashboard'); mp.wait_for_timeout(400); mp.screenshot(path=f'{O}/m_dash.png', full_page=True)
    print('errors', errs); b.close()
    assert not errs, errs
