/* ============================================================
   Шәкірт — интерфейс (сайт + қосымша). Қозғалтқыш engine.js-те.
   Маршруттар: #dashboard, #lesson, #mirror — қосымша; қалғаны — сайт.
   ============================================================ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ic=(id,cls="")=>`<svg class="ic ${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const AV='<svg class="ava" aria-hidden="true"><use href="#erlan"/></svg>';
const pct=x=>Math.round(x*100)+"%";
const SHORT={cmp:"Салыстыру",add:"Қосу",mul:"Көбейту",m10:"10-ға көбейту"};
const RING='<svg class="ring" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" vector-effect="non-scaling-stroke" d="M9 25C3 11 38 3 61 4c23 1 37 8 35 19-2 11-30 15-52 14C21 36 4 32 6 21c1-8 15-13 29-16"/></svg>';
const REDUCED=matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Ерланның дәптері. items: [{text, ok}] */
function note(items,{reveal=false,ring=-1,label="Ерланның дәптері"}={}){
  return `<div class="note"><span class="who">${AV}${label}</span>${items.map((x,i)=>`<div class="ln"><span>${esc(x.text)}${i===ring?RING:""}</span>${reveal?(x.ok?`<span class="tag ok">${ic("check")}дұрыс</span>`:`<span class="tag bad">${ic("x")}қате</span>`):""}</div>`).join("")}</div>`;
}
const line=(b,t)=>{const a=solve(b,t);return {text:fmt(t,a),ok:isRight(t,a)}};
const setRangeFill=el=>el.style.setProperty("--p",((el.value-50)/50*100)+"%");
function toast(msg){const t=document.createElement("div");t.className="toast";t.textContent=msg;$("#toasts").append(t);setTimeout(()=>t.remove(),2600)}

/* ---------------- Тақырып және дыбыс ---------------- */
const root=document.documentElement;
try{const th=localStorage.getItem("shakirt_theme"); if(th) root.dataset.theme=th;}catch(e){}
const isDark=()=>root.dataset.theme?root.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;
function paintTheme(){$("#theme").innerHTML=ic(isDark()?"sun":"moon");$("#snd").innerHTML=ic(S.sound?"vol":"mute");$("#snd").setAttribute("aria-pressed",S.sound)}
$("#theme").onclick=()=>{root.dataset.theme=isDark()?"light":"dark";try{localStorage.setItem("shakirt_theme",root.dataset.theme)}catch(e){};paintTheme()};
$("#snd").onclick=()=>{S.sound=!S.sound;save();paintTheme();toast(S.sound?"Дыбыс қосылды":"Дыбыс өшірілді")};
addEventListener("scroll",()=>$("#top").classList.toggle("stuck",scrollY>8),{passive:true});

/* ---------------- Модаль ---------------- */
let lastFocus=null;
function openModal(html,onMount){
  lastFocus=document.activeElement;
  $("#modal").innerHTML=`<div class="scrim" data-close><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mt">${html}</div></div>`;
  document.body.style.overflow="hidden";
  const m=$(".modal");m.addEventListener("click",e=>e.stopPropagation());
  $(".scrim").addEventListener("click",closeModal);
  $$("[data-x]",m).forEach(b=>b.onclick=closeModal);
  onMount&&onMount(m); ($("[data-x]",m)||m).focus();
}
function closeModal(){$("#modal").innerHTML="";document.body.style.overflow="";lastFocus&&lastFocus.focus&&lastFocus.focus()}
addEventListener("keydown",e=>{
  if(!$(".modal")) return;
  if(e.key==="Escape") closeModal();
  if(e.key==="Tab"){const f=$$(".modal button,.modal a[href]");if(!f.length)return;const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()} else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
});
const closeBtn='<button class="iconbtn" data-x aria-label="Жабу">'+ic("x")+'</button>';

/* ================= САЙТ ================= */
/* --- Hero: тірі мысал --- */
const DEMO={order:["cmp_long","add_sep","mul_max","m10_zero","cmp_short","add_right","mul_ign","m10_int"],i:0};
function demoNew(){const b=DEMO.order[DEMO.i%8],tp=RULES[b].topic,[hit,miss]=BUGGEN[b];
  Object.assign(DEMO,{b,t:genTask(tp,DEMO.i%3===2?miss:hit),judge:null,conf:75,done:false});renderDemo()}
