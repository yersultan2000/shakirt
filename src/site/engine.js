const D = { // ондық сан: n — цифрлардан тұратын бүтін, d — үтірден кейінгі таңба саны
  mk:(n,d)=>({n,d}),
  str(x){ if(x.d===0) return String(x.n); const s=String(Math.abs(x.n)).padStart(x.d+1,"0"); return (x.n<0?"-":"")+s.slice(0,-x.d)+"."+s.slice(-x.d); },
  parse(s){ const [a,b=""]=String(s).split("."); return {n:parseInt(a+b,10),d:b.length}; },
  cmp(a,b){ const m=Math.max(a.d,b.d); const x=a.n*10**(m-a.d), y=b.n*10**(m-b.d); return x>y?">":x<y?"<":"="; },
  eq(a,b){ return D.cmp(a,b)==="="; },
  ip:x=>Math.floor(x.n/10**x.d), fp:x=>x.n%10**x.d
};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=rnd(0,i);[a[i],a[j]]=[a[j],a[i]]}return a};
const pick=a=>a[rnd(0,a.length-1)];

/* ---- Тақырыптар (есеп түрлері) ---- */
const TOPICS={
  cmp:{name:"Ондық бөлшектерді салыстыру", q:t=>`${D.str(t.a)} мен ${D.str(t.b)}: қайсысы үлкен?`,
       show:(t,r)=>`${D.str(t.a)} ${r} ${D.str(t.b)}`, same:(x,y)=>x===y},
  add:{name:"Ондық бөлшектерді қосу", q:t=>`${D.str(t.a)} + ${D.str(t.b)} = ?`,
       show:(t,r)=>`${D.str(t.a)} + ${D.str(t.b)} = ${D.str(r)}`, same:D.eq},
  mul:{name:"Ондық бөлшектерді көбейту", q:t=>`${D.str(t.a)} × ${D.str(t.b)} = ?`,
       show:(t,r)=>`${D.str(t.a)} × ${D.str(t.b)} = ${D.str(r)}`, same:D.eq},
  m10:{name:"10-ға көбейту", q:t=>`${D.str(t.a)} × 10 = ?`,
       show:(t,r)=>`${D.str(t.a)} × 10 = ${r.raw||D.str(r)}`, same:D.eq}
};
/* ---- Ережелер. bug:true — жаңылыс ереже. run — шын орындалатын код. ---- */
const RULES={
  cmp_ok:{topic:"cmp",title:"Разрядтап салыстыр",desc:"Оннан бір, жүзден бір... үлестерді солдан оңға қарай кезекпен салыстырамын.",
    run:t=>D.cmp(t.a,t.b)},
  cmp_long:{topic:"cmp",bug:true,short:"«Ұзын сан — үлкен»",title:"Үтірден кейінгі санды бүтін сан сияқты салыстыр",desc:"Үтірден кейін тұрған сан қайсысында үлкен болса, сол үлкен (25 > 3).",
    why:"0.3 = 0.30. Оннан үш үлес — жүзден отыз үлес, бұл жүзден 25 үлестен көп. Цифр саны емес, разряд маңызды.",
    run:t=>{const i=D.cmp(D.mk(D.ip(t.a),0),D.mk(D.ip(t.b),0)); if(i!=="=")return i; const x=D.fp(t.a),y=D.fp(t.b); return x>y?">":x<y?"<":"=";}},
  cmp_short:{topic:"cmp",bug:true,short:"«Қысқа сан — үлкен»",title:"Таңбасы аз бөлшек үлкен",desc:"Үтірден кейін цифры аз сан үлкен, өйткені оннан бір үлес жүзден бір үлестен ірі.",
    why:"Үлестің ірілігі жеткіліксіз — олардың саны да маңызды: 0.45 = жүзден 45, ал 0.3 = жүзден 30. 45 > 30.",
    run:t=>{const i=D.cmp(D.mk(D.ip(t.a),0),D.mk(D.ip(t.b),0)); if(i!=="=")return i; if(t.a.d!==t.b.d)return t.a.d<t.b.d?">":"<"; return D.cmp(t.a,t.b);}},
  add_ok:{topic:"add",title:"Үтірді үтірдің астына қой",desc:"Разрядтарды туралаймын: оннан бір үлес оннан бір үлестің астына, содан кейін қосамын.",
    run:t=>{const m=Math.max(t.a.d,t.b.d);return D.mk(t.a.n*10**(m-t.a.d)+t.b.n*10**(m-t.b.d),m)}},
  add_right:{topic:"add",bug:true,short:"«Оң жақтан туралау»",title:"Сандарды оң шетінен турала",desc:"Натурал сандар сияқты соңғы цифрларды бір-бірінің астына қойып қосамын.",
    why:"1.2 + 0.35: оң жақтан тураласаң, оннан 2 үлес жүзден 5 үлеске қосылып кетеді. Әртүрлі разрядты қосуға болмайды — үтір үтірдің астында тұруы керек.",
    run:t=>D.mk(t.a.n+t.b.n,Math.max(t.a.d,t.b.d))},
  add_sep:{topic:"add",bug:true,short:"«Бөлек-бөлек қосу»",title:"Бүтін мен бөлшек бөлікті бөлек қос",desc:"Үтірге дейінгіні бөлек, үтірден кейінгіні бөлек қосып, арасына үтір қоямын.",
    why:"0.5 + 0.7: 5 + 7 = 12 оннан бір үлес — бұл 1 бүтін және 0.2. Он үлес толғанда бүтінге көшеді, сондықтан жауап 0.12 емес, 1.2.",
    run:t=>{const m=Math.max(t.a.d,t.b.d);const f=String(D.fp(t.a)+D.fp(t.b)).padStart(m,"0");return D.parse((D.ip(t.a)+D.ip(t.b))+"."+f)}},
  mul_ok:{topic:"mul",title:"Таңбаларды қос",desc:"Үтірсіз көбейтемін, сосын екі көбейткіштегі үтірден кейінгі таңбаларды қосып, сонша таңба бөлемін.",
    run:t=>D.mk(t.a.n*t.b.n,t.a.d+t.b.d)},
  mul_max:{topic:"mul",bug:true,short:"«Қосудағыдай үтір»",title:"Үтірді қосудағыдай қой",desc:"Үтірсіз көбейтемін, жауапта көбейткіштегідей таңба қалдырамын (0.3 × 0.2 = 0.6).",
    why:"0.3 × 0.2 — бұл оннан үштің оннан екі бөлігі. Оннан бірдің оннан бірі — жүзден бір, сондықтан жауап 0.06. Көбейткенде нәтиже кішіреюі мүмкін.",
    run:t=>D.mk(t.a.n*t.b.n,Math.max(t.a.d,t.b.d))},
  mul_ign:{topic:"mul",bug:true,short:"«Үтірді ұмыту»",title:"Үтірге қарама",desc:"Сандарды үтірсіз көбейтемін, шыққан сан — жауап.",
    why:"3 × 0.2 — үш рет оннан екі, яғни оннан алты = 0.6. Жауап 6 болса, 3-ті 2-ге көбейткенмен бірдей болар еді.",
    run:t=>D.mk(t.a.n*t.b.n,0)},
  m10_ok:{topic:"m10",title:"Үтірді бір орын оңға жылжыт",desc:"10-ға көбейткенде әр цифр бір разряд солға көшеді: үтір бір орын оңға жылжиды.",
    run:t=>t.a.d===0?D.mk(t.a.n*10,0):D.mk(t.a.n,t.a.d-1)},
  m10_zero:{topic:"m10",bug:true,short:"«Нөл тіркеу»",title:"Соңына нөл тірке",desc:"10-ға көбейткенде санның соңына 0 жазамын (2.5 × 10 = 2.50).",
    why:"2.50 мен 2.5 — бір сан, яғни ештеңе өзгерген жоқ. «Нөл тіркеу» тек бүтін сандарда жұмыс істейді; шын ереже — әр цифр бір разряд жоғары көшеді: 25.",
    run:t=>{const r=D.mk(t.a.n*10,t.a.d===0?0:t.a.d+1); r.raw=D.str(t.a)+"0"; return r}},
  m10_int:{topic:"m10",bug:true,short:"«Тек бүтінін көбейту»",title:"Тек бүтін бөлігін көбейт",desc:"Үтірге дейінгі бөлікті 10-ға көбейтемін, үтірден кейінгісін сол күйі қалдырамын (2.5 × 10 = 20.5).",
    why:"2.5 = 2 + 0.5. Екеуін де 10-ға көбейту керек: 20 + 5 = 25. Бөлшек бөлік те он есе өседі.",
    run:t=>D.parse(D.ip(t.a)*10+"."+String(D.fp(t.a)).padStart(t.a.d,"0"))}
};
const BUGS=Object.keys(RULES).filter(k=>RULES[k].bug);
const okRule=tp=>tp+"_ok";
const rulesOf=tp=>Object.keys(RULES).filter(k=>RULES[k].topic===tp);

