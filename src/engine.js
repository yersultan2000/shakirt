/* ============================================================
   Шәкірт — қозғалтқыш (engine)
   1) Ондық сандар: бүтін сандармен, float қатесіз
   2) Ережелер: дұрыс және жаңылыс ережелер — шын орындалатын код
   3) Ереже құрастырғыш: ауыстырғыштар → орындалатын ереже
   4) Оқушы моделі: Байес жаңартуы, EIG, BKT, Brier
   ============================================================ */
const D={ // n — цифрлардан тұратын бүтін, d — үтірден кейінгі таңба саны
  mk:(n,d)=>({n,d}),
  str(x){ if(x.raw) return x.raw; if(x.d===0) return String(x.n); const s=String(Math.abs(x.n)).padStart(x.d+1,"0"); return (x.n<0?"-":"")+s.slice(0,-x.d)+"."+s.slice(-x.d); },
  parse(s){ const [a,b=""]=String(s).split("."); return {n:parseInt(a+b,10),d:b.length}; },
  cmp(a,b){ const m=Math.max(a.d,b.d); const x=a.n*10**(m-a.d), y=b.n*10**(m-b.d); return x>y?">":x<y?"<":"="; },
  eq(a,b){ return D.cmp(a,b)==="="; },
  ip:x=>Math.floor(x.n/10**x.d), fp:x=>x.n%10**x.d, digits:n=>String(Math.abs(n)).length
};
const plain=x=>({n:x.n,d:x.d});
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};