function renderDemo(){
  const {b,t,judge,conf,done}=DEMO, l=line(b,t), p=conf/100, ok=done&&(judge===l.ok);
  $("#demo").innerHTML=`<div class="demo-h"><b>Ерланның жауабы дұрыс па?</b><span class="tag">${SHORT[t.tp]} · ${DEMO.i%8+1}/8</span></div>
  ${note([l],{reveal:done,ring:done&&!l.ok?0:-1})}
  <div class="opts two">${[[true,"Дұрыс"],[false,"Қате"]].map(([v,s])=>`<button class="opt ${judge===v?(done?(v===l.ok?"good":"wrong"):"sel"):""}" data-dj="${v}" ${done?"disabled":""}><b>${s}</b></button>`).join("")}</div>
  <div class="stack" style="gap:2px"><div class="confrow"><b>Сенімділік</b><span class="num" id="dcv">${conf}%</span></div>
   <input class="range" id="dcf" type="range" min="50" max="100" step="5" value="${conf}" aria-label="Сенімділік" ${done?"disabled":""}><div class="scale"><span>50% — болжам</span><span>100% — сенімдімін</span></div></div>
  ${done?`<div class="fb ${ok?"ok":"bad"}"><b>${ok?"Дәл таптың.":"Бұл жолы қателестің."}</b> Жауап шынында ${l.ok?"дұрыс":"қате"}. Калибрлеу ұпайы: <b>${Math.round(100*(1-(p-(ok?1:0))**2))}/100</b>.${l.ok?" Бірақ Ерланның ережесі бәрібір қате: бұл есепте кездейсоқ дұрыс шықты.":` Ерланның ережесі: ${RULES[b].short}.`}</div>
   <div class="row"><button class="btn primary" id="dnext">Келесі мысал${ic("arrow","arrow")}</button><a class="btn ghost" href="#lesson">Толық раунд</a></div>`
  :`<button class="btn primary" id="dgo" ${judge===null?"disabled":""}>Бәс тігу</button>`}`;
  const r=$("#dcf");setRangeFill(r);
  if(!done){ $$("[data-dj]",$("#demo")).forEach(x=>x.onclick=()=>{DEMO.judge=x.dataset.dj==="true";renderDemo()});
    r.oninput=()=>{DEMO.conf=+r.value;$("#dcv").textContent=r.value+"%";setRangeFill(r)};
    $("#dgo").onclick=()=>{DEMO.done=true;beep(DEMO.judge===l.ok);renderDemo()}; }
  else $("#dnext").onclick=()=>{DEMO.i++;demoNew()};
}

/* --- Қалай жұмыс істейді: интерактивті қадамдар --- */
const STEPS=[["Тексер","Ерланның жауабы дұрыс па? Сенімділігіңе 50–100% бәс тігесің."],["Болжа","Дәптеріне қарап, оның келесі жауабын болжайсың."],["Диагноз қой","Барлық жауабын түсіндіретін ережені табасың."],["Түзет","Жаңа ережені Ерлан 5 жасырын есепте шынымен орындайды."]];
const EX={t1:{a:D.mk(25,2),b:D.mk(3,1),tp:"cmp"},notes:[[41,2,6,1],[8,1,15,2],[57,2,7,1]].map(([a,x,b,y])=>({a:D.mk(a,x),b:D.mk(b,y),tp:"cmp"})),t2:{a:D.mk(72,2),b:D.mk(9,1),tp:"cmp"}};
let stepI=0, stepTimer=null;
function renderSteps(){
  $("#stepper").innerHTML=STEPS.map(([t,d],i)=>`<button class="stepbtn ${i===stepI?"on":""}" role="tab" aria-selected="${i===stepI}" data-s="${i}"><span class="n">0${i+1}</span><b>${t}</b><span>${d}</span></button>`).join("");
  $$("[data-s]").forEach(b=>b.onclick=()=>{clearInterval(stepTimer);stepTimer=null;stepI=+b.dataset.s;renderSteps()});
  const B="cmp_long", cap='<span class="tag cap">Мысал</span>';
  const v=[
   ()=>`${cap}<b class="q" style="font:600 17px var(--f-display)">Ерланның жауабы дұрыс па?</b>${note([line(B,EX.t1)])}<div class="opts two"><div class="opt"><b>Дұрыс</b></div><div class="opt sel"><b>Қате</b></div></div><div class="confrow"><b>Сенімділік</b><span class="num">80%</span></div><input class="range" type="range" min="50" max="100" value="80" style="--p:60%" tabindex="-1" aria-hidden="true">`,
   ()=>`${cap}<b style="font:600 17px var(--f-display)">Ерлан келесі есепке не деп жауап береді?</b>${note(EX.notes.map(t=>line(B,t)))}<p class="mono" style="font-weight:700;font-size:19px">0.72 мен 0.9: қайсысы үлкен?</p><div class="opts two"><div class="opt good mono"><b>0.72 үлкен</b><small>Ерлан осылай жазады</small></div><div class="opt mono"><b>0.9 үлкен</b><small>дұрыс жауап</small></div></div>`,
   ()=>`${cap}<b style="font:600 17px var(--f-display)">Ерлан қай ережемен шығарып жүр?</b><div class="opts">${["cmp_long","cmp_short","cmp_ok"].map(r=>`<div class="opt ${r===B?"good":""}"><b>${RULES[r].title}</b><small>${RULES[r].desc}</small></div>`).join("")}</div>`,
   ()=>{const ts=HIDDEN.cmp.map(k=>genTask("cmp",k));return `${cap}<b style="font:600 17px var(--f-display)">Жаңа ереже: разрядтап салыстыр</b><div class="tests">${ts.map((t,i)=>`<div class="test" style="animation-delay:${i*90}ms"><span class="mono">${esc(fmt(t,solve("cmp_ok",t)))}</span><span class="tag ok">${ic("check")}өтті</span></div>`).join("")}</div><div class="fb ok"><b>Ерлан түзелді: 5/5.</b> Ереже — код, сондықтан сынақтан тек шын дұрыс ереже өтеді.</div>`}
  ];
  $("#preview").innerHTML=v[stepI]();
}
function autoSteps(){ if(REDUCED) return; const io=new IntersectionObserver(es=>{es.forEach(e=>{
  if(e.isIntersecting&&stepTimer===null&&!autoSteps.stopped){stepTimer=setInterval(()=>{stepI=(stepI+1)%4;renderSteps()},4500)}
  else if(!e.isIntersecting&&stepTimer){clearInterval(stepTimer);stepTimer=null}})},{threshold:.4});
  io.observe($("#how")); $("#stepper").addEventListener("click",()=>{autoSteps.stopped=true},{capture:true}); }

