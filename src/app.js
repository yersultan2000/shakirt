/* ============================================================
   Шәкірт — қосымша: сабақ (4 қадам), басты бет, Айна.
   Раунд әр қадамнан кейін сақталады; фокус қайта сызғанда жоғалмайды.
   ============================================================ */
let R=null;
try{const r=JSON.parse(store.get("shakirt_round")||"null"); if(r&&r.v===2&&RULES[r.bug]) R=r;}catch(e){}
const saveR=()=>store.set("shakirt_round",JSON.stringify(R));
const BUGSETTING={cmp_long:[0,1],cmp_short:[0,2],add_right:[1,0],add_sep:[0,1],mul_max:[1,0],mul_ign:[2,0],m10_zero:[1,0],m10_int:[2,0]};
function newRound(force){
  const bug=force||nextBug(), tp=RULES[bug].topic, [hit,miss]=BUGGEN[bug], control=!force&&Math.random()<.25;
  const notes=[genTask(tp,hit),genTask(tp,miss),genTask(tp,hit)];
  let t2; do{t2=genTask(tp,hit)}while(D.str(t2.a)===D.str(notes[0].a)&&D.str(t2.b)===D.str(notes[0].b));
  R={v:2,bug,tp,control,t1:genTask(tp,control?miss:hit),notes,t2,step:1,conf:80,judge:null,locked:false,pred:null,hl:[],diag:[],diagDone:false,
     build:BUGSETTING[bug].slice(),tries:0,res:null,done:false,cards:shuffle(rulesOf(tp)),opts2:null};
  saveR();
}
const SEG=()=>[L("Тексер","Проверь"),L("Болжа","Предскажи"),L("Диагноз","Диагноз"),L("Түзет","Исправь")];
let lastStep=0;
function L_(html){ // lesson frame; animates only when the step changes, keeps focus otherwise
  const k=document.activeElement&&document.activeElement.dataset?document.activeElement.dataset.key:null, stepChanged=R.step!==lastStep; lastStep=R.step;
  $("#screen").innerHTML=`<div class="lesson ${stepChanged&&!REDUCED()?"step-enter":""}">
   <div class="steps4" aria-label="${L("Раунд барысы","Ход раунда")}">${SEG().map((s,i)=>`<div class="${i+1<R.step?"done":i+1===R.step?"cur":""}" ${i+1===R.step?'aria-current="step"':""}><i></i>${s}</div>`).join("")}</div>${html}</div>`;
  if(stepChanged){const h=$("#screen h1");h&&h.focus({preventScroll:true})}
  else if(k){const el=$(`#screen [data-key="${k}"]`);el&&el.focus({preventScroll:true})}
  saveR();
}
const H1=(n,t)=>`<div><span class="d-label">${n}-${L("қадам","шаг")}</span><h1 class="q" tabindex="-1">${t}</h1></div>`;
function lesson(fromRoute){ if(!R) newRound(); if(fromRoute) lastStep=0; [null,step1,step2,step3,step4][R.step](); }

