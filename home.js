const C=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const M=(a,b,t)=>a+(b-a)*t;
const E=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

const sceneWrap=document.querySelector('.scene-wrap');
const nameEl=document.querySelector('.hero-name');
const role=document.querySelector('.role');
const loc=document.querySelector('.location');
const nav=document.querySelector('.home-nav');
const letters=[...document.querySelectorAll('.question span')];
const answer=document.querySelector('.answer');
const commit=document.querySelector('#commit');
const rewriteGroup=document.querySelector('#rewrites');
const navMarks=[...document.querySelectorAll('.home-nav path')];

const variants=[
  {start:.10,cover:.52,cross:5,amp:34,bias:-.02,tail:.08},
  {start:.15,cover:.60,cross:6,amp:48,bias:.03,tail:.12},
  {start:.08,cover:.74,cross:7,amp:62,bias:-.01,tail:.16}
];

function rand(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}
function buildRewrite(v,index){
  const r=rand(9187+index*733),x0=18,x1=682,w=x1-x0,base=108;
  const start=x0+w*C(v.start+(r()-.5)*.04),span=w*C(v.cover+(r()-.5)*.05,.4,.82),end=Math.min(x1,start+span),pts=[];
  pts.push([Math.max(x0,start-w*.03),base+(r()-.5)*8],[start,base+(r()-.5)*4]);
  for(let i=1;i<=v.cross;i++){
    const q=i/v.cross,x=M(start,end,q)+((r()-.5)*w*.018)+(v.bias*w*q),central=Math.sin(Math.PI*q),pressure=v.amp*(.5+.55*central)*(1+(r()-.5)*.22),side=i%2?-1:1;
    pts.push([x,base+side*pressure+(r()-.5)*12]);
    if(index>0&&i===Math.ceil(v.cross*.55)){
      pts.push([x-w*(.035+.03*r()),base-side*pressure*(.25+.18*r())],[x+w*(.022+.022*r()),base+side*pressure*(.52+.18*r())]);
    }
  }
  pts.push([end,base+(r()-.5)*6]);
  const tail=Math.min(x1,end+w*v.tail);
  if(tail>end+4)pts.push([M(end,tail,.5),base+(index%2?1:-1)*(8+16*r())],[tail,base+(r()-.5)*4]);
  return 'M'+pts.map((p,i)=>`${i?'L':''}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
}

variants.forEach((v,i)=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',buildRewrite(v,i));p.setAttribute('class','rewrite-path r'+(i+1));rewriteGroup.appendChild(p)});
const rewritePaths=[...document.querySelectorAll('.rewrite-path')];
let prepared=false,sequencePlayed=false,sequenceTimer=null;
function prep(){[commit,...rewritePaths,...navMarks].forEach(p=>{const len=p.getTotalLength();p.dataset.len=len;p.style.strokeDasharray=len;p.style.strokeDashoffset=len});prepared=true}
function draw(path,t){if(!prepared)prep();const len=+path.dataset.len;path.style.opacity=t>0?1:0;path.style.strokeDashoffset=len*(1-C(t))}
function resetSequence(){clearTimeout(sequenceTimer);sequencePlayed=false;letters.forEach(el=>{el.style.opacity=0;el.style.transform='translateY(.18em)'});answer.style.opacity=0;answer.style.transform='translateY(18px)';[commit,...rewritePaths,...navMarks].forEach(p=>draw(p,0))}
function animateDraw(path,duration=520){return new Promise(resolve=>{const start=performance.now();function frame(now){const t=C((now-start)/duration);draw(path,E(t));if(t<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)})}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
async function playSequence(){if(sequencePlayed)return;sequencePlayed=true;
  for(const el of letters){el.style.opacity=1;el.style.transform='translateY(0)';await wait(115)}
  await wait(350);answer.style.opacity=1;answer.style.transform='translateY(0)';await wait(650);
  await animateDraw(commit,600);await wait(420);
  for(let i=0;i<rewritePaths.length;i++){await animateDraw(rewritePaths[i],720);await wait(i===rewritePaths.length-1?560:420)}
  await animateDraw(navMarks[0],360);await wait(220);await animateDraw(navMarks[1],360)
}
function update(){
  const max=sceneWrap.offsetHeight-innerHeight,r=sceneWrap.getBoundingClientRect(),p=C(-r.top/max),mobile=innerWidth<=760;
  const tr=E(C((p-.02)/.50));
  const sx=mobile?20:innerWidth*.033,sy=innerHeight*(mobile?.58:.57),ex=mobile?20:Math.max(22,innerWidth*.033),ey=mobile?22:Math.max(22,innerWidth*.033),ss=mobile?Math.min(104,innerWidth*.22):Math.min(260,Math.max(96,innerWidth*.15)),es=mobile?12:Math.max(12,Math.min(16,innerWidth*.009));
  nameEl.style.left=M(sx,ex,tr)+'px';nameEl.style.top=M(sy,ey,tr)+'px';nameEl.style.fontSize=M(ss,es,tr)+'px';nameEl.style.letterSpacing=M(-.055,0,tr)+'em';
  const fade=C((p-.08)/.24);role.style.opacity=1-fade;loc.style.opacity=1-fade;
  const nin=E(C((p-.46)/.12));nav.style.opacity=nin;nav.style.transform=`translateY(${M(-7,0,nin)}px)`;
  if(p>.58&&!sequencePlayed)playSequence();
  if(p<.12&&sequencePlayed)resetSequence();
}
addEventListener('scroll',update,{passive:true});addEventListener('resize',()=>{prepared=false;update()});prep();resetSequence();update();