/* --- Қателер кітапханасы: сүзгі + модаль --- */
let libFilter="all";
function renderLib(){
  const counts={all:BUGS.length};BUGS.forEach(b=>{const t=RULES[b].topic;counts[t]=(counts[t]||0)+1});
  $("#chips").innerHTML=[["all","Барлығы"],...Object.entries(SHORT)].map(([k,s])=>`<button class="chip ${libFilter===k?"on":""}" data-f="${k}" aria-pressed="${libFilter===k}">${s}<sup>${counts[k]}</sup></button>`).join("");
  $$("[data-f]",$("#chips")).forEach(c=>c.onclick=()=>{libFilter=c.dataset.f;renderLib();applyFilter()});
  if(!$("#lib").children.length){
    $("#lib").innerHTML=BUGS.map(b=>{const tp=RULES[b].topic,t=genTask(tp,BUGGEN[b][0]);
      return `<button class="card bug" data-bug="${b}" data-tp="${tp}"><span class="tag">${SHORT[tp]}</span><span class="ex">${esc(fmt(t,solve(b,t)))}</span><h3>${RULES[b].short}</h3><p>${RULES[b].desc}</p><span class="more">Ережені ашу${ic("arrow")}</span></button>`}).join("");
    $$(".bug").forEach(c=>{c.onclick=()=>openBug(c.dataset.bug);
      c.addEventListener("pointermove",e=>{const r=c.getBoundingClientRect();c.style.setProperty("--mx",(e.clientX-r.left)+"px");c.style.setProperty("--my",(e.clientY-r.top)+"px")})});
  }
}
function applyFilter(){$$(".bug").forEach(c=>{const show=libFilter==="all"||c.dataset.tp===libFilter;c.classList.toggle("out",!show);c.classList.toggle("in",show)})}
function openBug(b){
  const tp=RULES[b].topic;
  const body=()=>{const [hit,miss]=BUGGEN[b];const ts=shuffle([genTask(tp,hit),genTask(tp,hit),genTask(tp,hit),genTask(tp,miss)]);
    return note(ts.map(t=>line(b,t)),{reveal:true,label:"Ерлан осы ережемен шығарады"})};
  openModal(`<div class="modal-h"><div class="stack" style="gap:8px"><span class="tag">${TOPICS[tp].name}</span><h3 id="mt">${RULES[b].short}</h3></div>${closeBtn}</div>
   <p style="color:var(--ink-2)"><b>Ерланның ережесі:</b> ${RULES[b].desc}</p><div id="mnote">${body()}</div>
   <div class="fb info"><b>Неге қате.</b> ${RULES[b].why}</div>
   <div class="row"><button class="btn ghost" id="mre">${ic("refresh")}Жаңа мысалдар</button><button class="btn accent" id="mgo">Осы қатемен раунд бастау${ic("arrow","arrow")}</button></div>`,
   m=>{$("#mre",m).onclick=()=>{$("#mnote").innerHTML=body()};$("#mgo",m).onclick=()=>{closeModal();forcedBug=b;location.hash="lesson"}});
}

/* --- Айна (сайттағы алдын ала көрініс), ғылым, сұрақтар --- */
function mirrorRows(list){return list.map(b=>{const p=S.post[b],col=p>=.5?"var(--accent)":p>=.3?"var(--warn)":"var(--ok)";
  return `<div class="mrow"><div><b>${RULES[b].short}</b><small>${SHORT[RULES[b].topic]} · ${S.seen[b]} раунд</small></div><div class="bar"><i style="width:${p*100}%;background:${col}"></i></div><span class="v">${pct(p)}</span></div>`}).join("")}