/* ---- 1. Тексер ---- */
function step1(){
  const l=lineOf(R.bug,R.t1), truth=l.okv, p=R.conf/100, ok=R.judge===truth;
  const intro=!S.hist.length&&!S.introDone?`<div class="intro"><div style="width:64px">${erlan("sure")}</div><div><p>${L("Сәлем, мен Ерланмын. Ондық бөлшектерді өз ережеммен шығарамын — және ол ереже, меніңше, дұрыс. Қатем болса, тауып, түзетіп көр.","Привет, я Ерлан. Я решаю десятичные дроби по своему правилу — и, по-моему, оно верное. Если я ошибаюсь, найди ошибку и исправь меня.")}</p><button class="x link" id="introX">${L("Түсінікті","Понятно")}</button></div></div>`:"";
  const item={text:l.text,ring:R.judge===false&&!(R.locked&&truth),ok:R.judge===true&&!(R.locked&&!truth)?true:undefined,strike:R.locked&&!truth&&R.judge!==false,fix:R.locked&&!truth?fixText(R.t1):""};
  const face=!R.locked?"sure":(!truth&&R.judge===false)?"corrected":(!truth)?"sure":(ok?"proud":"puzzled");
  L_(`${intro}${H1(1,L("Ерланның жауабы дұрыс па?","Верен ли ответ Ерлана?"))}<p class="cap">${TN(R.tp)}</p>
   <div class="nb sheet lifted">${nb({items:[item],face})}</div>
   ${judgeTargets(R.judge,R.locked,truth)}${confChips(R.conf,R.locked)}
   ${R.locked?`<div class="result"><span class="pts ${betPoints(p,ok)>=0?"pos":"neg"}">${pts(betPoints(p,ok))}</span><span class="note-line">${ok?L("Дәл таптың.","Верно.")+" ":L("Бұл жолы қателестің.","В этот раз ошибся.")+" "}${L("Тиын лақтырумен салыстырғанда: 50% бәс — 0 ұпай.","Относительно монеты: ставка 50% — это 0 очков.")}${!ok&&p>=.8?" "+L("Сеніммен жасалған қате — ең құнды сәт: мұндай қателер кейін жақсырақ түзеледі.","Уверенная ошибка — самый ценный момент: такие ошибки потом лучше исправляются."):""}</span></div>
    ${truth?`<p class="fb amb"><b>${L("Абайла.","Осторожно.")}</b> ${L("Жауап дұрыс шықты, бірақ Ерланның ережесі бәрібір қате болуы мүмкін. Келесі қадамда тексер.","Ответ верный, но правило Ерлана всё равно может быть неверным. Проверь на следующем шаге.")}</p>`:""}`
   :(R.nudge&&R.judge===null?`<p class="status" role="alert">${L("Алдымен Ерланның жауабын бағала: «Дұрыс» не «Қате».","Сначала оцени ответ Ерлана: «Верно» или «Неверно».")}</p>`:"")}
   <div class="actionbar"><button class="btn primary lg" id="go" data-key="go" ${!R.locked&&R.judge===null?'aria-disabled="true"':""}>${R.locked?L("Әрі қарай","Дальше"):betLabel(R.judge,R.conf)}</button></div>`);
  $("#introX")&&($("#introX").onclick=()=>{S.introDone=true;save();step1()});
  if(!R.locked){$$("[data-j]").forEach(b=>b.onclick=()=>{R.judge=b.dataset.j==="true";R.nudge=false;step1()});
    $$("[data-c]").forEach(b=>b.onclick=()=>{R.conf=+b.dataset.c;step1()});}
  $("#go").onclick=()=>{
    if(R.locked){R.step=2;lesson();return}
    if(R.judge===null){R.nudge=true;step1();$('[data-key="jtrue"]').focus();return}
    const p=R.conf/100, okk=R.judge===truth; R.judgeOk=okk; R.locked=true;
    S.bets.push({p,o:okk?1:0,t:Date.now()});
    if(!truth){const w=(p-.5)*2; S.post[R.bug]=R.judge?bayes(S.post[R.bug],LIK.accHas,LIK.accNo,w):bayes(S.post[R.bug],1-LIK.accHas,1-LIK.accNo,w);}
    save();beep(okk);step1();live(`${okk?L("Дәл таптың","Верно"):L("Қателестің","Ошибся")}. ${pts(betPoints(p,okk))}`);
  };
}
/* ---- 2. Болжа ---- */
function step2(){
  const ans=solve(R.bug,R.t2), same=(x,y)=>R.tp==="cmp"?x===y:(TOPICS[R.tp].same(x,y)&&(x.raw||"")===(y.raw||""));
  if(!R.opts2){let o=R.tp==="cmp"?[">","<"]:rulesOf(R.tp).map(r=>solve(r,R.t2)).concat([BUILD[R.tp].run(R.t2,[0,1])]);const u=[];o.forEach(x=>{if(!u.some(y=>same(x,y)))u.push(x)});R.opts2=shuffle(u).slice(0,4);if(!R.opts2.some(x=>same(x,ans)))R.opts2[0]=ans}
  const lab=x=>R.tp==="cmp"?fmt(R.t2,x):D.str(x);
  L_(`${H1(2,L("Ерлан келесі есепке не деп жазады?","Что Ерлан напишет в следующей задаче?"))}<p class="note-line">${L("Дұрыс жауапты емес, <b>Ерланның</b> жауабын болжа. Заңдылық көрінетін жолдарды басып белгілей аласың.","Предскажи не верный ответ, а ответ <b>Ерлана</b>. Строки с закономерностью можно отметить нажатием.")}</p>
   <div class="nb sheet lifted">${nb({items:R.notes.map((t,i)=>({text:lineOf(R.bug,t).text,btn:true,hl:R.hl.includes(i)})),face:"sure"})}</div>
   <div class="stack"><p class="ink" style="font-size:22px">${esc(TQ(R.t2))}</p>
    <div class="opts" style="grid-template-columns:repeat(${Math.min(2,R.opts2.length)},1fr)">${R.opts2.map((x,i)=>`<button class="opt ink ${R.pred!==null?(same(x,ans)?"right":i===R.pred?"wrong":"dim"):""}" data-p="${i}" data-key="p${i}" ${R.pred!==null?"disabled":""}><b>${esc(lab(x))}</b>${R.pred!==null&&same(x,ans)?`<small>${L("Ерлан осылай жазады","Так напишет Ерлан")}</small>`:""}</button>`).join("")}</div></div>
   ${R.pred!==null?`<p class="fb ${R.predOk?"ok":""}"><b>${R.predOk?L("Иә, Ерлан дәл солай жазады.","Да, Ерлан напишет именно так."):L("Ерлан басқаша жазады.","Ерлан напишет иначе.")}</b> ${R.predOk?L("Сен оның ойлау жолын ұстадың.","Ты уловил ход его мысли."):L("Келесі қадамда оның ережесіне мұқият қара.","На следующем шаге присмотрись к его правилу.")}</p>
    <div class="actionbar"><button class="btn primary lg" id="go" data-key="go">${L("Диагноз қою","Поставить диагноз")}</button></div>`:""}`);
  $$("[data-hl]").forEach(b=>b.onclick=()=>{const i=+b.dataset.hl;R.hl=R.hl.includes(i)?R.hl.filter(x=>x!==i):R.hl.concat(i);
    b.closest(".ln").classList.toggle("hl");b.setAttribute("aria-pressed",R.hl.includes(i));saveR()});
  $$("[data-p]").forEach(b=>b.onclick=()=>{R.pred=+b.dataset.p;R.predOk=same(R.opts2[R.pred],ans);beep(R.predOk);step2();$("#go").focus()});
  $("#go")&&($("#go").onclick=()=>{R.step=3;lesson()});
}
/* ---- 3. Диагноз: кеңес баспалдағы ---- */
function contradiction(pick){const all=R.notes.concat([R.t2]);
  for(let i=0;i<all.length;i++){const t=all[i],e=solve(R.bug,t),c=solve(pick,t);
    if(!TOPICS[R.tp].same(e,c)||(e.raw||"")!==(c.raw||"")) return {i,mine:fmt(t,c)}}
  return null}
