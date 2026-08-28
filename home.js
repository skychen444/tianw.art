const C=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const M=(a,b,t)=>a+(b-a)*t;
const E=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

const sceneWrap=document.querySelector('.scene-wrap');
const nameEl=document.querySelector('.hero-name');
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

function rand(seed){
  let s=seed>>>0;
  return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
}

function buildRewrite(v,index){
  const r=rand(9187+index*733);
  const x0=18,x1=682,w=x1-x0,base=108;
  const start=x0+w*C(v.start+(r()-.5)*.04);
  const span=w*C(v.cover+(r()-.5)*.05,.4,.82);
  const end=Math.min(x1,start+span);
  const pts=[];
  pts.push([Math.max(x0,start-w*.03),base+(r()-.5)*8]);
  pts.push([start,base+(r()-.5)*4]);

  const n=v.cross;
  for(let i=1;i<=n;i++){
    const q=i/n;
    const x=M(start,end,q)+((r()-.5)*w*.018)+(v.bias*w*q);
    const central=Math.sin(Math.PI*q);
    const pressure=v.amp*(.5+.55*central)*(1+(r()-.5)*.22);
    const side=i%2?-1:1;
    pts.push([x,base+side*pressure+(r()-.5)*12]);
    if(index>0 && i===Math.ceil(n*.55)){
      pts.push([x-w*(.035+.03*r()),base-side*pressure*(.25+.18*r())]);
      pts.push([x+w*(.022+.022*r()),base+side*pressure*(.52+.18*r())]);
    }
  }

  pts.push([end,base+(r()-.5)*6]);
  const tail=Math.min(x1,end+w*v.tail);
  if(tail>end+4){
    pts.push([M(end,tail,.5),base+(index%2?1:-1)*(8+16*r())]);
    pts.push([tail,base+(r()-.5)*4]);
  }
  return 'M'+pts.map((p,i)=>`${i?'L':''}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
}

variants.forEach((v,i)=>{
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');
  p.setAttribute('d',buildRewrite(v,i));
  p.setAttribute('class','rewrite-path r'+(i+1));
  rewriteGroup.appendChild(p);
});

const rewritePaths=[...document.querySelectorAll('.rewrite-path')];
let prepared=false;
function prep(){
  [commit,...rewritePaths,...navMarks].forEach(p=>{
    const len=p.getTotalLength();
    p.dataset.len=len;
    p.style.strokeDasharray=len;
    p.style.strokeDashoffset=len;
  });
  prepared=true;
}
function draw(path,t){
  if(!prepared)prep();
  const len=+path.dataset.len;
  path.style.opacity=t>0?1:0;
  path.style.strokeDashoffset=len*(1-C(t));
}

function update(){
  const max=sceneWrap.offsetHeight-innerHeight;
  const r=sceneWrap.getBoundingClientRect();
  const p=C(-r.top/max);
  const mobile=innerWidth<=760;

  const tr=E(C((p-.04)/.24));
  const sx=mobile?20:innerWidth*.033;
  const sy=innerHeight*(mobile?.56:.53);
  const ex=mobile?20:Math.max(22,innerWidth*.033);
  const ey=mobile?22:Math.max(22,innerWidth*.033);
  const ss=mobile?Math.min(104,innerWidth*.22):Math.min(250,Math.max(92,innerWidth*.14));
  const es=mobile?12:Math.max(12,Math.min(16,innerWidth*.009));

  nameEl.style.left=M(sx,ex,tr)+'px';
  nameEl.style.top=M(sy,ey,tr)+'px';
  nameEl.style.fontSize=M(ss,es,tr)+'px';
  nameEl.style.letterSpacing=M(-.055,0,tr)+'em';

  loc.style.opacity=1-C((p-.08)/.16);

  const nin=E(C((p-.25)/.10));
  nav.style.opacity=nin;
  nav.style.transform=`translateY(${M(-7,0,nin)}px)`;

  const qp=C((p-.33)/.28);
  letters.forEach((el,i)=>{
    const start=i*.11;
    const t=E(C((qp-start)/.10));
    el.style.opacity=t;
    el.style.transform=`translateY(${M(.18,0,t)}em)`;
  });

  const ain=E(C((p-.61)/.07));
  answer.style.opacity=ain;
  answer.style.transform=`translateY(${M(18,0,ain)}px)`;

  draw(commit,C((p-.71)/.05));
  const windows=[[.78,.84],[.845,.905],[.91,.975]];
  rewritePaths.forEach((path,i)=>{
    const[a,b]=windows[i];
    draw(path,C((p-a)/(b-a)));
  });

  draw(navMarks[0],C((p-.972)/.013));
  draw(navMarks[1],C((p-.982)/.013));
}

addEventListener('scroll',update,{passive:true});
addEventListener('resize',()=>{prepared=false;update()});
update();