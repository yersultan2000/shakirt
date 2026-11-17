import base64, re, sys, os
import qrcode, qrcode.image.svg
D = os.path.dirname(os.path.abspath(__file__))
SITE_URL = sys.argv[1] if len(sys.argv) > 1 else "yersultan2000.github.io/shakirt"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(D, "..", "..", "pitch", "index.html")
rd = lambda p: open(os.path.join(D, p), encoding="utf-8").read()
s = rd("slides.html")
img = lambda n: "data:image/jpeg;base64," + base64.b64encode(open(os.path.join(D, "img", n + ".jpg"), "rb").read()).decode()
s = re.sub(r"\{IMG:(\w+)\}", lambda m: img(m.group(1)), s)
RING = '<svg class="ring" data-ring="{}" viewBox="0 0 100 40" preserveAspectRatio="none"><path pathLength="1" vector-effect="non-scaling-stroke" d="M9 25C3 11 38 3 61 4c23 1 37 8 35 19-2 11-30 15-52 14C21 36 4 32 6 21c1-8 15-13 29-16"/></svg>'
s = re.sub(r"\{RING:(\d)\}", lambda m: RING.format(m.group(1)), s)
ic = lambda i: f'<svg class="ic"><use href="#i-{i}"/></svg>'
F = {}
F["DOTS"] = "".join(f'<i style="aspect-ratio:1;border-radius:5px;background:{"var(--accent)" if i < 56 else "#2A3652"}"></i>' for i in range(100))
gap = [("chat", "AI-чатботтар мен тьюторлар", "Дайын жауап немесе кеңес береді.", "Мектептегі 2 жылдық сынақта Khanmigo әсері жылына 0.06–0.08 SD."),
       ("tf", "Адаптивті платформалар", "«Дұрыс» не «бұрыс» деп белгілейді.", "Қатенің себебін ашпайды. ALEKS сынағында елеулі әсер табылмады."),
       ("lens", "Диагностикалық тесттер", "Жаңылыс түсінікті табады.", "Оқушы оны өзі талдап, түзетпейді: диагноз бар, ем жоқ.")]
F["GAP"] = "".join(f'''<div class="card" style="padding:40px 42px;display:grid;gap:18px;align-content:start"><span style="width:84px;height:84px;border-radius:22px;background:var(--ink);color:#fff;display:grid;place-items:center;font-size:44px">{ic(i)}</span>
<h3 style="font-size:36px;letter-spacing:-.025em;margin-top:8px">{t}</h3><p style="font-size:26px">{a}</p><p style="font-size:23px;color:var(--accent-ink);border-top:2px dashed var(--line-2);padding-top:20px;line-height:1.4"><b>Олқылық.</b> {b}</p></div>''' for i, t, a, b in gap)
pts = [("Ерлан — жасанды оқушы", "Жаңылыс түсінігі — шын орындалатын бағдарлама. Ол әр есепте дәйекті қателеседі."),
       ("Оқушы — оның мұғалімі", "Қатені табады, себебін анықтайды, Ерланға жаңа ереже үйретеді."),
       ("Дайын жауап жоқ", "Көшіретін ештеңе жоқ, сондықтан ойлау жұмысын оқушы өзі істейді.")]
F["POINTS"] = "".join(f'''<div style="display:grid;grid-template-columns:80px 1fr;gap:10px 22px"><span class="num" style="font-size:60px;color:var(--accent)">{i+1}</span><div><h3 style="font-size:42px;letter-spacing:-.025em">{t}</h3><p style="font-size:27px;color:var(--ink-2);margin-top:12px">{d}</p></div></div>''' for i, (t, d) in enumerate(pts))
steps = [("Тексер", "Ерланның жауабы дұрыс па? Сенімділігіңе 50–100% бәс тік."), ("Болжа", "Оның келесі есепке не деп жазатынын болжа."),
         ("Диагноз қой", "Барлық жауабын түсіндіретін ережені тап."), ("Түзет", "Жаңа ережені Ерлан 5 жасырын есепте орындайды.")]
F["STEPS"] = "".join(f'''<div class="st" data-step="{i+1}"><span class="n">0{i+1}</span><div><b>{t}</b><span>{d}</span></div></div>''' for i, (t, d) in enumerate(steps))
F["SHOTS"] = "".join(f'<img class="shot" data-step="{i+1}" src="{img("s"+str(i+1))}" alt="">' for i in range(4))
def bar(label, v, col, sub=""):
    return f'''<div><div style="display:flex;justify-content:space-between;align-items:baseline;gap:20px"><span style="font-size:24px">{label}</span><b class="num" style="font-size:46px;color:{col}">{v}%</b></div><div style="height:18px;border-radius:9px;background:var(--surface-2);margin-top:10px"><i class="gx" style="display:block;height:100%;width:{v}%;background:{col};border-radius:9px"></i></div>{f'<div style="font-size:19px;color:var(--mute);margin-top:6px">{sub}</div>' if sub else ""}</div>'''