function renderMirrorInfo(){
  const n=S.hist.length, top=BUGS.slice().sort((a,b)=>S.post[b]-S.post[a]).slice(0,5);
  $("#mi-tag").textContent=n?`${n} раунд`:"әзірге дерек жоқ";
  $("#mi-rows").innerHTML=mirrorRows(top);
  $("#mi-hint").textContent=n?"Ең жоғары бес баға. Толық тізім Айна бетінде.":`Раунд ойнамай тұрып, әр баға бастапқы ${pct(PRIOR)} деңгейінде тұрады. Бірнеше раундтан кейін ол сенің жауаптарыңа қарай өзгереді.`;
}
const EVID=[[.51,"Еске түсіру практикасы","Болжа қадамы: Ерланның жауабын жадтан құрастырасың.","Adesope, Trevisan & Sundararajan, 2017"],[.42,"Аралас жаттығу","Раундтар тақырыптарды араластырып береді.","Brunmair & Richter, 2019"],[.41,"Теріске шығару мәтіні","Диагноз бен «Неге қате» түсіндірмесі.","Schroeder & Kucera, 2022"],[.36,"Өнімді сәтсіздік","Алдымен өзің ізденесің, түсіндірме кейін келеді.","Sinha & Kapur, 2021"]];
function renderScience(){$("#ev").innerHTML=EVID.map(([g,t,d,s])=>`<div class="card evi rv"><div class="top-l"><h3>${t}</h3><span class="num">${g.toFixed(2)}</span></div><div class="bar"><i style="width:${g/.6*100}%"></i></div><p>${d}</p><span class="src">Hedges g · ${s}</span></div>`).join("")}
const FAQ=[
 ["Бұл жай тест емес пе?","Тестте оқушы өз жауабын береді. Мұнда ол басқаның шешімін тексереді, ережесін табады және түзетеді, ал түзету жасырын есептерде орындалып тексеріледі."],
 ["Неге ChatGPT-ге «қателесетін оқушы бол» деп айтпасқа?","Тілдік модель қатені дәйекті ұстамайды және түзетуді тым оңай қабылдайды. Ерланның қатесі — код: ол әр есепте бірдей қателеседі және тек шын дұрыс ережеден кейін сынақтан өтеді."],
 ["Айна диагноз қоя ма?","Жоқ. Бұл ықтималдық бағасы. Модель параметрлері әзірге сарапшылық болжам, оларды нақты оқушылар дерегімен бағалау — пилоттың мақсаты."],
 ["Интернет немесе тіркелу керек пе?","Жоқ. Бет бір рет ашылғаннан кейін барлық есептеу браузерде жүреді. Тілдік модель мен API кілті қолданылмайды."],
 ["Деректер қайда сақталады?","Тек осы құрылғыдағы браузер жадында. Серверге ештеңе жіберілмейді. Айна бетінде барлық деректі бір батырмамен өшіруге болады."],
 ["Тиімділігі дәлелденген бе?","Әзірге жоқ. Әдістің бөліктері зерттелген, бірақ Шәкірттің өз әсерін сыныптар кездейсоқ бөлінетін бақыланатын эксперимент көрсетуі керек."]];
function renderFaq(){$("#faqs").innerHTML=FAQ.map(([q,a],i)=>`<details class="rv"${i===0?" open":""}><summary>${q}${ic("plus")}</summary><p>${a}</p></details>`).join("")}
function reveal(){ if(REDUCED||!("IntersectionObserver" in window)) return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.remove("pre");io.unobserve(e.target)}}),{rootMargin:"0px 0px -8% 0px"});
  $$(".rv").forEach(el=>{if(el.getBoundingClientRect().top>innerHeight){el.classList.add("pre");io.observe(el)}}); }

/* ================= ҚОСЫМША ================= */
let R=null, forcedBug=null;
function newRound(force){
  const bug=force||nextBug(), tp=RULES[bug].topic, [hit,miss]=BUGGEN[bug], control=!force&&Math.random()<.25;
  const notes=[genTask(tp,hit),genTask(tp,miss),genTask(tp,hit)];
  let t2; do{t2=genTask(tp,hit)}while(D.str(t2.a)===D.str(notes[0].a)&&D.str(t2.b)===D.str(notes[0].b));
  R={bug,tp,control,t1:genTask(tp,control?miss:hit),notes,t2,step:1,conf:75,judge:null,pred:null,diag:null,fix:null,tries:0,res:null,done:false};
}
const SEG=["Тексер","Болжа","Диагноз","Түзет"];
const seg=()=>`<div class="seg" aria-label="Раунд барысы">${SEG.map((s,i)=>`<div class="${i+1<R.step?"done":i+1===R.step?"cur":""}"><i></i>${s}</div>`).join("")}</div>`;
const scr=html=>{$("#screen").innerHTML=html;$("#screen").style.animation="none";void $("#screen").offsetWidth;$("#screen").style.animation=""};
function lesson(){if(!R) newRound(); [null,step1,step2,step3,step4][R.step]()}
function L(html){scr(`<div class="lesson stack" style="gap:16px">${seg()}${html}</div>`)}