/* ---- Тақырыптар ---- */
const TOPICS={
  cmp:{name:{kk:"Ондық бөлшектерді салыстыру",ru:"Сравнение десятичных дробей"},short:{kk:"Салыстыру",ru:"Сравнение"},
       q:{kk:t=>`${D.str(t.a)} мен ${D.str(t.b)}: қайсысы үлкен?`,ru:t=>`${D.str(t.a)} и ${D.str(t.b)}: что больше?`},
       show:(t,r)=>`${D.str(t.a)} ${r} ${D.str(t.b)}`, same:(x,y)=>x===y},
  add:{name:{kk:"Ондық бөлшектерді қосу",ru:"Сложение десятичных дробей"},short:{kk:"Қосу",ru:"Сложение"},
       q:{kk:t=>`${D.str(t.a)} + ${D.str(t.b)} = ?`,ru:t=>`${D.str(t.a)} + ${D.str(t.b)} = ?`},
       show:(t,r)=>`${D.str(t.a)} + ${D.str(t.b)} = ${D.str(r)}`, same:D.eq},
  mul:{name:{kk:"Ондық бөлшектерді көбейту",ru:"Умножение десятичных дробей"},short:{kk:"Көбейту",ru:"Умножение"},
       q:{kk:t=>`${D.str(t.a)} × ${D.str(t.b)} = ?`,ru:t=>`${D.str(t.a)} × ${D.str(t.b)} = ?`},
       show:(t,r)=>`${D.str(t.a)} × ${D.str(t.b)} = ${D.str(r)}`, same:D.eq},
  m10:{name:{kk:"10-ға көбейту",ru:"Умножение на 10"},short:{kk:"10-ға көбейту",ru:"Умножение на 10"},
       q:{kk:t=>`${D.str(t.a)} × 10 = ?`,ru:t=>`${D.str(t.a)} × 10 = ?`},
       show:(t,r)=>`${D.str(t.a)} × 10 = ${D.str(r)}`, same:(x,y)=>D.eq(x,y)}
};
/* ---- Ережелер. bug:true — жаңылыс ереже; run — орындалатын код ---- */
const cmpInt=t=>D.cmp(D.mk(D.ip(t.a),0),D.mk(D.ip(t.b),0));
const RULES={
  cmp_ok:{topic:"cmp",kk:{title:"Разрядтап салыстыр",desc:"Оннан бір, жүзден бір үлестерді солдан оңға қарай кезекпен салыстырамын."},
    ru:{title:"Сравнивай по разрядам",desc:"Сравниваю десятые, потом сотые — слева направо."}, run:t=>D.cmp(t.a,t.b)},
  cmp_long:{topic:"cmp",bug:true,
    kk:{short:"«Ұзын сан — үлкен»",title:"Үтірден кейінгі санды бүтін сан сияқты салыстыр",desc:"Үтірден кейінгі сан қайсысында үлкен болса, сол үлкен (25 > 3).",why:"0.3 = 0.30. Оннан үш үлес — жүзден отыз үлес, бұл жүзден 25 үлестен көп. Цифр саны емес, разряд маңызды."},
    ru:{short:"«Длиннее — значит больше»",title:"Сравнивай дробную часть как целое число",desc:"У кого число после запятой больше, то и больше (25 > 3).",why:"0.3 = 0.30. Три десятых — это тридцать сотых, а это больше 25 сотых. Важен разряд, а не количество цифр."},
    run:t=>{const i=cmpInt(t); if(i!=="=")return i; const x=D.fp(t.a),y=D.fp(t.b); return x>y?">":x<y?"<":"=";}},
  cmp_short:{topic:"cmp",bug:true,
    kk:{short:"«Қысқа сан — үлкен»",title:"Таңбасы аз бөлшек үлкен",desc:"Үтірден кейін цифры аз сан үлкен, өйткені оннан бір үлес жүзден бір үлестен ірі.",why:"Үлестің ірілігі жеткіліксіз, олардың саны да маңызды: 0.45 = жүзден 45, ал 0.3 = жүзден 30. 45 > 30."},
    ru:{short:"«Короче — значит больше»",title:"Дробь с меньшим числом знаков больше",desc:"Число с меньшим количеством цифр после запятой больше: десятые крупнее сотых.",why:"Важен не только размер долей, но и их количество: 0.45 = 45 сотых, а 0.3 = 30 сотых. 45 > 30."},
    run:t=>{const i=cmpInt(t); if(i!=="=")return i; if(t.a.d!==t.b.d)return t.a.d<t.b.d?">":"<"; return D.cmp(t.a,t.b);}},
  add_ok:{topic:"add",kk:{title:"Үтірді үтірдің астына қой",desc:"Разрядтарды туралаймын: оннан бір үлес оннан бір үлестің астына, содан кейін қосамын."},
    ru:{title:"Запятая под запятой",desc:"Выравниваю разряды: десятые под десятыми, потом складываю."},
    run:t=>{const m=Math.max(t.a.d,t.b.d);return D.mk(t.a.n*10**(m-t.a.d)+t.b.n*10**(m-t.b.d),m)}},
  add_right:{topic:"add",bug:true,
    kk:{short:"«Оң жақтан туралау»",title:"Сандарды оң шетінен турала",desc:"Натурал сандар сияқты соңғы цифрларды бір-бірінің астына қойып қосамын.",why:"1.2 + 0.35: оң жақтан тураласаң, оннан 2 үлес жүзден 5 үлеске қосылып кетеді. Әртүрлі разрядты қосуға болмайды: үтір үтірдің астында тұруы керек."},
    ru:{short:"«Выравнивание по правому краю»",title:"Выравнивай числа по правому краю",desc:"Ставлю последние цифры друг под другом, как у натуральных чисел.",why:"1.2 + 0.35: при выравнивании справа 2 десятых складываются с 5 сотыми. Разные разряды складывать нельзя: запятая должна стоять под запятой."},
    run:t=>D.mk(t.a.n+t.b.n,Math.max(t.a.d,t.b.d))},
  add_sep:{topic:"add",bug:true,
    kk:{short:"«Бөлек-бөлек қосу»",title:"Бүтін мен бөлшек бөлікті бөлек қос",desc:"Үтірге дейінгіні бөлек, үтірден кейінгіні бөлек қосып, арасына үтір қоямын.",why:"0.5 + 0.7: 5 + 7 = 12 оннан бір үлес — бұл 1 бүтін және 0.2. Он үлес толғанда бүтінге көшеді, сондықтан жауап 0.12 емес, 1.2."},
    ru:{short:"«Складываю по отдельности»",title:"Складывай целую и дробную части отдельно",desc:"Складываю отдельно до запятой и после, ставлю запятую между ними.",why:"0.5 + 0.7: 5 + 7 = 12 десятых — это 1 целая и 0.2. Десять десятых переходят в целую, поэтому ответ 1.2, а не 0.12."},
    run:t=>{const m=Math.max(t.a.d,t.b.d);const f=D.fp(t.a)*10**(m-t.a.d)+D.fp(t.b)*10**(m-t.b.d);return D.parse((D.ip(t.a)+D.ip(t.b))+"."+String(f).padStart(m,"0"))}},
  mul_ok:{topic:"mul",kk:{title:"Таңбаларды қос",desc:"Үтірсіз көбейтемін, екі көбейткіштегі үтірден кейінгі таңбаларды қосып, сонша таңба бөлемін."},
    ru:{title:"Складывай знаки",desc:"Умножаю без запятых, складываю знаки после запятой у обоих множителей и отделяю столько же."},
    run:t=>D.mk(t.a.n*t.b.n,t.a.d+t.b.d)},
  mul_max:{topic:"mul",bug:true,
    kk:{short:"«Қосудағыдай үтір»",title:"Үтірді қосудағыдай қой",desc:"Үтірсіз көбейтемін, жауапта көбейткіштегідей таңба қалдырамын (0.3 × 0.2 = 0.6).",why:"0.3 × 0.2 — бұл оннан үштің оннан екі бөлігі. Оннан бірдің оннан бірі — жүзден бір, сондықтан жауап 0.06. Көбейткенде нәтиже кішіреюі мүмкін."},
    ru:{short:"«Запятая как при сложении»",title:"Ставь запятую как при сложении",desc:"Умножаю без запятых и оставляю столько знаков, сколько у множителя (0.3 × 0.2 = 0.6).",why:"0.3 × 0.2 — это две десятых от трёх десятых. Десятая от десятой — сотая, поэтому ответ 0.06. При умножении результат может уменьшиться."},
    run:t=>D.mk(t.a.n*t.b.n,Math.max(t.a.d,t.b.d))},
  mul_ign:{topic:"mul",bug:true,
    kk:{short:"«Үтірді ұмыту»",title:"Үтірге қарама",desc:"Сандарды үтірсіз көбейтемін, шыққан сан — жауап.",why:"3 × 0.2 — үш рет оннан екі, яғни оннан алты = 0.6. Жауап 6 болса, 3-ті 2-ге көбейткенмен бірдей болар еді."},
    ru:{short:"«Забываю про запятую»",title:"Не обращай внимания на запятую",desc:"Умножаю числа без запятых — полученное число и есть ответ.",why:"3 × 0.2 — это три раза по две десятых, то есть шесть десятых = 0.6. Ответ 6 получился бы при умножении 3 на 2."},
    run:t=>D.mk(t.a.n*t.b.n,0)},
  m10_ok:{topic:"m10",kk:{title:"Үтірді бір орын оңға жылжыт",desc:"10-ға көбейткенде әр цифр бір разряд жоғары көшеді: үтір бір орын оңға жылжиды."},
    ru:{title:"Сдвинь запятую на один знак вправо",desc:"При умножении на 10 каждая цифра переходит в разряд выше: запятая сдвигается вправо."},
    run:t=>t.a.d===0?D.mk(t.a.n*10,0):D.mk(t.a.n,t.a.d-1)},
  m10_zero:{topic:"m10",bug:true,
    kk:{short:"«Нөл тіркеу»",title:"Соңына нөл тірке",desc:"10-ға көбейткенде санның соңына 0 жазамын (2.5 × 10 = 2.50).",why:"2.50 мен 2.5 — бір сан, яғни ештеңе өзгерген жоқ. «Нөл тіркеу» тек бүтін сандарда жұмыс істейді; шын ереже — әр цифр бір разряд жоғары көшеді: 25."},
    ru:{short:"«Приписываю ноль»",title:"Припиши ноль в конце",desc:"При умножении на 10 приписываю 0 в конце (2.5 × 10 = 2.50).",why:"2.50 и 2.5 — одно и то же число, ничего не изменилось. Приписывать ноль можно только к целым числам; на самом деле каждая цифра переходит в разряд выше: 25."},
    run:t=>{if(t.a.d===0)return D.mk(t.a.n*10,0);const r=D.mk(t.a.n*10,t.a.d+1); r.raw=D.str(t.a)+"0"; return r}},
  m10_int:{topic:"m10",bug:true,
    kk:{short:"«Тек бүтінін көбейту»",title:"Тек бүтін бөлігін көбейт",desc:"Үтірге дейінгі бөлікті 10-ға көбейтемін, үтірден кейінгісін сол күйі қалдырамын (2.5 × 10 = 20.5).",why:"2.5 = 2 + 0.5. Екеуін де 10-ға көбейту керек: 20 + 5 = 25. Бөлшек бөлік те он есе өседі."},
    ru:{short:"«Умножаю только целую часть»",title:"Умножай только целую часть",desc:"Умножаю на 10 часть до запятой, а дробную оставляю как есть (2.5 × 10 = 20.5).",why:"2.5 = 2 + 0.5. Умножить на 10 нужно обе части: 20 + 5 = 25. Дробная часть тоже увеличивается в десять раз."},
    run:t=>t.a.d===0?D.mk(t.a.n*10,0):D.parse(D.ip(t.a)*10+"."+String(D.fp(t.a)).padStart(t.a.d,"0"))}
};
const BUGS=Object.keys(RULES).filter(k=>RULES[k].bug);
const okRule=tp=>tp+"_ok";
const rulesOf=tp=>Object.keys(RULES).filter(k=>RULES[k].topic===tp);