/* ---- Есеп генераторлары ---- */
const GEN={
  cmp:{ long(){const s=rnd(2,9),x=rnd(1,s-1),y=rnd(1,9);return sw(D.mk(x*10+y,2),D.mk(s,1))},      // 0.25 ? 0.3
        short(){const s=rnd(1,7),x=rnd(s+1,9),y=rnd(1,9);return sw(D.mk(x*10+y,2),D.mk(s,1))},     // 0.45 ? 0.3
        easy(){let a,b;do{a=rnd(11,98);b=rnd(11,98)}while(b===a||a%10===0||b%10===0);return {a:D.mk(a,2),b:D.mk(b,2)}} },
  add:{ right(){return {a:D.mk(rnd(11,49),1),b:D.mk(rnd(11,49),2)}},                                 // 1.2 + 0.35
        sep(){const x=rnd(5,9),y=rnd(10-x+1,9);return {a:D.mk(x,1),b:D.mk(y,1)}},                    // 0.5 + 0.7
        easy(){const x=rnd(1,4)*10+rnd(1,4),y=rnd(1,4)*10+rnd(1,5);return {a:D.mk(x,2),b:D.mk(y,2)}} },
  mul:{ max(){return {a:D.mk(rnd(2,9),1),b:D.mk(rnd(2,9),1)}},                                       // 0.3 × 0.2
        ign(){return {a:D.mk(rnd(2,9),0),b:D.mk(rnd(2,9),1)}},                                       // 3 × 0.2
        easy(){return {a:D.mk(rnd(2,9),0),b:D.mk(rnd(2,9),0)}} },
  m10:{ dec(){let n;do{n=rnd(11,99)}while(n%10===0);return {a:D.mk(n,1),b:D.mk(10,0)}},
        dec2(){let n;do{n=rnd(101,999)}while(n%10===0);return {a:D.mk(n,2),b:D.mk(10,0)}},
        easy(){return {a:D.mk(rnd(2,60),0),b:D.mk(10,0)}} }
};
function sw(a,b){return Math.random()<.5?{a,b}:{a:b,b:a}}
// әр жаңылыс ереже үшін: hit — қате шығатын есеп, miss — кездейсоқ дұрыс шығатын есеп
const BUGGEN={cmp_long:["long","short"],cmp_short:["short","long"],add_right:["right","sep"],add_sep:["sep","easy"],
  mul_max:["max","ign"],mul_ign:["ign","easy"],m10_zero:["dec","easy"],m10_int:["dec","easy"]};
