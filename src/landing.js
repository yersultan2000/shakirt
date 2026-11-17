/* ============================================================
   Шәкірт — лендинг: тірі дәптер, 100 орын, жабысқақ дәптер,
   қателер индексі, Айна алдын ала көрінісі, ғылым, сұрақтар.
   ============================================================ */
/* --- Hero: ойналатын дәптер --- */
const DEMO={order:["add_sep","cmp_long","mul_max","m10_zero","cmp_short","add_right","mul_ign","m10_int"],i:0};
const CONF=[50,60,70,80,90,100];
function demoNew(){const b=DEMO.order[DEMO.i%8],tp=RULES[b].topic,[hit,miss]=BUGGEN[b];
  Object.assign(DEMO,{b,t:genTask(tp,DEMO.i%3===2?miss:hit),judge:null,conf:80,done:false,nudge:false});renderDemo()}
function judgeTargets(sel,done,truth,prefix=""){
  return `<div class="judge" role="group" aria-label="${L("Ерланның жауабы","Ответ Ерлана")}">${[[true,"tick",L("Дұрыс","Верно"),"1","t-ok"],[false,"cross",L("Қате","Неверно"),"2","t-bad"]].map(([v,i,s,k,c])=>
   `<button class="target ${c} ${done?(v===truth?"right":sel===v?"wrong":""):""}" data-${prefix}j="${v}" data-key="${prefix}j${v}" aria-pressed="${sel===v}" ${done?"disabled":""}><svg class="ic" aria-hidden="true"><use href="#i-${i}"/></svg>${s}<span class="k" aria-hidden="true">${k}</span></button>`).join("")}</div>`}
function confChips(conf,done,prefix=""){
  return `<div class="conf"><div class="row-h"><b id="${prefix}confL">${L("Қаншалықты сенімдісің?","Насколько ты уверен?")}</b><span class="cap">${L("50 — болжам, 100 — толық сенімдімін","50 — наугад, 100 — полностью уверен")}</span></div>
   <div class="chips6" role="radiogroup" aria-labelledby="${prefix}confL">${CONF.map(c=>`<button role="radio" aria-checked="${conf===c}" aria-pressed="${conf===c}" data-${prefix}c="${c}" data-key="${prefix}c${c}" ${done?"disabled":""}>${c}</button>`).join("")}</div></div>`}