/* ---- Есеп генераторлары ---- */
function sw(a,b){return Math.random()<.5?{a,b}:{a:b,b:a}}
const GEN={
  cmp:{ long(){const s=rnd(2,9),x=rnd(1,s-1),y=rnd(1,9);return sw(D.mk(x*10+y,2),D.mk(s,1))},          // 0.25 ? 0.3
        short(){const s=rnd(1,7),x=rnd(s+1,9),y=rnd(1,9);return sw(D.mk(x*10+y,2),D.mk(s,1))},         // 0.45 ? 0.3
        int(){const i=rnd(1,3),x=rnd(1,4);return sw(D.mk(i*10+x,1),D.mk(rnd(51,99),2))},               // 2.3 ? 0.75
        easy(){let a,b;do{a=rnd(11,98);b=rnd(11,98)}while(b===a||a%10===0||b%10===0);return {a:D.mk(a,2),b:D.mk(b,2)}} },
  add:{ right(){return {a:D.mk(rnd(11,49),1),b:D.mk(rnd(11,49),2)}},                                     // 1.2 + 0.35
        sep(){const x=rnd(5,9),y=rnd(10-x+1,9);return {a:D.mk(x,1),b:D.mk(y,1)}},                        // 0.5 + 0.7
        easy(){const x=rnd(1,4)*10+rnd(1,4),y=rnd(1,4)*10+rnd(1,5);return {a:D.mk(x,2),b:D.mk(y,2)}} },
  mul:{ max(){return {a:D.mk(rnd(2,9),1),b:D.mk(rnd(2,9),1)}},                                           // 0.3 × 0.2
        small(){return {a:D.mk(rnd(1,3),1),b:D.mk(rnd(1,3),1)}},                                         // 0.2 × 0.3
        ign(){return {a:D.mk(rnd(2,9),0),b:D.mk(rnd(2,9),1)}},                                           // 3 × 0.2
        easy(){return {a:D.mk(rnd(2,9),0),b:D.mk(rnd(2,9),0)}} },
  m10:{ dec(){let n;do{n=rnd(11,99)}while(n%10===0);return {a:D.mk(n,1),b:D.mk(10,0)}},
        dec2(){let n;do{n=rnd(101,999)}while(n%10===0);return {a:D.mk(n,2),b:D.mk(10,0)}},
        easy(){return {a:D.mk(rnd(2,60),0),b:D.mk(10,0)}} }
};
// hit — қате шығатын есеп, miss — кездейсоқ дұрыс шығатын есеп
const BUGGEN={cmp_long:["long","short"],cmp_short:["short","long"],add_right:["right","sep"],add_sep:["sep","easy"],
  mul_max:["max","ign"],mul_ign:["ign","easy"],m10_zero:["dec","easy"],m10_int:["dec","easy"]};
