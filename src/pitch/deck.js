/* Шәкірт питч-движок: пернетақта, свайп, фрагменттер, жазбалар, шолу, толық экран. */
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const slides=$$(".slide"), N=slides.length, root=document.documentElement;
let cur=0, k=0;
const fragsOf=s=>s.dataset.frags?+s.dataset.frags:Math.max(0,...$$("[data-f]",s).map(e=>+e.dataset.f));
function fit(){root.style.setProperty("--scale",Math.min(innerWidth/1920,innerHeight/1080))}
function paint(){
  slides.forEach((s,i)=>{s.classList.toggle("on",i===cur);s.classList.toggle("past",i<cur);s.setAttribute("aria-hidden",i!==cur)});
  const s=slides[cur]; s.dataset.k=k;
  $$("[data-f]",s).forEach(e=>{const f=+e.dataset.f;e.classList.toggle("vis",f<=k);e.classList.toggle("cur",f===k)});
  $$("[data-ring]",s).forEach(r=>r.classList.toggle("go",+r.dataset.ring<=k));
  $(".progress i").style.width=((cur+1)/N*100)+"%";
  $(".count").textContent=`${cur+1} / ${N}`;
  const n=$("aside.sn",s); $(".notes").innerHTML=`<b>${cur+1}. ${s.dataset.t||""}</b>${n?n.innerHTML:"—"}`;
  if(location.hash!=="#s"+(cur+1)) history.replaceState(null,"","#s"+(cur+1));
  document.title=`${cur+1}. ${s.dataset.t||""} · Шәкірт`;
  count(s);
}
function count(s){ $$("[data-count]",s).forEach(el=>{ if(el._done||matchMedia("(prefers-reduced-motion: reduce)").matches) return; el._done=true;
  const to=+el.dataset.count, first=el.firstChild, t0=performance.now();
  const step=t=>{const p=Math.min(1,(t-t0)/1100), e=1-Math.pow(1-p,3); first.nodeValue=Math.round(to*e); if(p<1) requestAnimationFrame(step)}; requestAnimationFrame(step); }); }
function go(i,kk=0){cur=Math.max(0,Math.min(N-1,i));k=kk;paint()}
function next(){ if(k<fragsOf(slides[cur])) {k++;paint()} else if(cur<N-1) go(cur+1) }
function prev(){ if(k>0) {k--;paint()} else if(cur>0) go(cur-1,fragsOf(slides[cur-1])) }
function toggle(cls,el){el.classList.toggle(cls)}
function ov(on){document.body.classList.toggle("ov",on);if(on){fit();slides[cur].scrollIntoView({block:"center"})}}
function fs(){ const d=document; try{ if(!d.fullscreenElement) d.documentElement.requestFullscreen(); else d.exitFullscreen(); }catch(e){} }

addEventListener("keydown",e=>{
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const kmap={ArrowRight:next,ArrowDown:next," ":next,PageDown:next,Enter:next,ArrowLeft:prev,ArrowUp:prev,PageUp:prev,Backspace:prev,
    Home:()=>go(0),End:()=>go(N-1),n:()=>toggle("show",$(".notes")),N:()=>toggle("show",$(".notes")),
    o:()=>ov(!document.body.classList.contains("ov")),O:()=>ov(!document.body.classList.contains("ov")),
    f:fs,F:fs,"?":()=>toggle("show",$(".help")),Escape:()=>{ov(false);$(".help").classList.remove("show")}};
  if(kmap[e.key]){ if(document.body.classList.contains("ov")&&!["o","O","Escape"].includes(e.key)) return; e.preventDefault(); kmap[e.key](); }
});
$(".stage").addEventListener("click",e=>{
  if(document.body.classList.contains("ov")){const s=e.target.closest(".slide");if(s){ov(false);go(slides.indexOf(s))}return}
  if(e.target.closest("a,button")) return;
  (e.clientX<innerWidth*.3?prev:next)();
});
let tx=null,ty=null;
addEventListener("touchstart",e=>{document.body.classList.add("touch");tx=e.touches[0].clientX;ty=e.touches[0].clientY},{passive:true});
addEventListener("touchend",e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx,dy=e.changedTouches[0].clientY-ty;
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){e.preventDefault();(dx<0?next:prev)()} tx=null},{passive:false});
$("#b-prev").onclick=prev; $("#b-next").onclick=next; $("#b-notes").onclick=()=>toggle("show",$(".notes"));
$("#b-ov").onclick=()=>ov(!document.body.classList.contains("ov")); $("#b-fs").onclick=fs; $("#b-help").onclick=()=>toggle("show",$(".help"));
addEventListener("resize",fit); addEventListener("hashchange",()=>{const m=location.hash.match(/^#s(\d+)$/);if(m&&+m[1]-1!==cur)go(+m[1]-1)});
fit(); const m=location.hash.match(/^#s(\d+)$/); go(m?+m[1]-1:0);
})();