// жасырын тексеру жиыны: тақырыптың барлық жаңылыс ережелерін әшкерелейтін есептер
const HIDDEN={cmp:["long","short","long","short","easy"],add:["right","sep","right","sep","easy"],
  mul:["max","ign","max","ign","easy"],m10:["dec","easy","dec2","dec","easy"]};
const genTask=(tp,kind)=>{const t=GEN[tp][kind]();t.tp=tp;return t};
const solve=(rule,t)=>RULES[rule].run(t);
const isRight=(t,ans)=>TOPICS[t.tp].same(ans,solve(okRule(t.tp),t));
const fmt=(t,ans)=>TOPICS[t.tp].show(t,ans);

/* ---- Оқушы моделі ---- */
const LIK={accHas:.85,accNo:.15,pickHas:.7,pickNo:.1}; // модель параметрлері (болжам, пилотта бағалануы тиіс)
const PRIOR=.2, BKT={L0:.2,T:.15,G:.25,S:.1};
const fresh=()=>({v:1,post:Object.fromEntries(BUGS.map(b=>[b,PRIOR])),seen:Object.fromEntries(BUGS.map(b=>[b,0])),
  bkt:Object.fromEntries(Object.keys(TOPICS).map(t=>[t,BKT.L0])),bets:[],hist:[],sound:true});