// жасырын тексеру: барлық жаңылыс және «жартылай дұрыс» ережелерді әшкерелейтін есептер
const HIDDEN={cmp:["long","short","int","long","easy"],add:["right","sep","right","sep","easy"],
  mul:["max","small","ign","small","easy"],m10:["dec","easy","dec2","dec","easy"]};
const genTask=(tp,kind)=>{const t=GEN[tp][kind]();t.tp=tp;return t};
const solve=(rule,t)=>RULES[rule].run(t);
const isRight=(t,ans)=>TOPICS[t.tp].same(ans,solve(okRule(t.tp),t));
const fmt=(t,ans)=>TOPICS[t.tp].show(t,ans);

/* ---- Ереже құрастырғыш: 4-қадамда оқушы ережені ауыстырғыштардан жинайды ---- */
const BUILD={
  cmp:{sw:[
    {kk:"Бүтін бөлігін",ru:"Целую часть",o:{kk:["алдымен салыстырамын","елемеймін"],ru:["сравниваю сначала","не учитываю"]}},
    {kk:"Үтірден кейінгі бөлікті",ru:"Дробную часть",o:{kk:["разрядтап (0.3 = 0.30)","бүтін сан сияқты (25 > 3)","цифры азы — үлкен"],ru:["по разрядам (0.3 = 0.30)","как целое число (25 > 3)","меньше цифр — больше"]}}],
    run:(t,[a,b])=>{ if(a===0){const i=cmpInt(t); if(i!=="=")return i;}
      const fa=D.mk(D.fp(t.a),t.a.d), fb=D.mk(D.fp(t.b),t.b.d);
      if(b===0) return D.cmp(fa,fb);
      if(b===1){const x=D.fp(t.a),y=D.fp(t.b);return x>y?">":x<y?"<":"=";}
      if(t.a.d!==t.b.d) return t.a.d<t.b.d?">":"<"; return D.cmp(fa,fb); }},
  add:{sw:[
    {kk:"Туралау",ru:"Выравнивание",o:{kk:["үтір бойынша","оң жақ шеті бойынша"],ru:["по запятой","по правому краю"]}},
    {kk:"Он үлес жиналса",ru:"Если набралось десять долей",o:{kk:["бүтінге көшіремін","көшірмеймін"],ru:["переношу в целые","не переношу"]}}],
    run:(t,[a,b])=>{ if(a===1) return D.mk(t.a.n+t.b.n,Math.max(t.a.d,t.b.d));
      const m=Math.max(t.a.d,t.b.d); if(b===0) return D.mk(t.a.n*10**(m-t.a.d)+t.b.n*10**(m-t.b.d),m);
      const f=D.fp(t.a)*10**(m-t.a.d)+D.fp(t.b)*10**(m-t.b.d); return D.parse((D.ip(t.a)+D.ip(t.b))+"."+String(f).padStart(m,"0")); }},
  mul:{sw:[
    {kk:"Жауапта үтірден кейін",ru:"После запятой в ответе",o:{kk:["екі көбейткіштің таңбаларының қосындысы","көбейткіштегі ең көп таңба","ешқандай таңба"],ru:["сумма знаков обоих множителей","как у множителя с большим числом знаков","ни одного знака"]}},
    {kk:"Цифр жетпесе",ru:"Если цифр не хватает",o:{kk:["алдына 0 жазамын (0.06)","жазбаймын (0.6)"],ru:["дописываю 0 впереди (0.06)","не дописываю (0.6)"]}}],
    run:(t,[a,b])=>{ const n=t.a.n*t.b.n; let p=[t.a.d+t.b.d,Math.max(t.a.d,t.b.d),0][a]; if(b===1) p=Math.min(p,D.digits(n)); return D.mk(n,p); }},
  m10:{sw:[
    {kk:"10-ға көбейткенде",ru:"При умножении на 10",o:{kk:["әр цифр бір разряд жоғары көшеді","соңына 0 тіркеймін","тек бүтін бөлігі 10 есе өседі"],ru:["каждая цифра переходит в разряд выше","приписываю 0 в конце","в 10 раз растёт только целая часть"]}},
    {kk:"Үтір жылжиды",ru:"Запятая сдвигается",o:{kk:["бір орынға","екі орынға"],ru:["на один знак","на два знака"]}}],
    run:(t,[a,b])=>{ if(a===1) return RULES.m10_zero.run(t); if(a===2) return RULES.m10_int.run(t);
      const k=b+1; return t.a.d>=k?D.mk(t.a.n,t.a.d-k):D.mk(t.a.n*10**(k-t.a.d),0); }}
};
const buildRun=(tp,s)=>t=>BUILD[tp].run(t,s);
// құрастырылған ереже қай белгілі ережеге сәйкес келеді (Айна үшін)
function buildMatch(tp,s){const k=s.join(""); return ({cmp:{"00":"cmp_ok","01":"cmp_long","02":"cmp_short"},add:{"00":"add_ok","01":"add_sep","10":"add_right","11":"add_right"},
  mul:{"00":"mul_ok","10":"mul_max","11":"mul_max","20":"mul_ign","21":"mul_ign"},m10:{"00":"m10_ok","10":"m10_zero","11":"m10_zero","20":"m10_int","21":"m10_int"}})[tp][k]||null}