function step3(){
  const found=R.diag.includes(R.bug), wrong=R.diag.filter(d=>d!==R.bug), reveal=!found&&wrong.length>=2, last=wrong[wrong.length-1];
  const hint=!found&&last?contradiction(last):null, all=R.notes.concat([R.t2]);
  L_(`${H1(3,L("Ерлан қай ережемен шығарып жүр?","По какому правилу решает Ерлан?"))}<p class="note-line">${L("Оның барлық жауабын түсіндіретін ережені таңда.","Выбери правило, которое объясняет все его ответы.")}</p>
   <div class="nb sheet lifted">${nb({items:all.map((t,i)=>{const l=lineOf(R.bug,t);return {text:l.text,ok:l.okv?true:false,ring:hint&&hint.i===i,fix:hint&&hint.i===i&&wrong.length===1?L(`бұл ереже бойынша: ${hint.mine}`,`по этому правилу: ${hint.mine}`):""}}),face:found||reveal?"corrected":"sure"})}</div>
   <div class="opts">${R.cards.map((r,i)=>{const st=r===R.bug&&(found||reveal)?"right":R.diag.includes(r)?"wrong":"";
     return `<button class="opt ${st}" data-d="${r}" data-key="d${i}" ${found||reveal||R.diag.includes(r)?"disabled":""}><b>${RT(r).title}</b><small>${RT(r).desc}</small></button>`}).join("")}</div>
   ${found?`<p class="fb ok"><b>${R.diagOk?L("Диагноз дәл.","Точный диагноз."):L("Енді таптың.","Теперь нашёл.")}</b> ${L("Ерланның ережесі","Правило Ерлана")}: ${RT(R.bug).short}.</p>`
    :reveal?`<p class="fb"><b>${L("Жауабы:","Ответ:")}</b> ${RT(R.bug).short}. ${L("Белгіленген жолға қара: Ерлан дәл осы ережемен жазды.","Посмотри на отмеченную строку: Ерлан писал именно по этому правилу.")}</p>`
    :last?`<p class="fb bad"><b>${L("Бұл ереже бәрін түсіндірмейді.","Это правило объясняет не всё.")}</b> ${L(`${hint.i+1}-жолды қара: бұл ережемен Ерлан «${hint.mine}» деп жазар еді.`,`Посмотри на строку ${hint.i+1}: по этому правилу Ерлан написал бы «${hint.mine}».`)} ${L("Тағы бір рет таңда.","Выбери ещё раз.")}</p>`:""}
   ${found||reveal?`<div class="actionbar"><button class="btn primary lg" id="go" data-key="go">${L("Ерланды түзету","Исправить Ерлана")}</button></div>`:""}`);
  $$("[data-d]:not(:disabled)").forEach(b=>b.onclick=()=>{const r=b.dataset.d;R.diag.push(r);if(R.diag.length===1)R.diagOk=r===R.bug;beep(r===R.bug);step3();
    const nx=$("#go")||$("[data-d]:not(:disabled)");nx&&nx.focus()});
  $("#go")&&($("#go").onclick=()=>{R.step=4;lesson()});
}
/* ---- 4. Түзет: ереже құрастырғыш ---- */
function step4(){
  const B=BUILD[R.tp], passed=R.res&&R.res.every(x=>x.ok), cur=B.run(R.t2,R.build);
  const tests=R.res?`<div class="stack" style="gap:8px"><h2 class="d-h4">${L("Жасырын сынақ","Скрытая проверка")} <span class="tag ${passed?"ok":"bad"}">${R.res.filter(x=>x.ok).length}/5</span></h2><div class="tests">${R.res.map((x,i)=>`<div class="test${x.ok?"":" fail"}" style="animation-delay:${REDUCED()?0:i*110}ms"><span class="ink">${esc(x.line)}${x.ok?"":'<i class="strike" style="animation-delay:'+(REDUCED()?0:i*110+150)+'ms" aria-hidden="true"></i>'}</span>${x.ok?TICK:`<span class="tag bad">${ic("cross")}${L("құлады","не прошёл")}</span>`}${x.ok?"":`<span class="why">${esc(x.fix)}</span>`}</div>`).join("")}</div></div>`:"";
  if(passed){
    const sound=!S.askedSound?`<p class="cap">${L("Дыбыс әдепкіде өшірулі.","Звук по умолчанию выключен.")} <button class="link" id="sndAsk" style="font-size:13px">${L("Дыбысты қосу","Включить звук")}</button></p>`:"";
    L_(`${H1(4,L("Ерлан түзелді","Ерлан исправлен"))}
     <div class="nb sheet lifted">${nb({items:[{text:fmt(R.t2,solve(okRule(R.tp),R.t2)),ok:true}],face:"proud"})}</div>
     ${STAMP()}${tests}
     <div class="sheet margin" style="padding:16px 18px 16px 64px"><span class="d-label">${L("Неге ескі ереже қате болды","Почему старое правило было неверным")}</span><h2 class="d-h3" style="margin:4px 0 6px">${RT(R.bug).short}</h2><p style="color:var(--graphite-2)">${RT(R.bug).why}</p></div>
     <div class="sum">${[[L("Тексеру","Проверка"),R.judgeOk],[L("Болжам","Прогноз"),R.predOk],[L("Диагноз","Диагноз"),R.diagOk],[L("Түзету","Исправление"),R.tries===1]].map(([k,v],i)=>`<div>${k}<b>${ic(v?"tick":"cross")}${i===3?R.tries+"-"+L("әрекет","попытка"):v?L("дәл","верно"):L("қате","неверно")}</b></div>`).join("")}</div>
     ${sound}
     <div class="actionbar"><button class="btn primary lg" id="again" data-key="again">${L("Келесі раунд","Следующий раунд")}</button><a class="btn quiet lg" href="#dashboard">${L("Нәтижелерім","Мои результаты")}</a></div>`);
    $("#again").onclick=()=>{newRound();lastStep=0;lesson();scrollTo({top:0})};
    $("#sndAsk")&&($("#sndAsk").onclick=()=>{S.sound=true;S.askedSound=true;save();paintChrome();step4()});
    return;
  }
  L_(`${H1(4,L("Ерланның ережесін қайта құрастыр","Пересобери правило Ерлана"))}<p class="note-line">${L("Ауыстырғыштар Ерланның қазіргі ережесін көрсетеді. Оларды өзгертсең, жауабы бірден өзгереді. Дайын болғанда, Ерлан бес жасырын есепті шынымен шығарады.","Переключатели показывают текущее правило Ерлана. Меняй их — ответ сразу изменится. Когда будешь готов, Ерлан действительно решит пять скрытых задач.")}</p>
   <div class="builder sheet" style="padding:16px">${B.sw.map((g,gi)=>`<div class="swg" role="radiogroup" aria-labelledby="sw${gi}"><span class="d-label" id="sw${gi}">${g[LANG]}</span><div class="seg">${g.o[LANG].map((o,oi)=>`<button role="radio" aria-checked="${R.build[gi]===oi}" aria-pressed="${R.build[gi]===oi}" data-sw="${gi}:${oi}" data-key="sw${gi}${oi}">${o}</button>`).join("")}</div></div>`).join("")}
    <div class="preview-line" aria-live="polite"><span class="cap">${L("Ерлан енді былай жазады","Теперь Ерлан напишет")}:</span><span class="ink">${esc(fmt(R.t2,cur))}</span></div></div>
   ${tests}
   ${R.res&&!passed?`<p class="fb bad"><b>${L("Ерлан әлі қателесіп жүр.","Ерлан всё ещё ошибается.")}</b> ${L("Құлаған есептерге қара: қай разряд дұрыс болмады? Ауыстырғышты өзгертіп, қайта іске қос.","Посмотри на непройденные задачи: какой разряд не сошёлся? Измени переключатель и запусти снова.")}</p>`:""}
   <div class="actionbar"><button class="btn primary lg" id="run" data-key="run">${L("Жасырын сынақты іске қосу","Запустить скрытую проверку")}</button></div>`);
  $$("[data-sw]").forEach(b=>b.onclick=()=>{const [g,o]=b.dataset.sw.split(":").map(Number);R.build[g]=o;R.res=null;step4()});
  $("#run").onclick=()=>{R.tries++;const run=buildRun(R.tp,R.build), tests=HIDDEN[R.tp].map(k=>genTask(R.tp,k));
    R.res=tests.map(t=>{const a=run(t);return {line:fmt(t,a),ok:isRight(t,a),fix:fixText(t)}});
    const ok=R.res.every(x=>x.ok), m=buildMatch(R.tp,R.build);
    if(m&&RULES[m].bug) S.post[m]=bayes(S.post[m],LIK.pickHas,LIK.pickNo);
    if(R.tries===1) bktUpdate(R.tp,ok);
    if(ok&&!R.done){R.done=true;S.seen[R.bug]++;S.played[R.tp]=1;S.hist.push({bug:R.bug,judgeOk:R.judgeOk,conf:R.conf/100,predOk:R.predOk,diagOk:R.diagOk,tries:R.tries,fixed1:R.tries===1,t:Date.now()});}
    save();beep(ok);step4();live(ok?L("Ерлан түзелді, 5/5","Ерлан исправлен, 5 из 5"):`${R.res.filter(x=>x.ok).length}/5`);
    const f=$("#again")||$("#run");f&&f.focus({preventScroll:true});
  };
}
APP.lesson=(fromRoute)=>{ if(fromRoute&&(!R||R.done||forcedBug)){newRound(forcedBug);forcedBug=null} lesson(fromRoute) };