function step1(){
  const a=solve(R.bug,R.t1), truth=isRight(R.t1,a);
  L(`<div><span class="eyebrow">1-қадам · Тексер</span><h1>Ерланның жауабы дұрыс па?</h1><p class="sub">${TOPICS[R.tp].name}</p></div>
  ${note([{text:fmt(R.t1,a),ok:truth}],{reveal:!!R.locked,ring:R.locked&&!truth?0:-1})}
  <div class="opts two">${[[true,"Дұрыс","Ерлан қателеспеді"],[false,"Қате","Мұнда қате бар"]].map(([v,s,d])=>`<button class="opt ${R.judge===v?(R.locked?(v===truth?"good":"wrong"):"sel"):""}" data-j="${v}" ${R.locked?"disabled":""}><b>${s}</b><small>${d}</small></button>`).join("")}</div>
  <div class="card panel stack" style="gap:4px"><div class="confrow"><div><b>Сенімділік бәсі</b><div class="src">Шын сенімділігіңді айту — ең тиімді стратегия.</div></div><span class="num" id="cv">${R.conf}%</span></div>
   <input class="range" type="range" min="50" max="100" step="5" value="${R.conf}" id="cf" aria-label="Сенімділік" ${R.locked?"disabled":""}><div class="scale"><span>50% — тек болжам</span><span>100% — толық сенімдімін</span></div></div>
  ${R.locked?fb1(truth):""}
  <div class="row"><button class="btn ${R.locked?"primary":"accent"} lg" id="go" ${R.judge===null?"disabled":""}>${R.locked?"Әрі қарай"+ic("arrow","arrow"):"Бәс тігу"}</button></div>`);
  const r=$("#cf");setRangeFill(r);
  if(!R.locked){$$("[data-j]").forEach(b=>b.onclick=()=>{R.judge=b.dataset.j==="true";step1()});
    r.oninput=()=>{R.conf=+r.value;$("#cv").textContent=r.value+"%";setRangeFill(r)};}
  $("#go").onclick=()=>{
    if(R.locked){R.step=2;lesson();return}
    const p=R.conf/100, ok=R.judge===truth; R.judgeOk=ok; R.locked=true;
    S.bets.push({p,o:ok?1:0,t:Date.now()});
    if(!truth){const w=(p-.5)*2; S.post[R.bug]=R.judge?bayes(S.post[R.bug],LIK.accHas,LIK.accNo,w):bayes(S.post[R.bug],1-LIK.accHas,1-LIK.accNo,w);}
    save();beep(ok);step1();};
}
function fb1(truth){const ok=R.judgeOk,p=R.conf/100,pts=Math.round(100*(1-(p-(ok?1:0))**2)), corr=fmt(R.t1,solve(okRule(R.tp),R.t1));
  return `<div class="fb ${ok?"ok":"bad"}"><b>${ok?"Дәл таптың.":"Бұл жолы қателестің."}</b> Ерланның жауабы шынында ${truth?"дұрыс":"қате"}${truth?"":`, дұрысы: <span class="mono">${esc(corr)}</span>`}. Калибрлеу ұпайы: <b>${pts}/100</b>.${!ok&&p>=.8?"<br>Жоғары сеніммен жасалған қате — ең құнды сәт: мұндай қателер кері байланыстан кейін жақсырақ түзеледі.":""}${truth?"<br>Абайла: жауап дұрыс шыққанымен, Ерланның ережесі бәрібір қате болуы мүмкін.":""}</div>`}
function step2(){
  const ansBug=solve(R.bug,R.t2), same=(x,y)=>TOPICS[R.tp].same(x,y)&&(x.raw||"")===(y.raw||"");
  if(!R.opts2){let o=R.tp==="cmp"?[">","<","="]:rulesOf(R.tp).map(r=>solve(r,R.t2));const u=[];o.forEach(x=>{if(!u.some(y=>R.tp==="cmp"?x===y:same(x,y)))u.push(x)});R.opts2=shuffle(u)}
  const eq=(x,y)=>R.tp==="cmp"?x===y:same(x,y);
  const lab=x=>R.tp==="cmp"?(x===">"?D.str(R.t2.a)+" үлкен":x==="<"?D.str(R.t2.b)+" үлкен":"екеуі тең"):(x.raw||D.str(x));
  L(`<div><span class="eyebrow">2-қадам · Болжа</span><h1>Ерлан келесі есепке не деп жауап береді?</h1><p class="sub">Дұрыс жауапты емес, <b>Ерланның</b> жауабын болжа. Дәптеріндегі заңдылыққа қара.</p></div>
  ${note(R.notes.map(t=>line(R.bug,t)))}
  <div class="card panel stack"><b class="mono" style="font-size:21px">${esc(TOPICS[R.tp].q(R.t2))}</b>
   <div class="opts" style="grid-template-columns:repeat(${R.opts2.length},1fr)">${R.opts2.map((x,i)=>`<button class="opt mono ${R.pred!==null?(eq(x,ansBug)?"good":i===R.pred?"wrong":""):""}" data-p="${i}" ${R.pred!==null?"disabled":""}><b>${esc(lab(x))}</b></button>`).join("")}</div></div>
  ${R.pred!==null?`<div class="fb ${R.predOk?"ok":"info"}"><b>${R.predOk?"Иә, Ерлан дәл солай жазады.":"Ерлан басқаша жазады:"}</b> <span class="mono">${esc(fmt(R.t2,ansBug))}</span>. ${R.predOk?"Сен оның ойлау жолын ұстадың.":"Келесі қадамда оның ережесіне мұқият қара."}</div><div class="row"><button class="btn primary lg" id="go">Диагноз қою${ic("arrow","arrow")}</button></div>`:""}`);
  $$("[data-p]").forEach(b=>b.onclick=()=>{R.pred=+b.dataset.p;R.predOk=eq(R.opts2[R.pred],ansBug);beep(R.predOk);step2()});
  $("#go")&&($("#go").onclick=()=>{R.step=3;lesson()});
}
function ruleCards(sel,attr,mark){if(!R.cards)R.cards=shuffle(rulesOf(R.tp));
  return `<div class="opts">${R.cards.map(r=>`<button class="opt ${sel===r?"sel":""} ${mark?mark(r):""}" data-${attr}="${r}" ${mark&&attr==="d"?"disabled":""}><b>${RULES[r].title}</b><small>${RULES[r].desc}</small></button>`).join("")}</div>`}