/* ---- Калибрлеу ұпайы: тиын лақтырумен салыстырғанда. 50% бәс = 0, 100% дұрыс = +25, 100% қате = −75 ---- */
const betPoints=(p,ok)=>Math.round(100*(0.25-(p-(ok?1:0))**2));

/* ---- Оқушы моделі ---- */
const LIK={accHas:.85,accNo:.15,pickHas:.7,pickNo:.1}; // параметрлер — сарапшылық болжам, пилотта бағалануы тиіс
const PRIOR=.2, BKT={L0:.2,T:.15,G:.25,S:.1};
const fresh=()=>({v:1,post:Object.fromEntries(BUGS.map(b=>[b,PRIOR])),seen:Object.fromEntries(BUGS.map(b=>[b,0])),
  bkt:Object.fromEntries(Object.keys(TOPICS).map(t=>[t,BKT.L0])),played:{},bets:[],hist:[],sound:false,askedSound:false});
let S=fresh();
try{const raw=localStorage.getItem("shakirt_v1"); if(raw){const o=JSON.parse(raw); if(o&&o.v===1){S=Object.assign(fresh(),o); if(!S.played||!Object.keys(S.played).length){S.played={}; (S.hist||[]).forEach(h=>{S.played[RULES[h.bug].topic]=1})}}}}catch(e){}
function save(){try{localStorage.setItem("shakirt_v1",JSON.stringify(S))}catch(e){}}
const H=p=>p<=0||p>=1?0:-(p*Math.log2(p)+(1-p)*Math.log2(1-p));
function bayes(p,lHas,lNo,w=1){const a=Math.pow(lHas,w)*p,b=Math.pow(lNo,w)*(1-p);return a/(a+b)}
function eig(p){const pa=LIK.accHas*p+LIK.accNo*(1-p);
  return H(p)-(pa*H(bayes(p,LIK.accHas,LIK.accNo))+(1-pa)*H(bayes(p,1-LIK.accHas,1-LIK.accNo)))}
