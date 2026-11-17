/* ============================================================
   Шәкірт — ортақ интерфейс: тіл, тақырып, мәзір, модаль, тост,
   Ерлан, дәптер жолдары, маршрут.
   ============================================================ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ic=(id,cls="")=>`<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const pct=x=>Math.round(x*100)+"%";
const REDUCED=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};

/* ---------------- Тіл ---------------- */
let LANG=store.get("shakirt_lang")||"kk";
const L=(kk,ru)=>LANG==="ru"?ru:kk;
const RT=r=>RULES[r][LANG];
const TN=tp=>TOPICS[tp].name[LANG], TS=tp=>TOPICS[tp].short[LANG], TQ=t=>TOPICS[t.tp].q[LANG](t);
function applyStatic(){
  document.documentElement.lang=LANG==="ru"?"ru":"kk";
  $$("[data-ru]").forEach(el=>{ if(el.dataset.kk===undefined) el.dataset.kk=el.innerHTML; el.innerHTML=LANG==="ru"?el.dataset.ru:el.dataset.kk; });
  $$("[data-ru-aria]").forEach(el=>{ if(el.dataset.kkAria===undefined) el.dataset.kkAria=el.getAttribute("aria-label")||""; el.setAttribute("aria-label",LANG==="ru"?el.dataset.ruAria:el.dataset.kkAria); });
  $$("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===LANG));
}
function setLang(l){ if(l===LANG) return; LANG=l; store.set("shakirt_lang",l); applyStatic(); paintChrome(); renderAll(); }
$$("[data-lang]").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));

/* ---------------- Тақырып, дыбыс, тақта ---------------- */
const root=document.documentElement;
{const th=store.get("shakirt_theme"); if(th) root.dataset.theme=th;}
const isDark=()=>root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;
function paintChrome(){
  $("#theme").innerHTML=ic(isDark()?"sun":"moon");
  $("#theme").setAttribute("aria-label",isDark()?L("Жарық тақырып","Светлая тема"):L("Қараңғы тақырып","Тёмная тема"));
  $("#snd").innerHTML=ic(S.sound?"vol":"mute"); $("#snd").setAttribute("aria-pressed",S.sound);
  $("#snd").setAttribute("aria-label",S.sound?L("Дыбысты өшіру","Выключить звук"):L("Дыбысты қосу","Включить звук"));
  $$('meta[name="theme-color"]').forEach(m=>m.remove());
  const m=document.createElement("meta"); m.name="theme-color"; m.content=isDark()?"#111317":"#F7F5EF"; document.head.append(m);
}
$("#theme").onclick=()=>{root.dataset.theme=isDark()?"light":"dark";store.set("shakirt_theme",root.dataset.theme);paintChrome()};
$("#snd").onclick=()=>{S.sound=!S.sound;S.askedSound=true;save();paintChrome();toast(S.sound?L("Дыбыс қосылды","Звук включён"):L("Дыбыс өшірілді","Звук выключен"))};
addEventListener("scroll",()=>$("#top").classList.toggle("stuck",scrollY>4),{passive:true});
const live=msg=>{const el=$("#live");el.textContent="";requestAnimationFrame(()=>{el.textContent=msg})};

/* ---------------- Модаль ---------------- */
let lastFocus=null;
function openModal(html,onMount){
  lastFocus=document.activeElement;
  $("#modal").innerHTML=`<div class="scrim"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">${html}</div></div>`;
  document.body.style.overflow="hidden";
  const m=$(".modal");m.addEventListener("click",e=>e.stopPropagation());
  $(".scrim").addEventListener("click",closeModal);
  $$("[data-x]",m).forEach(b=>b.onclick=closeModal);
  onMount&&onMount(m); ($("[data-x]",m)||m).focus();
}
function closeModal(){const s=$(".scrim"); if(!s) return; s.classList.add("out");
  setTimeout(()=>{$("#modal").innerHTML="";document.body.style.overflow="";lastFocus&&lastFocus.focus&&lastFocus.focus()},REDUCED()?0:150)}
