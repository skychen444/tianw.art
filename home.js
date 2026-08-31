const C=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const M=(a,b,t)=>a+(b-a)*t;
const E=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const mix=(a,b,t)=>Math.round(M(a,b,t));

const sceneWrap=document.querySelector('.scene-wrap');
const nameEl=document.querySelector('.hero-name');
const role=document.querySelector('.role');
const loc=document.querySelector('.location');
const nav=document.querySelector('.home-nav');
const question=document.querySelector('.question');
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
    if(index>0&&i===Math.ceil(v.cross*.55))pts.push([x-w*(.035+.03*r()),base-side*pressure*(.25+.18*r())],[x+w*(.022+.022*r()),base+side*pressure*(.52+.18*r())]);
  }
  pts.push([end,base+(r()-.5)*6]);
  const tail=Math.min(x1,end+w*v.tail);
  if(tail>end+4)pts.push([M(end,tail,.5),base+(index%2?1:-1)*(8+16*r())],[tail,base+(r()-.5)*4]);
  return 'M'+pts.map((p,i)=>`${i?'L':''}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
}

variants.forEach((v,i)=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',buildRewrite(v,i));p.setAttribute('class','rewrite-path r'+(i+1));rewriteGroup.appendChild(p)});
const rewritePaths=[...document.querySelectorAll('.rewrite-path')];
let prepared=false,sequencePlayed=false,sequenceRunning=false,interactionLocked=false,snapAnimating=false;

function prep(){[commit,...rewritePaths,...navMarks].forEach(p=>{const len=p.getTotalLength();p.dataset.len=len;p.style.strokeDasharray=len;p.style.strokeDashoffset=len});prepared=true}
function draw(path,t){if(!prepared)prep();const len=+path.dataset.len;path.style.opacity=t>0?1:0;path.style.strokeDashoffset=len*(1-C(t))}
function wait(ms){return new Promise(r=>setTimeout(r,ms))}
function animateDraw(path,duration=520){return new Promise(resolve=>{const start=performance.now();function frame(now){const t=C((now-start)/duration);draw(path,E(t));if(t<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)})}
function fadeIn(el,duration=900){return new Promise(resolve=>{const start=performance.now();function frame(now){const t=E(C((now-start)/duration));el.style.opacity=t;el.style.transform='translateY(0)';if(t<1)requestAnimationFrame(frame);else resolve()}requestAnimationFrame(frame)})}
function resetSequence(){sequencePlayed=false;sequenceRunning=false;letters.forEach(el=>{el.style.opacity=0;el.style.transform='translateY(.18em)'});answer.style.opacity=0;answer.style.transform='translateY(0)';[commit,...rewritePaths,...navMarks].forEach(p=>draw(p,0))}

function alignAnswerToQuestion(){
  const q=question.getBoundingClientRect();
  const scene=document.querySelector('.scene').getBoundingClientRect();
  answer.style.left=(q.left-scene.left)+'px';
  answer.style.right='auto';
}

function stopUserScroll(e){if(interactionLocked)e.preventDefault()}
function stopKeys(e){
  if(!interactionLocked)return;
  if(['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' ','Spacebar'].includes(e.key))e.preventDefault();
}
addEventListener('wheel',stopUserScroll,{passive:false});
addEventListener('touchmove',stopUserScroll,{passive:false});
addEventListener('keydown',stopKeys,{passive:false});

function snapToSecondScene(duration=360){
  if(snapAnimating)return Promise.resolve();
  snapAnimating=true;
  const max=Math.max(1,sceneWrap.offsetHeight-innerHeight);
  const target=sceneWrap.offsetTop+max*.56;
  const startY=scrollY;
  const delta=target-startY;
  const start=performance.now();
  return new Promise(resolve=>{
    function frame(now){
      const t=C((now-start)/duration);
      scrollTo(0,startY+delta*E(t));
      if(t<1)requestAnimationFrame(frame);
      else{snapAnimating=false;resolve()}
    }
    requestAnimationFrame(frame);
  });
}

async function playSequence(){
  if(sequencePlayed||sequenceRunning)return;
  sequenceRunning=true;
  interactionLocked=true;

  await snapToSecondScene(360);
  alignAnswerToQuestion();
  await wait(260);
  for(const el of letters){
    el.style.opacity=1;
    el.style.transform='translateY(0)';
    await wait(190);
  }
  await wait(620);
  await fadeIn(answer,950);
  await wait(720);
  await animateDraw(commit,650);
  await wait(450);
  for(let i=0;i<rewritePaths.length;i++){await animateDraw(rewritePaths[i],760);await wait(i===rewritePaths.length-1?650:450)}
  await animateDraw(navMarks[0],360);
  await wait(220);
  await animateDraw(navMarks[1],360);

  sequencePlayed=true;
  sequenceRunning=false;
  interactionLocked=false;
}

function update(){
  const max=Math.max(1,sceneWrap.offsetHeight-innerHeight),r=sceneWrap.getBoundingClientRect(),p=C(-r.top/max),mobile=innerWidth<=760;
  const tr=E(C((p-.02)/.46));
  const sx=mobile?20:innerWidth*.033,sy=innerHeight*(mobile?.58:.545),ex=mobile?20:Math.max(22,innerWidth*.033),ey=mobile?22:Math.max(22,innerWidth*.033),ss=mobile?Math.min(92,innerWidth*.195):Math.min(228,Math.max(84,innerWidth*.132)),es=mobile?12:Math.max(12,Math.min(16,innerWidth*.009));
  nameEl.style.left=M(sx,ex,tr)+'px';nameEl.style.top=M(sy,ey,tr)+'px';nameEl.style.fontSize=M(ss,es,tr)+'px';nameEl.style.letterSpacing=M(-.05,0,tr)+'em';

  alignAnswerToQuestion();

  const fade=C((p-.08)/.24);role.style.opacity=1-fade;loc.style.opacity=1-fade;

  const dark=E(C((p-.10)/.38));
  document.body.style.backgroundColor=`rgb(${mix(241,16,dark)},${mix(240,16,dark)},${mix(236,16,dark)})`;
  document.body.style.color=`rgb(${mix(10,244,dark)},${mix(10,243,dark)},${mix(10,239,dark)})`;

  const nin=E(C((p-.44)/.10));nav.style.opacity=nin;nav.style.transform=`translateY(${M(-7,0,nin)}px)`;

  if(p>.52&&!sequencePlayed&&!sequenceRunning)playSequence();

  if(p<.40&&sequencePlayed&&!sequenceRunning){
    resetSequence();
  }
}

addEventListener('scroll',update,{passive:true});
addEventListener('resize',()=>{prepared=false;alignAnswerToQuestion();update()});
prep();resetSequence();alignAnswerToQuestion();update();