function nextBug(){const last=S.hist.length?S.hist[S.hist.length-1].bug:null;
  const sc=BUGS.filter(b=>b!==last).map(b=>[b,eig(S.post[b])+0.15/(1+S.seen[b])+Math.random()*0.01]);
  sc.sort((x,y)=>y[1]-x[1]); return sc[0][0];}
function bktUpdate(tp,correct){let L=S.bkt[tp];
  const post=correct? L*(1-BKT.S)/(L*(1-BKT.S)+(1-L)*BKT.G) : L*BKT.S/(L*BKT.S+(1-L)*(1-BKT.G));
  S.bkt[tp]=post+(1-post)*BKT.T; S.played[tp]=1;}
function calib(){const n=S.bets.length; if(!n) return null;
  const brier=S.bets.reduce((s,b)=>s+(b.p-b.o)**2,0)/n, acc=S.bets.reduce((s,b)=>s+b.o,0)/n, conf=S.bets.reduce((s,b)=>s+b.p,0)/n;
  const pts=S.bets.reduce((s,b)=>s+betPoints(b.p,b.o===1),0);
  const bins=[[.5,.6],[.6,.7],[.7,.8],[.8,.9],[.9,1.01]].map(([lo,hi])=>{const x=S.bets.filter(b=>b.p>=lo-1e-9&&b.p<hi-1e-9);
    return {lo,n:x.length,conf:x.length?x.reduce((s,b)=>s+b.p,0)/x.length:null,acc:x.length?x.reduce((s,b)=>s+b.o,0)/x.length:null}});
  return {n,brier,acc,conf,over:conf-acc,bins,pts};}

/* ---- Дыбыс (әдепкіде өшірулі) ---- */
let AC=null;
function beep(ok){ if(!S.sound) return; try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();
  const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);
  o.type="sine";o.frequency.value=ok?660:220;g.gain.setValueAtTime(.06,AC.currentTime);
  if(ok)o.frequency.setValueAtTime(880,AC.currentTime+.09);
  g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.25);o.start();o.stop(AC.currentTime+.26);}catch(e){} }