function step3(){
  const locked=R.diagOk!==undefined;
  L(`<div><span class="eyebrow">3-қадам · Диагноз қой</span><h1>Ерлан қай ережемен шығарып жүр?</h1><p class="sub">Оның барлық жауабын түсіндіретін ережені таңда.</p></div>
  ${note(R.notes.concat([R.t2]).map(t=>line(R.bug,t)),{reveal:true})}
  ${ruleCards(R.diag,"d",locked?(r=>r===R.bug?"good":r===R.diag?"wrong":""):null)}
  ${locked?`<div class="fb ${R.diagOk?"ok":"info"}"><b>${R.diagOk?"Диагноз дәл.":"Дәл емес."}</b> Ерланның ережесі — ${RULES[R.bug].short}.</div>`:""}
  <div class="row"><button class="btn ${locked?"primary":"accent"} lg" id="go" ${R.diag?"":"disabled"}>${locked?"Ерланды түзету"+ic("arrow","arrow"):"Диагнозды бекіту"}</button></div>`);
  if(!locked)$$("[data-d]").forEach(b=>b.onclick=()=>{R.diag=b.dataset.d;step3()});
  $("#go").onclick=()=>{if(locked){R.step=4;lesson();return} R.diagOk=R.diag===R.bug;beep(R.diagOk);step3()};
}
function step4(){
  const passed=R.res&&R.res.every(x=>x.ok);
  L(`<div><span class="eyebrow">4-қадам · Түзет және тексер</span><h1>Ерланға қай ережені үйретесің?</h1><p class="sub">Таңдаған ережеңді Ерлан бес жасырын есепте <b>шынымен орындайды</b>. Оны сөзбен көндіру мүмкін емес.</p></div>
  ${passed?"":ruleCards(R.fix,"f",R.res?(r=>r===R.fix?"wrong":""):null)}
  ${R.res?`<div class="card panel"><h2>Жасырын сынақ <span class="tag ${passed?"ok":"bad"}">${R.res.filter(x=>x.ok).length}/5</span></h2><div class="tests">${R.res.map((x,i)=>`<div class="test" style="animation-delay:${i*110}ms"><span class="mono">${esc(x.line)}</span><span class="tag ${x.ok?"ok":"bad"}">${ic(x.ok?"check":"x")}${x.ok?"өтті":"құлады"}</span></div>`).join("")}</div>
   ${passed?"":`<div class="fb bad" style="margin-top:12px"><b>Ерлан әлі қателесіп жүр.</b> Құлаған есептерге қара да, басқа ереже таңда.</div>`}</div>`:""}
  ${passed?`<div class="fb ok"><b>Ерлан түзелді${R.tries===1?", бірінші әрекеттен!":"."}</b> Жаңа ереже: ${RULES[R.fix].title.toLowerCase()}.</div>
   <div class="card panel"><span class="eyebrow">Неге ескі ереже қате болды</span><h2 style="margin-top:6px">${RULES[R.bug].short}</h2><p style="color:var(--ink-2)">${RULES[R.bug].why}</p></div>
   <div class="sum">${[["Тексеру",R.judgeOk],["Болжам",R.predOk],["Диагноз",R.diagOk],["Түзету",R.tries===1]].map(([k,v])=>`<div>${k}<b>${ic(v?"check":"x")}${k==="Түзету"?R.tries+"-әрекет":v?"дәл":"қате"}</b></div>`).join("")}</div>
   <div class="row"><a class="btn accent lg" href="#lesson" id="again">Келесі раунд${ic("arrow","arrow")}</a><a class="btn ghost lg" href="#dashboard">Нәтижелерім</a></div>`
  :`<div class="row"><button class="btn accent lg" id="run" ${R.fix?"":"disabled"}>Ерланды сынақтан өткізу</button></div>`}`);
  if(passed){$("#again").onclick=e=>{e.preventDefault();newRound();lesson();scrollTo({top:0,behavior:REDUCED?"auto":"smooth"})};return}
  $$("[data-f]").forEach(b=>b.onclick=()=>{R.fix=b.dataset.f;R.res=null;step4()});
  $("#run").onclick=()=>{R.tries++;const tests=HIDDEN[R.tp].map(k=>genTask(R.tp,k));
    R.res=tests.map(t=>{const a=solve(R.fix,t);return {line:fmt(t,a),ok:isRight(t,a)}});
    const ok=R.res.every(x=>x.ok);
    if(RULES[R.fix].bug) S.post[R.fix]=bayes(S.post[R.fix],LIK.pickHas,LIK.pickNo);
    if(R.tries===1) bktUpdate(R.tp,ok);
    if(ok&&!R.done){R.done=true;S.seen[R.bug]++;S.hist.push({bug:R.bug,judgeOk:R.judgeOk,conf:R.conf/100,predOk:R.predOk,diagOk:R.diagOk,tries:R.tries,fixed1:R.tries===1,t:Date.now()});toast("Раунд сақталды")}
    save();beep(ok);step4();};
}