function trap(e,box){const f=$$("button:not(:disabled),a[href],input",box);if(!f.length)return;const a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
addEventListener("keydown",e=>{
  const m=$(".modal"), mn=$(".menu");
  if(m){ if(e.key==="Escape") closeModal(); if(e.key==="Tab") trap(e,m); return; }
  if(mn){ if(e.key==="Escape") closeMenu(); if(e.key==="Tab") trap(e,mn); }
});
const closeBtn=()=>`<button class="iconbtn" data-x aria-label="${L("Жабу","Закрыть")}">${ic("cross")}</button>`;

/* ---------------- Мобильді мәзір ---------------- */
function openMenu(){
  $("#menu").innerHTML=`<div class="menu" role="dialog" aria-modal="true" aria-label="${L("Мәзір","Меню")}">
   <div class="menu-h"><span class="logo" style="margin:0"><svg aria-hidden="true"><use href="#logo-tick"/></svg>Шәкірт</span><button class="iconbtn" id="menuX" aria-label="${L("Жабу","Закрыть")}">${ic("cross")}</button></div>
   <nav>${[["how",L("Қалай жұмыс істейді","Как работает")],["library",L("Ерланның қателері","Ошибки Ерлана")],["science",L("Ғылым","Наука")],["faq",L("Сұрақтар","Вопросы")]].map(([h,t])=>`<a href="#${h}">${t}${ic("arrow")}</a>`).join("")}</nav>
   <div class="foot"><a class="btn primary lg" href="#dashboard">${L("Қосымшаны ашу","Открыть приложение")}</a><a class="btn quiet lg" href="#lesson">${L("Ерланды түзету","Исправить Ерлана")}</a></div></div>`;
  document.body.style.overflow="hidden"; $("#menuBtn").setAttribute("aria-expanded","true");
  $("#menuX").onclick=closeMenu; $$(".menu a").forEach(a=>a.addEventListener("click",closeMenu)); $("#menuX").focus();
}
function closeMenu(){ if(!$(".menu")) return; $("#menu").innerHTML=""; document.body.style.overflow=""; $("#menuBtn").setAttribute("aria-expanded","false"); $("#menuBtn").focus(); }
$("#menuBtn").onclick=openMenu;

/* ---------------- Тост ---------------- */
function toast(msg,action){const t=document.createElement("div");t.className="toast";t.innerHTML=`<span>${esc(msg)}</span>`;
  if(action){const b=document.createElement("button");b.textContent=action.label;b.onclick=()=>{action.run();t.remove()};t.append(b)}
  $("#toasts").append(t);setTimeout(()=>{t.classList.add("out");setTimeout(()=>t.remove(),160)},action?6000:2600)}

/* ---------------- Ерлан: 4 бет-әлпет ---------------- */
const FACES={
  sure:   {br:"M33 43l10-1.5M57 41.5l10 1.5", ey:`<circle cx="40" cy="52" r="2.6"/><circle cx="60" cy="52" r="2.6"/>`, mo:"M41 66q9 4.5 19-2"},
  puzzled:{br:"M33 41.5l10 2.5M57 44l10-3.5", ey:`<circle cx="40" cy="52" r="2.6"/><circle cx="60" cy="52" r="2.6"/>`, mo:"M41 67q3-3 6 0t6 0t6 0"},
  corrected:{br:"M33 39.5l10-2M57 37.5l10 2", ey:`<circle cx="40" cy="52" r="4" fill="none"/><circle cx="60" cy="52" r="4" fill="none"/><circle cx="40" cy="52" r="1.4"/><circle cx="60" cy="52" r="1.4"/>`, mo:"M50 63.5a3.6 3.6 0 1 0 .01 0"},
  proud:  {br:"M33 42l10-1.5M57 40.5l10 1.5", ey:`<path d="M36 53q4-5 8 0M56 53q4-5 8 0" fill="none"/>`, mo:"M40 63q10 10 20 0"}
};
function erlan(expr="sure",label){const f=FACES[expr]||FACES.sure;
  return `<svg viewBox="0 0 100 100" ${label?`role="img" aria-label="${esc(label)}"`:'aria-hidden="true"'} style="color:var(--ink)">
  <circle cx="50" cy="50" r="49" fill="var(--ink-soft)"/>
  <g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
   <path d="M17 99c3-14 16-20 33-20s30 6 33 20"/><circle cx="50" cy="51" r="25" fill="var(--sheet)"/>
   <path d="M25 46c1-16 12-23 25-23s25 7 26 23c-7-8-15-12-26-12s-19 4-25 12z" fill="currentColor"/>
   <path d="${f.br}"/><path d="${f.mo}"/></g>
  <g fill="currentColor" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">${f.ey}</g></svg>`;}
const FACE_LABEL=()=>({sure:L("Ерлан: өзіне сенімді","Ерлан: уверен в себе"),puzzled:L("Ерлан: аңырып қалды","Ерлан: озадачен"),corrected:L("Ерлан: қатесін көрді","Ерлан: увидел ошибку"),proud:L("Ерлан: мақтанышпен","Ерлан: гордится")});

/* ---------------- Дәптер ---------------- */
const RING='<svg class="ring" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" vector-effect="non-scaling-stroke" d="M9 25C3 11 38 3 61 4c23 1 37 8 35 19-2 11-30 15-52 14C21 36 4 32 6 21c1-8 15-13 29-16"/></svg>';
const TICK='<svg class="tickmark" viewBox="0 0 30 24" width="30" height="24" aria-hidden="true"><path pathLength="1" d="M3 13.5c2.2 1.4 4.6 4.2 6.4 7.2C13 13 19.6 6 27 2.8"/></svg>';
/* items: [{text, ring, strike, ok (true→tick, false→«қате»), fix, hl, btn}] */
function nb({items,face="sure",title="",right=""}){
  return `${title?`<div class="nb-title"><span>${title}</span>${right}</div>`:""}<div class="lines gridpaper">
   <div class="who">${erlan(face,FACE_LABEL()[face])}<span class="name">Ерлан</span></div>
   ${items.map((x,i)=>`<div class="ln${x.hl?" hl":""}" data-line="${i}">${x.btn?`<button class="ans" data-hl="${i}" aria-pressed="${!!x.hl}">`:`<span class="ans">`}${esc(x.text)}${x.ring?RING:""}${x.strike?'<i class="strike" aria-hidden="true"></i>':""}${x.btn?"</button>":"</span>"}${x.ok===true?TICK:x.ok===false?`<span class="mark">${L("қате","неверно")}</span>`:""}${x.fix?`<span class="fix">${esc(x.fix)}</span>`:""}</div>`).join("")}
  </div>`;
}
const lineOf=(rule,t)=>{const a=solve(rule,t);return {text:fmt(t,a),okv:isRight(t,a),a}};
const rightAns=t=>D.str(solve(okRule(t.tp),t));
const fixText=t=>t.tp==="cmp"?`${L("дұрысы","верно")}: ${fmt(t,solve("cmp_ok",t))}`:`${L("дұрысы","верно")}: ${rightAns(t)}`;
const STAMP=()=>`<svg class="stamp" viewBox="0 0 160 160" role="img" aria-label="${L("Түзелді 5/5","Исправлено 5/5")}"><g fill="none" stroke="var(--pen)" stroke-width="4"><circle cx="80" cy="80" r="70"/><circle cx="80" cy="80" r="58" stroke-width="1.6"/></g>
 <text x="80" y="76" text-anchor="middle" font-family="Geist,sans-serif" font-weight="700" font-size="${LANG==="ru"?19:22}" fill="var(--pen)">${L("Түзелді","Исправлено")}</text><text x="80" y="108" text-anchor="middle" font-family="Geist Mono,monospace" font-weight="600" font-size="26" fill="var(--pen)">5/5</text></svg>`;
const pts=n=>(n>0?"+":n<0?"−":"")+Math.abs(n);

/* ---------------- Ереже карточкасы (модаль) ---------------- */
function openRule(b){
  const tp=RULES[b].topic;
  const body=()=>{const [hit,miss]=BUGGEN[b];const ts=shuffle([genTask(tp,hit),genTask(tp,hit),genTask(tp,hit),genTask(tp,miss)]);
    return `<div class="nb">${nb({items:ts.map(t=>{const l=lineOf(b,t);return {text:l.text,ok:l.okv?true:false,fix:l.okv?"":fixText(t)}}),face:"sure",title:L("Ерлан осы ережемен шығарады","Ерлан решает по этому правилу")})}</div>`};
  openModal(`<div class="modal-h"><div class="stack" style="gap:6px"><span class="tag">${TN(tp)}</span><h2 class="d-h3" id="mt">${RT(b).short}</h2></div>${closeBtn()}</div>
   <p><b>${L("Ерланның ережесі","Правило Ерлана")}:</b> ${RT(b).desc}</p><div id="mnote">${body()}</div>
   <div class="fb"><b>${L("Неге қате","Почему неверно")}.</b> ${RT(b).why}</div>
   <div class="row"><button class="btn primary" id="mgo">${L("Осы қатемен раунд бастау","Начать раунд с этой ошибкой")}</button><button class="link" id="mre">${ic("refresh")}${L("Жаңа мысалдар","Новые примеры")}</button></div>`,
   m=>{$("#mre",m).onclick=()=>{$("#mnote").innerHTML=body()};$("#mgo",m).onclick=()=>{closeModal();forcedBug=b;if(location.hash==="#lesson")route();else location.hash="lesson"}});
}

/* ---------------- Маршрут ---------------- */
let forcedBug=null;
const APP={};
function setMode(mode,fn){
  const go=()=>{document.body.dataset.mode=mode;fn()};
  if(document.body.dataset.mode!==mode&&document.startViewTransition&&!REDUCED()) document.startViewTransition(go); else go();
}
function route(){
  const h=location.hash.slice(1);
  if(APP[h]){
    setMode("app",()=>{
      APP[h](true); scrollTo(0,0);
      $$("[data-go]").forEach(a=>a.dataset.go===h?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current"));
      document.title=({dashboard:L("Басты","Главная"),lesson:L("Сабақ","Урок"),mirror:L("Айна","Зеркало")})[h]+" · Шәкірт";
      $("#logo").setAttribute("href","#dashboard");
    });
  } else {
    const wasApp=document.body.dataset.mode==="app";
    setMode("site",()=>{
      document.title=L("Шәкірт — қатені түзетіп үйрен","Шәкірт — учись, исправляя ошибки"); $("#logo").setAttribute("href","#home"); renderMirrorPrev();
      const el=h&&h!=="home"&&document.getElementById(h);
      if(el) requestAnimationFrame(()=>el.scrollIntoView({behavior:wasApp||REDUCED()?"auto":"smooth"})); else if(wasApp||h==="home") scrollTo(0,0);
    });
  }
}
addEventListener("hashchange",route);
$$("[data-go]").forEach(a=>a.addEventListener("click",e=>{if(location.hash.slice(1)===a.dataset.go){e.preventDefault();route()}}));