let S=fresh();
try{const raw=localStorage.getItem("shakirt_v1"); if(raw){const o=JSON.parse(raw); if(o&&o.v===1) S=Object.assign(fresh(),o);}}catch(e){}
function save(){try{localStorage.setItem("shakirt_v1",JSON.stringify(S))}catch(e){}}
const H=p=>p<=0||p>=1?0:-(p*Math.log2(p)+(1-p)*Math.log2(1-p));
// Байес жаңартуы; w∈[0,1] — сенімділік салмағы (50% бәс → w=0, ақпарат жоқ)
function bayes(p,lHas,lNo,w=1){const a=Math.pow(lHas,w)*p,b=Math.pow(lNo,w)*(1-p);return a/(a+b)}
// күтілетін ақпарат өсімі: «қате жауапты қабылдай ма?» бақылауы үшін
function eig(p){const pa=LIK.accHas*p+LIK.accNo*(1-p);
  return H(p)-(pa*H(bayes(p,LIK.accHas,LIK.accNo))+(1-pa)*H(bayes(p,1-LIK.accHas,1-LIK.accNo)))}
function nextBug(){ // EIG + аз көрсетілгенге шағын бонус; соңғы көрсетілген қайталанбайды
  const last=S.hist.length?S.hist[S.hist.length-1].bug:null;
  const sc=BUGS.filter(b=>b!==last).map(b=>[b,eig(S.post[b])+0.15/(1+S.seen[b])+Math.random()*0.01]);
  sc.sort((x,y)=>y[1]-x[1]); return sc[0][0];
}
function bktUpdate(tp,correct){let L=S.bkt[tp];
  const post=correct? L*(1-BKT.S)/(L*(1-BKT.S)+(1-L)*BKT.G) : L*BKT.S/(L*BKT.S+(1-L)*(1-BKT.G));
  S.bkt[tp]=post+(1-post)*BKT.T;}
function calib(){const n=S.bets.length; if(!n) return null;
  const brier=S.bets.reduce((s,b)=>s+(b.p-b.o)**2,0)/n, acc=S.bets.reduce((s,b)=>s+b.o,0)/n, conf=S.bets.reduce((s,b)=>s+b.p,0)/n;
  const bins=[[.5,.6],[.6,.7],[.7,.8],[.8,.9],[.9,1.01]].map(([lo,hi])=>{const x=S.bets.filter(b=>b.p>=lo&&b.p<hi);
    return {lo,n:x.length,conf:x.length?x.reduce((s,b)=>s+b.p,0)/x.length:null,acc:x.length?x.reduce((s,b)=>s+b.o,0)/x.length:null}});
  return {n,brier,acc,conf,over:conf-acc,bins};}

/* ---- Дыбыс (тек нәтиже сәтінде) ---- */
let AC=null;
function beep(ok){ if(!S.sound) return; try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();
  const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);
  o.type="sine";o.frequency.value=ok?660:220;g.gain.setValueAtTime(.08,AC.currentTime);
  if(ok)o.frequency.setValueAtTime(880,AC.currentTime+.09);
  g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+.25);o.start();o.stop(AC.currentTime+.26);}catch(e){} }