F["BAYES"] = bar("Бастапқы баға", 20, "var(--ink)") + bar("Қате жауапты 90% сеніммен «дұрыс» деді", 50, "var(--warn)") + bar("Тағы бір рет «дұрыс» деді", 80, "var(--accent)") + bar("Ал қатені 90% сеніммен тапса", 6, "var(--ok)")
ev = [(.51, "Еске түсіру практикасы"), (.42, "Аралас жаттығу"), (.41, "Теріске шығару мәтіні"), (.36, "Өнімді сәтсіздік")]
F["EVID"] = "".join(f'''<div><div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-size:28px;font-weight:600">{t}</span><b class="num" style="font-size:54px">{g:.2f}</b></div><div style="height:34px;border-radius:9px;background:var(--surface-2);margin-top:10px"><i class="gx" style="display:block;height:100%;width:{g/.6*100:.0f}%;background:var(--ink);border-radius:9px"></i></div></div>''' for g, t in ev)
mp = [("Болжа", "еске түсіру практикасы"), ("Диагноз", "теріске шығару"), ("Бәс тік", "hypercorrection · Butterfield &amp; Metcalfe, 2001"), ("Ерланды үйрет", "protégé effect · Chase т.б., 2009")]
F["MAP"] = '<p style="font-size:23px;font-weight:600;color:var(--mute);margin-bottom:6px">Раунд қадамдарымен байланысы</p>' + "".join(f'''<div style="display:flex;align-items:center;gap:18px;background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 20px"><span class="tag" style="background:var(--ink);color:#fff">{a}</span><span style="font-size:23px">{b}</span></div>''' for a, b in mp)
tech = [("Ережелер қозғалтқышы", "8 жаңылыс + 4 дұрыс ереже — шын орындалатын код"), ("Байес оқушы моделі", "Әр жауаптан кейін P(жаңылыс түсінік) жаңарады"), ("Раунд таңдау", "Күтілетін ақпарат өсімі ең жоғары қате таңдалады"), ("Калибрлеу, шеберлік", "Brier ұпайы, калибрлеу қисығы, BKT")]
arrow = '<div style="display:grid;place-items:center;font-size:40px;color:var(--mute)">→</div>'
F["TECH"] = arrow.join(f'''<div class="card" style="padding:34px 32px"><span class="num" style="font-size:30px;color:var(--accent)">0{i+1}</span><h3 style="font-size:34px;letter-spacing:-.02em;margin-top:12px;min-height:84px">{t}</h3><p style="font-size:23px;color:var(--ink-2);margin-top:12px;line-height:1.4">{d}</p></div>''' for i, (t, d) in enumerate(tech))
ts = [("1", "HTML файл, тәуелділіксіз"), ("190 КБ", "қаріптерімен бірге толық көлемі"), ("0", "сервер, API кілті, тіркелу"), ("2 400", "ереже тексерісі: 8 ереже × 300 есеп")]
F["TSTATS"] = "".join(f'''<div style="background:var(--dk);color:#fff;border-radius:24px;padding:30px 34px"><div class="num" style="font-size:80px">{a}</div><div style="font-size:22px;color:var(--dk-mute);margin-top:12px">{b}</div></div>''' for a, b in ts)
val = [("Гипотеза", "Шәкірт тобы ондық бөлшектер бойынша ұғымдық тестте бақылау тобынан жоғары нәтиже көрсетеді."), ("Өлшемдер", "Ұғымдық тест, жаңылыс түсініктер саны, калибрлеу (Brier ұпайы)."), ("Іріктеме", "d = 0.3 әсерді табу үшін топқа шамамен 176 оқушы. Алдымен 4–6 сыныпта пилот.")]
F["VAL"] = "".join(f'''<div class="card" style="padding:34px 38px"><div style="font-size:20px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-ink)">{a}</div><p style="font-size:29px;margin-top:16px;line-height:1.4">{b}</p></div>''' for a, b in val)
cols = ["Қатесі орындалатын жасанды оқушы", "Оқушының өз қатесін жанама диагноздау", "Сенімділікті калибрлеу", "Офлайн, API-сыз"]
rows = [("Khanmigo, ChatGPT оқу режимі", ["—", "—", "—", "—"]), ("Eedi", ["—", "тікелей тестпен", "—", "—"]), ("Betty's Brain", ["қатесіз агент", "—", "—", "—"]),
        ("BUGGY (1978)", ["мұғалімдерге", "—", "—", "—"]), ("ALEKS, MATHia", ["—", "білім картасы", "—", "—"])]
