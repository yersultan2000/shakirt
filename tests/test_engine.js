const fs=require('fs'); eval(fs.readFileSync(require('path').join(__dirname,'..','src','engine.js'),'utf8')+`
let bad=[];
for(let k=0;k<1500;k++){
 for(const b of BUGS){const tp=RULES[b].topic,[hit,miss]=BUGGEN[b];
  let t=genTask(tp,hit); if(isRight(t,solve(b,t))) bad.push('hit-right '+b+' '+fmt(t,solve(b,t)));
  t=genTask(tp,miss); if(!isRight(t,solve(b,t))) bad.push('miss-wrong '+b+' '+fmt(t,solve(b,t)));}
 for(const tp in BUILD){const hs=HIDDEN[tp].map(x=>genTask(tp,x)); const sw=BUILD[tp].sw;
  for(let a=0;a<sw[0].o.kk.length;a++)for(let c=0;c<sw[1].o.kk.length;c++){
   const pass=hs.every(h=>isRight(h,BUILD[tp].run(h,[a,c])));
   if(a===0&&c===0&&!pass) bad.push('correct fails '+tp);
   if(!(a===0&&c===0)&&pass) bad.push('combo passes '+tp+a+c+' '+hs.map(h=>fmt(h,BUILD[tp].run(h,[a,c]))).join(' | '));
   const m=buildMatch(tp,[a,c]); if(m){ // matched rule must behave identically on hidden tasks
     for(const h of hs) if(!TOPICS[tp].same(BUILD[tp].run(h,[a,c]),solve(m,h))) bad.push('match mismatch '+tp+a+c+' '+m+' '+fmt(h,solve(m,h))+' vs '+fmt(h,BUILD[tp].run(h,[a,c])));}
  }}
 for(const b of BUGS){const tp=RULES[b].topic; const hs=HIDDEN[tp].map(x=>genTask(tp,x)); if(hs.every(h=>isRight(h,solve(b,h)))) bad.push('bug passes '+b)}
}
const u=[...new Set(bad.map(x=>x.split(' ').slice(0,2).join(' ')))]; console.log(bad.length, u, bad.slice(0,6));
console.log(betPoints(.5,true),betPoints(1,true),betPoints(1,false),betPoints(.8,true));
`);