const betLabel=(judge,conf)=>judge===null?L("Алдымен «Дұрыс» не «Қате» таңда","Сначала выбери «Верно» или «Неверно»"):L(`${conf}%-ға бәс тігу`,`Поставить ${conf}%`);
function renderDemo(){
  const {b,t,judge,conf,done}=DEMO, l=lineOf(b,t), ok=done&&judge===l.okv, p=conf/100;
  const face=!done?"sure":(!l.okv&&judge===false)?"corrected":(!l.okv)?"sure":(ok?"proud":"puzzled");
  const item={text:l.text,ring:judge===false&&!(done&&l.okv),ok:judge===true&&!(done&&!l.okv)?true:undefined,strike:done&&!l.okv&&judge!==false,fix:done&&!l.okv?fixText(t):""};
  $("#demo").innerHTML=`${nb({items:[item],face,title:L("Ерланның дәптері","Тетрадь Ерлана"),right:`<span class="cap">${TS(t.tp)} · ${DEMO.i%8+1}/8</span>`})}
   <div class="body">
    ${done?`<div class="result"><span class="pts ${betPoints(p,ok)>=0?"pos":"neg"}">${pts(betPoints(p,ok))}</span><span class="note-line">${ok?L("Дәл таптың.","Верно.")+" ":L("Бұл жолы қателестің.","В этот раз ошибся.")+" "}${L("Ұпай тиын лақтырумен салыстырғанда: 50% бәс — 0.","Очки относительно подброшенной монеты: ставка 50% — это 0.")}</span></div>
     <p class="note-line">${l.okv?L("Жауап шынында дұрыс, бірақ Ерланның ережесі бәрібір қате: бұл есепте кездейсоқ дұрыс шықты.","Ответ действительно верный, но правило Ерлана всё равно неверное: здесь оно случайно сработало."):`${L("Ерланның ережесі","Правило Ерлана")}: <b>${RT(b).short}</b>.`}</p>
     <div class="row"><button class="btn primary" id="dnext" data-key="dnext">${L("Келесі мысал","Следующий пример")}</button><a class="link" href="#lesson">${L("Толық раунд","Полный раунд")}${ic("arrow")}</a></div>`
    :`${judgeTargets(judge,false,null,"d")}${confChips(conf,false,"d")}
     ${DEMO.nudge&&judge===null?`<p class="status" role="alert">${L("Алдымен Ерланның жауабын бағала: «Дұрыс» не «Қате».","Сначала оцени ответ Ерлана: «Верно» или «Неверно».")}</p>`:""}
     <button class="btn primary lg" id="dgo" data-key="dgo" ${judge===null?'aria-disabled="true"':""}>${betLabel(judge,conf)}</button>`}
   </div>`;
  const box=$("#demo");
  if(!done){
    $$("[data-dj]",box).forEach(x=>x.onclick=()=>{DEMO.judge=x.dataset.dj==="true";DEMO.nudge=false;keepFocus(renderDemo,x.dataset.key)});
    $$("[data-dc]",box).forEach(x=>x.onclick=()=>{DEMO.conf=+x.dataset.dc;keepFocus(renderDemo,x.dataset.key)});
    $("#dgo",box).onclick=()=>{ if(DEMO.judge===null){DEMO.nudge=true;keepFocus(renderDemo,"djtrue");return}
      DEMO.done=true; const okk=DEMO.judge===l.okv; beep(okk); keepFocus(renderDemo,"dnext");
      live(`${okk?L("Дәл таптың","Верно"):L("Қателестің","Ошибся")}. ${pts(betPoints(DEMO.conf/100,okk))}`); };
  } else $("#dnext",box).onclick=()=>{DEMO.i++;demoNew();const f=$("[data-key='djtrue']");f&&f.focus()};
}
/* re-render while keeping keyboard focus on the equivalent control */
function keepFocus(fn,key){const k=key||(document.activeElement&&document.activeElement.dataset&&document.activeElement.dataset.key);fn();if(k){const el=$(`[data-key="${k}"]`);el&&el.focus({preventScroll:true})}}

/* --- 100 орын --- */
function renderSeats(){
  const on=new Set(shuffle(Array.from({length:100},(_,i)=>i)).slice(0,56));
  $("#seats").innerHTML=Array.from({length:100},(_,i)=>on.has(i)?`<i class="seat on" style="--d:${i}"><svg viewBox="0 0 40 40" aria-hidden="true"><circle pathLength="1" cx="20" cy="20" r="16" style="animation-delay:${(i%10)*30+Math.floor(i/10)*40}ms"/></svg></i>`:`<i class="seat"></i>`).join("");
  if(REDUCED()||!("IntersectionObserver" in window)){$("#classFig").classList.add("go");return}
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){$("#classFig").classList.add("go");io.disconnect()}}),{threshold:.35});io.observe($("#seats"));
}