th = "".join(f'<th style="padding:26px 18px;font-size:22px;font-weight:600;line-height:1.3;text-align:center">{c}</th>' for c in cols)
tb = "".join(f'''<tr style="background:{"#fff" if i%2 else "var(--bg)"}"><td style="padding:21px 34px;font-size:27px;font-weight:600">{n}</td>{"".join(f'<td style="text-align:center;font-size:25px;color:{"#AAB1BF" if v=="—" else "var(--ink-2)"}">{v}</td>' for v in vs)}</tr>''' for i, (n, vs) in enumerate(rows))
me = '<tr style="background:var(--ok-soft)"><td style="padding:24px 34px;font:700 32px var(--f-d)">Шәкірт</td>' + "".join(f'<td style="text-align:center;color:var(--ok);font-size:36px">{ic("check")}</td>' for _ in cols) + "</tr>"
F["TABLE"] = f'<table style="width:100%;border-collapse:collapse"><tr style="background:var(--ink);color:#fff"><th style="padding:22px 34px;font-size:20px;text-align:left;width:30%">Өнім</th>{th}</tr>{tb}{me}</table>'
road = [("Қазір", "MVP: ондық бөлшектер, 8 жаңылыс ереже"), ("3 ай", "Бөлшектер, теріс сандар, мұғалім панелі, орыс және ағылшын тілдері"), ("6 ай", "4–6 сыныпта пилот, модельді нақты дерекпен бағалау"), ("12 ай", "Алдын ала тіркелген эксперимент, механика саласы")]
F["ROAD"] = "".join(f'''<div><i style="display:block;width:44px;height:44px;border-radius:50%;background:{"var(--accent)" if i==0 else "var(--ink)"};border:9px solid var(--bg)"></i><div class="num" style="font-size:60px;margin-top:18px;color:{"var(--accent)" if i==0 else "var(--ink)"}">{a}</div><p style="font-size:28px;color:var(--ink-2);margin-top:12px;padding-right:24px;line-height:1.4">{b}</p></div>''' for i, (a, b) in enumerate(road))
model = [("Оқушыға", "Тегін. Интернетсіз, кез келген телефонда."), ("Мектепке", "Лицензия: мұғалім панелі және сыныптың қате түсініктер картасы."), ("Баспаларға", "Тексерілген жаңылыс ережелер кітапханасы API ретінде.")]
F["MODEL"] = "".join(f'''<div class="card" style="padding:32px 36px"><div style="font-size:20px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-ink)">{a}</div><p style="font-size:30px;margin-top:14px;font-weight:600;line-height:1.35">{b}</p></div>''' for a, b in model)
asks = [("4–6 сынып", "пилотқа: 3 апта, аптасына 3 × 15 минут"), ("Мұғалімдер", "кері байланыс: Ерланның қай қатесі сыныпта жиі кездеседі"), ("Әдіскерлер", "жаңылыс ережелер кітапханасын бірге толтыру")]
F["ASKS"] = "".join(f'''<div style="display:grid;grid-template-columns:300px 1fr;gap:24px;align-items:baseline;padding:22px 0;border-top:1px solid var(--dk-line)"><b style="font:700 40px var(--f-d);letter-spacing:-.02em">{a}</b><span style="font-size:27px;color:var(--dk-mute)">{b}</span></div>''' for a, b in asks)
q = qrcode.QRCode(border=0, box_size=10, error_correction=qrcode.constants.ERROR_CORRECT_M); q.add_data("https://" + SITE_URL + "/"); q.make()
mtx = q.get_matrix(); n = len(mtx)
F["QR"] = f'<svg viewBox="0 0 {n} {n}" width="340" height="340" shape-rendering="crispEdges"><path fill="#0B1220" d="' + "".join(f"M{x} {y}h1v1h-1z" for y, r in enumerate(mtx) for x, v in enumerate(r) if v) + '"/></svg>'
for k_, v in F.items(): s = s.replace("{" + k_ + "}", v)
s = s.replace("{SITE_URL}", SITE_URL)
pg = iter(range(1, 100)); s = re.sub(r"\{PG\}", lambda m: "", s)
# page numbers: slide index
parts = s.split('<section class="slide'); s = parts[0] + "".join('<section class="slide' + p.replace('<span class="pg"></span>', f'<span class="pg">{i+1} / {len(parts)-1}</span>') for i, p in enumerate(parts[1:]))
# flow layout: content between </h2> and footer is vertically centred
def wrap(m):
    sec=m.group(0)
    if '<h2>' not in sec: return sec
    sec=re.sub(r'^<section class="slide', '<section class="slide flow', sec, count=1)
    i=sec.index('</h2>')+5; j=sec.index('<div class="foot">')
    return sec[:i]+'<div class="body">'+sec[i:j]+'</div>'+sec[j:]