function calChart(c){
  const W=360,H=230,p=36,x=v=>p+(v-.5)/.5*(W-p-12),y=v=>H-p-v*(H-p-12);
  let s=`<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="Калибрлеу қисығы: айтылған сенімділік пен нақты дәлдік">`;
  for(const g of [0,.25,.5,.75,1]) s+=`<line x1="${p}" x2="${W-12}" y1="${y(g)}" y2="${y(g)}" style="stroke:var(--line)"/><text x="${p-7}" y="${y(g)+4}" font-size="10.5" text-anchor="end" style="fill:var(--mute)">${g*100}%</text>`;
  for(const g of [.5,.6,.7,.8,.9,1]) s+=`<text x="${x(g)}" y="${H-p+16}" font-size="10.5" text-anchor="middle" style="fill:var(--mute)">${Math.round(g*100)}%</text>`;
  s+=`<line x1="${x(.5)}" y1="${y(.5)}" x2="${x(1)}" y2="${y(1)}" style="stroke:var(--ink-2)" stroke-dasharray="4 5"/>`;
  s+=`<text x="${(W+p)/2}" y="${H-3}" font-size="10.5" text-anchor="middle" style="fill:var(--mute)">айтқан сенімділік →</text>`;
  if(c){const pts=c.bins.filter(b=>b.n);
    if(pts.length>1) s+=`<polyline fill="none" style="stroke:var(--accent)" stroke-width="2.2" stroke-linejoin="round" points="${pts.map(b=>x(b.conf)+","+y(b.acc)).join(" ")}"/>`;
    pts.forEach(b=>{s+=`<circle cx="${x(b.conf)}" cy="${y(b.acc)}" r="${4+Math.min(6,b.n)}" style="fill:var(--accent);stroke:var(--surface)" stroke-width="2"><title>${b.n} бәс · дәлдік ${pct(b.acc)}</title></circle>`});}
  else s+=`<text x="${(W+p)/2}" y="${H/2-14}" font-size="12" text-anchor="middle" style="fill:var(--mute)">Бәс тіккен соң нүктелер пайда болады</text>`;
  return s+"</svg>";
}
function dashboard(){
  const c=calib(), n=S.hist.length, fixed=S.hist.filter(h=>h.fixed1).length, flagged=BUGS.filter(b=>S.post[b]>=.5), going=R&&!R.done&&R.step>1;
  scr(`<div class="page-h"><span class="eyebrow">Басты</span><h1>${n?"Қайта келгеніңе қуаныштымыз":"Сәлем! Ерлан сені күтіп отыр"}</h1><p>Ерлан — жасанды оқушы. Ол есепті өз ережесімен шығарады, ал ережесінде қате бар. Сенің міндетің — оны тауып, түзету.</p></div>
  <div class="startcard"><div class="stack" style="gap:6px"><h2>${going?"Аяқталмаған раунд бар":n?"Келесі раундқа дайынсың ба?":"Алғашқы раундты баста"}</h2><p>${going?`${R.step}-қадамнан жалғастыр.`:"Тексер, болжа, диагноз қой, түзет. Бір раунд 3–4 минут."}</p></div>
   <a class="btn accent lg" href="#lesson">${going?"Жалғастыру":"Ерланды түзету"}${ic("arrow","arrow")}</a></div>
  <div class="tiles">
   <div class="card tile"><span class="num">${n}</span><span>аяқталған раунд</span></div>
   <div class="card tile"><span class="num">${n?fixed+"/"+n:"—"}</span><span>бірінші әрекеттен түзетілді</span></div>
   <div class="card tile"><span class="num">${c?c.brier.toFixed(2):"—"}</span><span>Brier ұпайы: 0 — мінсіз, 0.25 — кездейсоқ</span></div>
   <div class="card tile"><span class="num">${c?(c.over>0?"+":"")+Math.round(c.over*100)+" п.п.":"—"}</span><span>${c?(c.over>.05?"артық сенімділік":c.over<-.05?"кем сенімділік":"жақсы калибрленген"):"сенімділік пен дәлдік айырмасы"}</span></div>
  </div>
  <div class="cols">
   <div class="card panel"><h2>Калибрлеу қисығы</h2>${calChart(c)}<p class="hint">Үзік сызық — мінсіз калибрлеу. Нүктелер оған жақын болса, «80% сенімдімін» дегенің шынымен 80% жағдайда дұрыс шығады.</p></div>
   <div class="card panel"><h2>Тақырып бойынша шеберлік <span class="tag">BKT</span></h2><div class="stack">
    ${Object.keys(TOPICS).map(t=>`<div class="stack" style="gap:6px"><div class="confrow" style="font-size:14.5px"><span>${TOPICS[t].name}</span><b>${pct(S.bkt[t])}</b></div><div class="bar"><i style="width:${S.bkt[t]*100}%"></i></div></div>`).join("")}</div>
    <p class="hint">Ерланды бірінші әрекеттен түзеткен сайын баға өседі (Bayesian Knowledge Tracing).</p></div>
  </div>
  <div class="cols">
   <div class="card panel"><h2>Айна</h2>${n?(flagged.length?`<p>Сенде де болуы мүмкін жаңылыс түсініктер:</p><div class="row" style="margin-top:10px">${flagged.map(b=>`<span class="tag bad">${RULES[b].short}</span>`).join("")}</div>`:`<p style="color:var(--ink-2)">Әзірге ешбір жаңылыс түсінік 50%-дан жоғары бағаланған жоқ.</p>`):`<div class="empty">Бірінші раундтан кейін осында сенің айнаң пайда болады.</div>`}
    <div class="row" style="margin-top:14px"><a class="btn ghost sm" href="#mirror">Айнаны ашу${ic("arrow","arrow")}</a></div></div>
   <div class="card panel"><h2>Соңғы раундтар</h2>${n?`<div class="tbl"><table><tr><th>Ерланның қатесі</th><th>Тексеру</th><th>Түзету</th></tr>${S.hist.slice(-5).reverse().map(h=>`<tr><td>${RULES[h.bug].short}<div class="src">${SHORT[RULES[h.bug].topic]}</div></td><td><span class="tag ${h.judgeOk?"ok":"bad"}">${pct(h.conf)}</span></td><td>${h.tries}-әрекет</td></tr>`).join("")}</table></div>`:`<div class="empty">Раундтар тарихы осында жиналады.</div>`}</div>
  </div>`);
}
function mirror(){
  const any=S.bets.length>0;
  scr(`<div class="page-h"><span class="eyebrow">Айна</span><h1>Сенің жаңылыс түсініктерің</h1><p>Ерланның қатесін байқамай қалсаң немесе қате ережені «дұрыс» деп ұсынсаң, сенде де сол түсінік болуы мүмкін. Төменде — әр жаңылыс түсінік бойынша жүйенің ықтималдық бағасы.</p></div>
  <div class="card panel" style="margin-bottom:14px">${any?"":`<div class="fb info" style="margin-bottom:8px">Әзірге барлық баға бастапқы деңгейде (${pct(PRIOR)}), өйткені дерек жоқ.</div>`}<div class="mrows">${mirrorRows(BUGS.slice().sort((a,b)=>S.post[b]-S.post[a]))}</div></div>
  <div class="cols"><div class="card panel"><h2>Бағалар қалай есептеледі</h2><p style="color:var(--ink-2);font-size:15px">Әр бақылаудан кейін ықтималдық Байес формуласымен жаңарады. 50%-ға жақын бәстің салмағы аз, сенімді бәс көбірек ақпарат береді. Келесі раундтың қатесін жүйе күтілетін ақпарат өсімі ең жоғары түсінік бойынша таңдайды.</p></div>
   <div class="card panel"><h2>Шектеу</h2><p style="color:var(--ink-2);font-size:15px">Модель параметрлері (мысалы, қатесі бар оқушы оны ${pct(LIK.accHas)} жағдайда қабылдайды) — әзірге сарапшылық болжам. Бұл диагноз емес, болжам.</p>
    <div class="row" style="margin-top:14px"><button class="btn ghost sm" id="reset">Барлық деректі өшіру</button></div></div></div>`);
  $("#reset").onclick=()=>openModal(`<div class="modal-h"><h3 id="mt">Барлық деректі өшіру керек пе?</h3>${closeBtn}</div><p style="color:var(--ink-2)">Раундтар тарихы, бәстер және Айна бағалары осы құрылғыдан өшіріледі. Мұны қайтару мүмкін емес.</p><div class="row"><button class="btn ghost" data-x>Бас тарту</button><button class="btn accent" id="yes">Иә, өшіру</button></div>`,
    m=>{$("#yes",m).onclick=()=>{const snd=S.sound;S=fresh();S.sound=snd;R=null;save();closeModal();toast("Деректер өшірілді");mirror();renderMirrorInfo()}});
}