/* ---- Басты бет ---- */
function calChart(c){
  const W=360,Hh=236,p=38,x=v=>p+(v-.5)/.5*(W-p-12),y=v=>Hh-p-v*(Hh-p-12);
  let s=`<svg viewBox="0 0 ${W} ${Hh}" style="width:100%;height:auto" role="img" aria-label="${L("Калибрлеу қисығы","Кривая калибровки")}">`;
  for(const g of [0,.25,.5,.75,1]) s+=`<line x1="${p}" x2="${W-12}" y1="${y(g)}" y2="${y(g)}" style="stroke:var(--hair)"/><text x="${p-8}" y="${y(g)+4}" font-size="11" text-anchor="end" style="fill:var(--muted)">${g*100}%</text>`;
  for(const g of [.5,.6,.7,.8,.9,1]) s+=`<text x="${x(g)}" y="${Hh-p+18}" font-size="11" text-anchor="middle" style="fill:var(--muted)">${Math.round(g*100)}%</text>`;
  s+=`<line x1="${x(.5)}" y1="${y(.5)}" x2="${x(1)}" y2="${y(1)}" style="stroke:var(--graphite-2)" stroke-dasharray="4 5"/>`;
  const pts_=c.bins.filter(b=>b.n);
  if(pts_.length>1) s+=`<polyline fill="none" style="stroke:var(--ink)" stroke-width="2.2" stroke-linejoin="round" points="${pts_.map(b=>x(b.conf)+","+y(b.acc)).join(" ")}"/>`;
  pts_.forEach(b=>{s+=`<circle cx="${x(b.conf)}" cy="${y(b.acc)}" r="${4+Math.min(5,b.n)}" style="fill:var(--ink);stroke:var(--sheet)" stroke-width="2"><title>${b.n} · ${pct(b.acc)}</title></circle>`});
  return s+"</svg>";
}
function dataTools(){return `<div class="row" style="margin-top:14px"><button class="btn sm quiet" id="exp">${ic("down")}${L("Деректерді сақтау","Сохранить данные")}</button><label class="btn sm quiet" for="imp" style="cursor:pointer">${ic("up")}${L("Файлдан жүктеу","Загрузить из файла")}</label><input type="file" id="imp" accept="application/json,.json" hidden></div>`}
function wireData(){
  $("#exp")&&($("#exp").onclick=()=>{const blob=new Blob([JSON.stringify(S,null,1)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="shakirt-data.json";document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);toast(L("Файл сақталды","Файл сохранён"))});
  $("#imp")&&($("#imp").onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const o=JSON.parse(t);if(!o||o.v!==1||!o.post)throw 0;S=Object.assign(fresh(),o);save();toast(L("Деректер жүктелді","Данные загружены"));route()}).catch(()=>toast(L("Бұл Шәкірт файлы емес","Это не файл Шәкірт")))});
}
APP.dashboard=()=>{
  const c=calib(), n=S.hist.length, going=R&&!R.done&&(R.step>1||R.locked);
  if(!n){
    $("#screen").innerHTML=`<div class="page-h"><span class="d-label">${L("Басты","Главная")}</span><h1 class="d-h1" tabindex="-1">${L("Ерлан сені күтіп отыр","Ерлан ждёт тебя")}</h1></div>
     <div class="sheet margin start gridpaper"><div class="face">${erlan("sure")}</div><h2 class="d-h3">${going?L("Аяқталмаған раунд бар","Есть незаконченный раунд"):L("Бірінші раундты баста","Начни первый раунд")}</h2>
      <p style="color:var(--graphite-2);max-width:56ch">${L("Ерлан ондық бөлшектерді қате ережемен шығарады. Тексер, болжа, диагноз қой, түзет — үш-төрт минут. Бірінші раундтан кейін осында калибрлеу қисығы, тақырып бойынша шеберлік және Айна пайда болады.","Ерлан решает десятичные дроби по неверному правилу. Проверь, предскажи, поставь диагноз, исправь — три-четыре минуты. После первого раунда здесь появятся кривая калибровки, мастерство по темам и Зеркало.")}</p>
      <div><a class="btn primary lg" href="#lesson">${going?L("Жалғастыру","Продолжить"):L("Ерланды түзету","Исправить Ерлана")}</a></div></div>
     <a class="link" href="#home">${L("Жоба туралы","О проекте")}${ic("arrow")}</a>`;
    return;
  }
  const flagged=BUGS.filter(b=>S.post[b]>=.5);
  $("#screen").innerHTML=`<div class="page-h"><span class="d-label">${L("Басты","Главная")}</span><h1 class="d-h1" tabindex="-1">${L("Сенің дәптерің","Твоя тетрадь")}</h1></div>
   <div class="sheet margin start"><div class="face">${erlan(going?"puzzled":"sure")}</div><h2 class="d-h3">${going?L("Аяқталмаған раунд бар","Есть незаконченный раунд"):L("Келесі раундқа дайынсың ба?","Готов к следующему раунду?")}</h2>
    <div class="row"><a class="btn primary lg" href="#lesson">${going?L(`${R.step}-қадамнан жалғастыру`,`Продолжить с шага ${R.step}`):L("Ерланды түзету","Исправить Ерлана")}</a></div></div>
   <div class="tiles">
    <div class="sheet tile"><span class="num">${n}</span><span>${L("аяқталған раунд","завершённых раундов")}</span></div>
    <div class="sheet tile"><span class="num">${S.hist.filter(h=>h.fixed1).length}/${n}</span><span>${L("бірінші әрекеттен түзетілді","исправлено с первой попытки")}</span></div>
    <div class="sheet tile"><span class="num" style="color:${c.pts>=0?"var(--tick)":"var(--pen)"}">${pts(c.pts)}</span><span>${L("бәс ұпайы, тиынмен салыстырғанда","очки за ставки относительно монеты")}</span></div>
    <div class="sheet tile"><span class="num">${(c.over>0?"+":c.over<0?"−":"")+Math.abs(Math.round(c.over*100))}</span><span>${c.over>.05?L("п.п. артық сенімділік","п.п. излишней уверенности"):c.over<-.05?L("п.п. кем сенімділік","п.п. недостаточной уверенности"):L("п.п. — жақсы калибрленген","п.п. — хорошая калибровка")}</span></div>
   </div>
   <div class="cols c75">
    <div class="sheet panel"><h2>${L("Калибрлеу қисығы","Кривая калибровки")}</h2>${calChart(c)}<p class="hint">${L("Үзік сызық — мінсіз калибрлеу. Нүкте оған жақын болса, «80% сенімдімін» дегенің шынымен 80% жағдайда дұрыс.","Пунктир — идеальная калибровка. Чем ближе точки, тем точнее твоё «уверен на 80%».")}</p></div>
    <div class="sheet panel"><h2>${L("Тақырып бойынша шеберлік","Мастерство по темам")}</h2><div class="stack">
     ${Object.keys(TOPICS).map(t=>`<div class="stack" style="gap:6px"><div class="row" style="justify-content:space-between;font-size:15px"><span>${TN(t)}</span><b>${S.played[t]?pct(S.bkt[t]):`<span class="cap">${L("басталмаған","не начато")}</span>`}</b></div><div class="bar"><i style="width:${S.played[t]?S.bkt[t]*100:0}%"></i></div></div>`).join("")}</div>
     <p class="hint">${L("Ерланды бірінші әрекеттен түзеткен сайын баға өседі (Bayesian Knowledge Tracing).","Оценка растёт, когда исправляешь Ерлана с первой попытки (Bayesian Knowledge Tracing).")}</p></div>
   </div>
   <div class="cols">
    <div class="sheet panel"><h2>${L("Айна","Зеркало")}</h2>${flagged.length?`<p style="color:var(--graphite-2);margin-bottom:6px">${L("Сенде де болуы мүмкін түсініктер:","Возможно, это есть и у тебя:")}</p>${mirrorRows(flagged,null,true)}`:`<p class="empty">${L("Әзірге ешбір жаңылыс түсінік 50%-дан жоғары бағаланған жоқ.","Пока ни одно заблуждение не оценено выше 50%.")}</p>`}
     <a class="link" href="#mirror" style="margin-top:10px">${L("Айнаны ашу","Открыть Зеркало")}${ic("arrow")}</a></div>
    <div class="sheet panel"><h2>${L("Соңғы раундтар","Последние раунды")}</h2><div class="tbl"><table><tr><th>${L("Ерланның қатесі","Ошибка Ерлана")}</th><th>${L("Бәс","Ставка")}</th><th>${L("Түзету","Исправление")}</th></tr>
     ${S.hist.slice(-5).reverse().map(h=>`<tr><td>${RT(h.bug).short}<div class="cap">${TS(RULES[h.bug].topic)}</div></td><td><span class="tag ${h.judgeOk?"ok":"bad"}">${pct(h.conf)}</span></td><td>${h.tries}-${L("әрекет","попытка")}</td></tr>`).join("")}</table></div></div>
   </div>`;
  $$("#screen [data-rule]").forEach(r=>r.onclick=()=>openRule(r.dataset.rule));
  $("#screen").insertAdjacentHTML("beforeend",`<a class="link" href="#home">${L("Жоба туралы","О проекте")}${ic("arrow")}</a>`);
};
APP.mirror=()=>{
  const any=S.hist.length>0;
  $("#screen").innerHTML=`<div class="page-h"><span class="d-label">${L("Айна","Зеркало")}</span><h1 class="d-h1" tabindex="-1">${L("Сенің жаңылыс түсініктерің","Твои заблуждения")}</h1><p>${L("Ерланның қатесін байқамай қалсаң немесе қате ережені құрастырсаң, сенде де сол түсінік болуы мүмкін. Жолды басып, ереженің өзін аш.","Если ты пропустил ошибку Ерлана или собрал неверное правило, возможно, у тебя то же заблуждение. Нажми на строку, чтобы открыть само правило.")}</p></div>
   <div class="sheet panel" style="margin-bottom:14px">${any?"":`<p class="fb amb" style="margin-bottom:8px"><b>${L("Дерек әлі жоқ.","Данных пока нет.")}</b> ${L(`Барлық баға бастапқы ${pct(PRIOR)} деңгейде. Бірінші раундтан кейін өзгереді.`,`Все оценки на начальном уровне ${pct(PRIOR)}. Они изменятся после первого раунда.`)}</p>`}${mirrorRows(BUGS.slice().sort((a,b)=>S.post[b]-S.post[a]),null,true)}</div>
   <div class="cols">
    <div class="sheet panel"><h2>${L("Бағалар қалай есептеледі","Как считаются оценки")}</h2><p style="color:var(--graphite-2)">${L("Әр бақылаудан кейін ықтималдық Байес формуласымен жаңарады. 50%-ға жақын бәстің салмағы аз, сенімді бәс көбірек ақпарат береді. Келесі раундтың қатесін жүйе ең көп ақпарат беретін түсінік бойынша таңдайды.","После каждого наблюдения вероятность пересчитывается по формуле Байеса. Ставка около 50% почти ничего не меняет, уверенная ставка даёт больше информации. Ошибку для следующего раунда система выбирает там, где узнает больше всего.")}</p>
     <p class="fb amb" style="margin-top:12px"><b>${L("Шектеу.","Ограничение.")}</b> ${L(`Модель параметрлері (мысалы, қатесі бар оқушы оны ${pct(LIK.accHas)} жағдайда қабылдайды) — сарапшылық болжам. Бұл диагноз емес.`,`Параметры модели (например, ученик с заблуждением принимает ошибку в ${pct(LIK.accHas)} случаев) — экспертное предположение. Это не диагноз.`)}</p></div>
    <div class="sheet panel"><h2>${L("Деректер","Данные")}</h2><p style="color:var(--graphite-2)">${L("Деректер тек осы құрылғыда сақталады. Басқа құрылғыға көшіру үшін файлға сақта да, сол жерде жүкте.","Данные хранятся только на этом устройстве. Чтобы перенести их, сохрани файл и загрузи его на другом устройстве.")}</p>${dataTools()}
     <button class="link" id="reset" style="margin-top:16px;color:var(--pen)">${L("Барлық деректі өшіру","Удалить все данные")}</button></div>
   </div>`;
  $$("#screen [data-rule]").forEach(r=>r.onclick=()=>openRule(r.dataset.rule)); wireData();
  $("#reset").onclick=()=>openModal(`<div class="modal-h"><h2 class="d-h3" id="mt">${L("Барлық деректі өшіру керек пе?","Удалить все данные?")}</h2>${closeBtn()}</div><p style="color:var(--graphite-2)">${L("Раундтар тарихы, бәстер және Айна бағалары осы құрылғыдан өшіріледі. Мұны қайтару мүмкін емес.","История раундов, ставки и оценки Зеркала будут удалены с этого устройства. Это нельзя отменить.")}</p><div class="row"><button class="btn quiet" data-x>${L("Бас тарту","Отмена")}</button><button class="btn primary" id="yes">${L("Иә, өшіру","Да, удалить")}</button></div>`,
    m=>{$("#yes",m).onclick=()=>{S=fresh();R=null;store.del("shakirt_round");save();closeModal();toast(L("Деректер өшірілді","Данные удалены"));APP.mirror();renderMirrorPrev()}});
};

