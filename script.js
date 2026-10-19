const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#year').textContent=new Date().getFullYear();

// Mobile menu
const btn=$('#menu-btn'),nav=$('#nav');
const setMenu=o=>{nav.classList.toggle('open',o);btn.setAttribute('aria-expanded',o);btn.setAttribute('aria-label',o?'Close menu':'Open menu')};
btn.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
$$('#nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false)}});

// Reveal on scroll
if('IntersectionObserver' in window&&!reduce){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
  $$('.rv').forEach(el=>io.observe(el));
}else $$('.rv').forEach(el=>el.classList.add('in'));

// Workflow concept demo
const steps=$$('.fnode'),fill=$('#ffill'),cap=$('#fcap');
const text=[
 'A customer sends a question, for example through a website form or chat.',
 'An AI step reads the message and works out what it is about.',
 'A task is created automatically, such as logging the lead or drafting a reply.',
 'The business owner gets a notification and can review or follow up.'];
let cur=0,timer;
function show(i){cur=i;steps.forEach((s,k)=>{s.classList.toggle('on',k<=i);s.setAttribute('aria-pressed',k===i)});
 fill.style.width=(i/(steps.length-1))*100+'%';cap.textContent=text[i]}
function play(){clearInterval(timer);timer=setInterval(()=>show((cur+1)%steps.length),2200)}
steps.forEach((s,i)=>s.addEventListener('click',()=>{show(i);clearInterval(timer)}));
show(0);if(!reduce)play();