/* --- Қалай жұмыс істейді: жабысқақ дәптер, таймерсіз --- */
const EX={t1:{a:D.mk(25,2),b:D.mk(3,1),tp:"cmp"},notes:[[41,2,6,1],[8,1,15,2],[57,2,7,1]].map(([a,x,b,y])=>({a:D.mk(a,x),b:D.mk(b,y),tp:"cmp"})),t2:{a:D.mk(72,2),b:D.mk(9,1),tp:"cmp"}};
let howI=0;
function howFrame(i){const B="cmp_long";
  if(i===0) return `<div class="nb sheet">${nb({items:[{text:lineOf(B,EX.t1).text,ring:true}],face:"sure",title:L("1 · Тексер","1 · Проверь")})}<div class="body stack" style="padding:16px">${judgeTargets(false,false,null,"x").replace(/<button/g,'<button tabindex="-1"')}${confChips(80,true,"x")}</div></div>`;
  if(i===1) return `<div class="nb sheet">${nb({items:EX.notes.map(t=>({text:lineOf(B,t).text})),face:"sure",title:L("2 · Болжа","2 · Предскажи")})}<div class="stack" style="padding:16px"><p class="ink" style="font-size:20px">${esc(TQ(EX.t2))}</p><div class="opts" style="grid-template-columns:1fr 1fr"><div class="opt right ink"><b>0.72 &gt; 0.9</b><small>${L("Ерлан осылай жазады","Так напишет Ерлан")}</small></div><div class="opt ink"><b>0.72 &lt; 0.9</b><small>${L("дұрыс жауап","верный ответ")}</small></div></div></div></div>`;
  if(i===2) return `<div class="nb sheet">${nb({items:EX.notes.concat([EX.t2]).map(t=>{const l=lineOf(B,t);return {text:l.text,ok:l.okv?true:false}}),face:"corrected",title:L("3 · Диагноз қой","3 · Поставь диагноз")})}<div class="opts" style="padding:16px">${["cmp_long","cmp_short","cmp_ok"].map(r=>`<div class="opt ${r===B?"right":""}"><b>${RT(r).title}</b></div>`).join("")}</div></div>`;
  const ts=HIDDEN.cmp.map(k=>genTask("cmp",k));
  return `<div class="nb sheet"><div class="nb-title" style="padding-left:18px"><span>${L("4 · Түзет: ережені өзің құрастыр","4 · Исправь: собери правило сам")}</span></div><div class="stack" style="padding:16px">
   ${BUILD.cmp.sw.map((g,gi)=>`<div class="swg"><span class="d-label">${g[LANG]}</span><div class="seg">${g.o[LANG].map((o,oi)=>`<span class="chip" style="min-height:36px" ${oi===0?'aria-pressed="true"':""}>${o}</span>`).join("")}</div></div>`).join("")}
   <div class="tests">${ts.map((t,i)=>`<div class="test" style="animation-delay:${i*110}ms"><span class="ink">${esc(fmt(t,solve("cmp_ok",t)))}</span>${TICK}</div>`).join("")}</div></div></div>`;
}
const HOW=()=>[[L("Тексер","Проверь"),L("Ерланның жауабы дұрыс па? Қатені белгіле де, сенімділігіңе 50–100% бәс тік. Ұпай тиын лақтырумен салыстырылады.","Верен ли ответ Ерлана? Отметь ошибку и поставь на свою уверенность от 50 до 100%. Очки считаются относительно подброшенной монеты.")],
 [L("Болжа","Предскажи"),L("Дәптеріндегі заңдылыққа қарап, Ерланның келесі есепке не жазатынын болжа. Дұрыс жауапты емес, оның жауабын.","По записям в тетради предскажи, что Ерлан напишет в следующей задаче. Не верный ответ, а его ответ.")],
 [L("Диагноз қой","Поставь диагноз"),L("Оның барлық жауабын түсіндіретін ережені тап. Қате таңдасаң, жүйе қай жолды түсіндірмейтінін көрсетеді.","Найди правило, которое объясняет все его ответы. При неверном выборе система покажет строку, которую оно не объясняет.")],
 [L("Түзет","Исправь"),L("Ерланның ережесін ауыстырғыштардан қайта құрастыр. Ерлан оны бес жасырын есепте шынымен орындайды: сөзбен көндіру мүмкін емес.","Пересобери правило Ерлана из переключателей. Ерлан действительно выполнит его на пяти скрытых задачах: уговорить его нельзя.")]];
function renderHow(){
  $("#howSteps").innerHTML=HOW().map(([t,d],i)=>`<article class="how-step${i===howI?" on":""}" data-how="${i}"><span class="n">0${i+1}</span><h3 class="d-h2">${t}</h3><p class="lead">${d}</p><div class="mini" aria-hidden="true">${howFrame(i)}</div></article>`).join("");
  $("#howStage").innerHTML=`<div class="frame">${howFrame(howI)}</div>`;
  if(!("IntersectionObserver" in window)) return;
  const io=new IntersectionObserver(es=>{es.forEach(e=>{ if(!e.isIntersecting) return; const i=+e.target.dataset.how; if(i===howI) return; howI=i;
    $$(".how-step").forEach(s=>s.classList.toggle("on",+s.dataset.how===i));
    const f=$("#howStage .frame"); f.style.opacity=0; setTimeout(()=>{f.innerHTML=howFrame(i);f.style.opacity=1},REDUCED()?0:160); })},{rootMargin:"-45% 0px -45% 0px"});
  $$(".how-step").forEach(s=>io.observe(s));
}