s=re.sub(r'<section class="slide.*?</section>',wrap,s,flags=re.S)
left = re.findall(r"\{[A-Z_]+(?::\w+)?\}", s); assert not left, left
extra = """
.st{display:grid;grid-template-columns:62px 1fr;gap:20px;padding:24px 26px;border-radius:22px;border:1px solid transparent;transition:background .35s,border-color .35s,box-shadow .35s,opacity .35s;opacity:.5}
.st .n{width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font:700 22px var(--f-m);background:var(--surface-2);color:var(--mute);transition:all .35s}
.st b{display:block;font:700 36px var(--f-d);letter-spacing:-.02em}
.st span:not(.n){display:block;font-size:24px;color:var(--ink-2);margin-top:6px;line-height:1.35}
.slide.flow{display:flex;flex-direction:column}.slide.flow>.body{flex:1;display:flex;flex-direction:column;justify-content:center;padding-bottom:10px}.slide.flow>.body>:first-child{margin-top:40px!important}\n.shots{position:relative;height:646px;overflow:hidden;background:#F8F9FB}
.shot{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;opacity:0;transition:opacity .45s var(--ease)}
""" + "".join(f'.slide[data-k="{k}"] .st[data-step="{k+1}"]{{opacity:1;background:#fff;border-color:var(--line);box-shadow:0 18px 44px -18px rgba(11,18,32,.25)}} .slide[data-k="{k}"] .st[data-step="{k+1}"] .n{{background:var(--accent);color:#fff}} .slide[data-k="{k}"] .shot[data-step="{k+1}"]{{opacity:1}}\n' for k in range(4)) + """
.slide:not([data-k]) .st[data-step="1"],.slide:not([data-k]) .shot[data-step="1"]{opacity:1}
.bub{max-width:82%;padding:18px 26px;border-radius:24px;font-size:27px;line-height:1.4;background:var(--surface-2);border-bottom-right-radius:6px}
.bub small{display:block;font-size:17px;font-weight:600;color:var(--mute);margin-bottom:2px}
@media print{.st{opacity:1!important}.shots{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:2px}.shot{position:static;opacity:1;height:322px}}
"""
icons = """<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
<symbol id="i-chat" viewBox="0 0 24 24"><path d="M4 5h16v11h-8l-5 4v-4H4z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></symbol>
<symbol id="i-tf" viewBox="0 0 24 24"><path d="M3 13l3.5 3.5L12 10M15 9l6 6M21 9l-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-lens" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M15 15l5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></symbol>
<symbol id="erlan" viewBox="0 0 120 120"><circle cx="60" cy="60" r="60" fill="#DCE7F8"/><path d="M18 120c2-26 20-38 42-38s40 12 42 38z" fill="#2456C8"/><circle cx="60" cy="52" r="27" fill="#F2C9A5"/><path d="M32 50c-3-22 12-33 29-33 18 0 31 11 27 33-5-10-12-16-24-17-12 0-24 5-32 17z" fill="#2A2320"/><circle cx="50" cy="55" r="3.2" fill="#2A2320"/><circle cx="70" cy="55" r="3.2" fill="#2A2320"/><path d="M50 66q10 8 20 0" fill="none" stroke="#2A2320" stroke-width="2.6" stroke-linecap="round"/></symbol>
</defs></svg>"""
ui = """<div class="ui progress" aria-hidden="true"><i></i></div>
<div class="ui ctrl" role="toolbar" aria-label="Басқару"><button id="b-prev" aria-label="Алдыңғы слайд">←</button><span class="count"></span><button id="b-next" aria-label="Келесі слайд">→</button><button id="b-notes" title="Жазбалар (N)">N</button><button id="b-ov" title="Шолу (O)">O</button><button id="b-fs" title="Толық экран (F)">F</button><button id="b-help" title="Көмек (?)">?</button></div>
<div class="ui notes" aria-live="polite"></div>
<div class="ui help" role="dialog" aria-label="Пернелер"><div><kbd>→</kbd>келесі (бос орын, Enter, басу)</div><div><kbd>←</kbd>алдыңғы</div><div><kbd>N</kbd>баяндамашы жазбалары</div><div><kbd>O</kbd>барлық слайдтарға шолу</div><div><kbd>F</kbd>толық экран</div><div><kbd>Esc</kbd>жабу</div></div>"""
fonts = open(os.path.join(D, "..", "site", "fonts.css")).read()
html = f"""<!DOCTYPE html>
<html lang="kk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Шәкірт — питч</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23E5432D'/%3E%3Cpath d='M8 17l5 5 11-12' fill='none' stroke='white' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E">
<style>{fonts}
{rd("deck.css")}
{extra}</style></head>
<body>{icons}
<main class="stage" aria-roledescription="presentation">
{s}
</main>
{ui}
<script>{rd("deck.js")}</script>
</body></html>"""
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w", encoding="utf-8").write(html); print(OUT, os.path.getsize(OUT))