/* ================= Маршрут ================= */
const APP={dashboard,lesson,mirror};
function route(){
  const h=location.hash.slice(1);
  if(APP[h]){
    document.body.dataset.mode="app";
    if(h==="lesson"&&(!R||R.done||forcedBug)){newRound(forcedBug);forcedBug=null}
    APP[h](); scrollTo(0,0);
    $$("[data-go]").forEach(b=>{const on=b.dataset.go===h;b.classList.toggle("on",on);b.setAttribute("aria-current",on?"page":"false")});
    document.title=({dashboard:"Басты",lesson:"Сабақ",mirror:"Айна"})[h]+" · Шәкірт";
  } else {
    const wasApp=document.body.dataset.mode==="app";
    document.body.dataset.mode="site"; document.title="Шәкірт — қатені түзетіп үйрен"; renderMirrorInfo();
    const el=h&&h!=="home"&&document.getElementById(h);
    if(el) requestAnimationFrame(()=>el.scrollIntoView({behavior:wasApp||REDUCED?"auto":"smooth"})); else if(wasApp||h==="home") scrollTo(0,0);
  }
}
$$("[data-go]").forEach(b=>{b.addEventListener("click",e=>{if(location.hash.slice(1)===b.dataset.go){e.preventDefault();route()}else if(b.tagName==="BUTTON")location.hash=b.dataset.go})});
addEventListener("hashchange",route);

/* ---------------- Іске қосу ---------------- */
$("#dots").innerHTML=Array.from({length:100},(_,i)=>`<i class="${i<56?"on":""}"></i>`).join("");
paintTheme(); demoNew(); renderSteps(); renderLib(); renderScience(); renderFaq(); route(); reveal(); autoSteps();
window.__S=()=>S; window.__R=()=>R; window.__E={RULES,BUGS,GEN,HIDDEN,BUGGEN,genTask,solve,isRight,fmt,rulesOf,okRule,D};