/* --- Қателер индексі + сүзгі --- */
let libFilter="all";
function renderLib(){
  const counts={all:BUGS.length};BUGS.forEach(b=>{const t=RULES[b].topic;counts[t]=(counts[t]||0)+1});
  $("#filters").innerHTML=[["all",L("Барлығы","Все")],...Object.keys(TOPICS).map(k=>[k,TS(k)])].map(([k,s])=>`<button class="chip" data-f="${k}" aria-pressed="${libFilter===k}">${s}<span class="n">${counts[k]}</span></button>`).join("");
  $$("[data-f]",$("#filters")).forEach(c=>c.onclick=()=>{libFilter=c.dataset.f;renderLib()});
  $("#index").innerHTML=BUGS.map(b=>{const tp=RULES[b].topic,t=genTask(tp,BUGGEN[b][0]);
    return `<button class="irow${libFilter==="all"||libFilter===tp?"":" out"}" data-bug="${b}"><span class="ex ink">${esc(fmt(t,solve(b,t)))}</span><span><h4 class="d-h4">${RT(b).short}</h4><span class="cap">${RT(b).desc}</span></span><span class="meta"><span class="tag">${TS(tp)}</span><span class="go">${L("Ашу","Открыть")}${ic("arrow")}</span></span></button>`}).join("");
  $$(".irow").forEach(r=>r.onclick=()=>openRule(r.dataset.bug));
}

/* --- Айна алдын ала көрінісі: деректер болмаса — белгіленген мысал --- */
function mirrorRows(list,vals,link){return list.map((b,i)=>{const p=vals?vals[i]:S.post[b],col=p>=.5?"var(--pen)":p>=.3?"var(--amber)":"var(--graphite-2)";
  return `<${link?'button class="mrow pick"':'div class="mrow"'} data-rule="${b}"><span><b>${RT(b).short}</b><small>${TS(RULES[b].topic)}${vals?"":` · ${S.seen[b]} ${L("раунд","раунд.")}`}</small></span><span class="bar"><i style="width:${p*100}%;background:${col}"></i></span><span class="v">${pct(p)}</span></${link?"button":"div"}>`}).join("")}
function renderMirrorPrev(){
  const n=S.hist.length;
  if(!n){const ex=["cmp_long","add_sep","m10_zero","mul_max","cmp_short"];
    $("#miPrev").innerHTML=`<span class="example-badge" aria-hidden="true">${L("мысал","пример")}</span><h3 class="d-h4" style="margin-bottom:10px">${L("Бірнеше раундтан кейін Айна осындай болады","Так Зеркало выглядит после нескольких раундов")}</h3>${mirrorRows(ex,[.78,.52,.31,.12,.08])}<p class="cap" style="margin-top:10px">${L("Бұл — мысал. Сенің бағаларың бірінші раундтан кейін пайда болады.","Это пример. Твои оценки появятся после первого раунда.")}</p>`;
  } else {const top=BUGS.slice().sort((a,b)=>S.post[b]-S.post[a]).slice(0,5);
    $("#miPrev").innerHTML=`<h3 class="d-h4" style="margin-bottom:10px">${L("Сенің Айнаң","Твоё Зеркало")} <span class="tag">${n} ${L("раунд","раунд.")}</span></h3>${mirrorRows(top,null,true)}`;
    $$("#miPrev [data-rule]").forEach(r=>r.onclick=()=>openRule(r.dataset.rule));}
}