/* ---- Пернетақта: 1/2 — Дұрыс/Қате, ←/→ — сенімділік, Enter — негізгі әрекет ---- */
addEventListener("keydown",e=>{
  if($(".modal")||$(".menu")||e.metaKey||e.ctrlKey||e.altKey) return;
  const tag=(e.target.tagName||"").toLowerCase(); if(tag==="input"||tag==="textarea") return;
  const inLesson=document.body.dataset.mode==="app"&&location.hash==="#lesson"&&R;
  const inDemo=document.body.dataset.mode==="site"&&$("#demo").contains(document.activeElement);
  if(!inLesson&&!inDemo) return;
  const st=inLesson?R:DEMO, locked=inLesson?R.locked||R.step!==1:DEMO.done, pre=inLesson?"":"d";
  if(!locked&&(e.key==="1"||e.key==="2")){e.preventDefault();$(`[data-${pre}j="${e.key==="1"}"]`).click();return}
  if(!locked&&(e.key==="ArrowLeft"||e.key==="ArrowRight")&&!e.target.closest(".seg")){e.preventDefault();const i=Math.max(0,Math.min(5,CONF.indexOf(st.conf)+(e.key==="ArrowRight"?1:-1)));$(`[data-${pre}c="${CONF[i]}"]`).click();return}
  if(inLesson&&R.step!==1&&/^[1-5]$/.test(e.key)){const b=$$("#screen .opt:not(:disabled)")[+e.key-1];if(b){e.preventDefault();b.click()}}
});