/* --- Ғылым (жиектегі ескертпелер) және сұрақтар --- */
const SCI=()=>[[.51,L("Еске түсіру практикасы","Практика извлечения"),L("«Болжа» қадамы: Ерланның жауабын жадтан құрастырасың.","Шаг «Предскажи»: ответ Ерлана восстанавливаешь по памяти."),"Adesope, Trevisan & Sundararajan, 2017"],
 [.42,L("Аралас жаттығу","Чередование тем"),L("Раундтар тақырыптарды араластырып береді.","Раунды чередуют темы."),"Brunmair & Richter, 2019"],
 [.41,L("Теріске шығару мәтіні","Опровергающий текст"),L("Диагноз және «Неге қате» түсіндірмесі.","Диагноз и объяснение «Почему неверно»."),"Schroeder & Kucera, 2022"],
 [.36,L("Өнімді сәтсіздік","Продуктивная неудача"),L("Алдымен өзің ізденесің, түсіндірме кейін келеді.","Сначала ищешь сам, объяснение — потом."),"Sinha & Kapur, 2021"]];
function renderSci(){$("#sci").innerHTML=SCI().map(([g,t,d,s])=>`<div class="sci"><span class="g"><b>${g.toFixed(2)}</b>g</span><h3 class="d-h4">${t}</h3><p style="color:var(--graphite-2)">${d}</p><span class="src">${s}</span></div>`).join("")}
const FAQ=()=>[
 [L("Бұл жай тест емес пе?","Это не обычный тест?"),L("Тестте оқушы өз жауабын береді. Мұнда ол басқаның шешімін тексереді, ережесін табады және түзетеді, ал түзету жасырын есептерде орындалып тексеріледі.","В тесте ученик даёт свой ответ. Здесь он проверяет чужое решение, находит правило и исправляет его, а исправление проверяется на скрытых задачах.")],
 [L("Неге ChatGPT-ге «қателесетін оқушы бол» деп айтпасқа?","Почему не попросить ChatGPT «изобразить ученика с ошибкой»?"),L("Тілдік модель қатені дәйекті ұстамайды және түзетуді тым оңай қабылдайды. Ерланның қатесі — код: ол әр есепте бірдей қателеседі және тек шын дұрыс ережеден кейін сынақтан өтеді.","Языковая модель не держит ошибку последовательно и слишком легко «исправляется». Ошибка Ерлана — это код: он ошибается одинаково и проходит проверку только с действительно верным правилом.")],
 [L("Айна диагноз қоя ма?","Зеркало ставит диагноз?"),L("Жоқ. Бұл ықтималдық бағасы. Модель параметрлері әзірге сарапшылық болжам, оларды нақты оқушылар дерегімен бағалау — пилоттың мақсаты.","Нет. Это оценка вероятности. Параметры модели пока экспертное предположение; оценить их на данных реальных учеников — задача пилота.")],
 [L("Интернет немесе тіркелу керек пе?","Нужен интернет или регистрация?"),L("Жоқ. Бет бір рет ашылғаннан кейін офлайн жұмыс істейді, оны телефонның басты экранына қосуға болады. Тілдік модель мен API кілті қолданылмайды.","Нет. После первого открытия страница работает офлайн, её можно добавить на главный экран телефона. Языковая модель и API-ключи не используются.")],
 [L("Деректер қайда сақталады?","Где хранятся данные?"),L("Тек осы құрылғыда. Серверге ештеңе жіберілмейді. Айна бетінде деректерді файлға сақтауға, қайта жүктеуге немесе өшіруге болады.","Только на этом устройстве. На сервер ничего не отправляется. На странице Зеркала данные можно сохранить в файл, загрузить обратно или удалить.")],
 [L("Тиімділігі дәлелденген бе?","Эффективность доказана?"),L("Әзірге жоқ. Әдістің бөліктері зерттелген, бірақ Шәкірттің өз әсерін бақыланатын эксперимент көрсетуі керек.","Пока нет. Части метода изучены, но эффект самого Шәкірт должен показать контролируемый эксперимент.")]];
function renderFaq(){$("#faqList").innerHTML=FAQ().map(([q,a])=>`<div class="qa"><h3>${q}</h3><p>${a}</p></div>`).join("")}

function renderSite(){renderDemo();renderHow();renderLib();renderMirrorPrev();renderSci();renderFaq()}
