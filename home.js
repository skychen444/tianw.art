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

/*
  The rewrite is built as a sequence of reinterpretations of one committed line.
  Each pass has a different entry point, coverage, pressure and asymmetric tail.
  Straight segments and repeated crossings intentionally echo the drawn installation
  rather than a smooth decorative wave.
*/
const variants=[
  {start:.06,cover:.52,cross:6,amp:28,bias:-.02,tail:.12},
  {start:.18,cover:.58,cross:7,amp:38,bias:.02,tail:.17},
  {start:.10,cover:.70,cross:8,amp:48,bias:-.03,tail:.20},
  {start:.30,cover:.54,cross:7,amp:42,bias:.04,tail:.14},
  {start:.14,cover:.76,cross:9,amp:54,bias:-.01,tail:.22},
  {start:.24,cover:.63,cross:8,amp:60,bias:.03,tail:.17},
  {start:.04,cover:.84,cross:10,amp:66,bias:-.02,tail:.24},
  {start:.20,cover:.72,cross:9,amp:72,bias:.02,tail:.20}
];

function rand(seed){
  let s=seed>>>0;
  return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296};
}

function buildRewrite(v,index){
  const r=rand(9187+index*733);
  const x0=18,x1=682,w=x1-x0,base=108;
  const start=x0+w*C(v.start+(r()-.5)*.05);
  const span=w*C(v.cover+(r()-.5)*.06,.34,.9);
  const end=Math.min(x1,start+span);
  const pts=[];

  // A slightly displaced entry creates the sense of a line being picked up again.
  pts.push([Math.max(x0,start-w*.035),base+(r()-.5)*10]);
  pts.push([start,base+(r()-.5)*5]);

  const n=v.cross;
  for(let i=1;i<=n;i++){
    const q=i/n;
    const warped=Math.pow(q,.86+(r()-.5)*.18);
    const x=M(start,end,warped)+((r()-.5)*w*.022)+(v.bias*w*q);
    const central=Math.sin(Math.PI*q);
    const pressure=v.amp*(.48+.62*central)*(1+(r()-.5)*.28);
    const side=i%2? -1:1;
    const y=base+side*pressure+(r()-.5)*14;
    pts.push([x,y]);

    // Some passes double back locally, producing the dense knots seen in the work.
    if((index>=2 && i===Math.ceil(n*.48)) || (index>=4 && i===Math.ceil(n*.68))){
      pts.push([x-w*(.045+.045*r()),base-side*pressure*(.30+.20*r())]);
      pts.push([x+w*(.025+.035*r()),base+side*pressure*(.58+.20*r())]);
    }
  }

  pts.push([end,base+(r()-.5)*8]);
  const tail=Math.min(x1,end+w*v.tail);
  if(tail>end+4){
    pts.push([M(end,tail,.42),base+(index%2?1:-1)*(10+18*r())]);
    pts.push([tail,base+(r()-.5)*5]);
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

  const tr=E(C((p-.02)/.28));
  const sx=mobile?20:innerWidth*.033;
  const sy=innerHeight*(mobile?.58:.53);
  const ex=mobile?20:Math.max(22,innerWidth*.033);
  const ey=mobile?21:Math.max(22,innerWidth*.033);
  const ss=mobile?Math.min(112,innerWidth*.23):Math.min(250,Math.max(92,innerWidth*.14));
  const es=mobile?12:Math.max(12,Math.min(16,innerWidth*.009));

  nameEl.style.left=M(sx,ex,tr)+'px';
  nameEl.style.top=M(sy,ey,tr)+'px';
  nameEl.style.fontSize=M(ss,es,tr)+'px';
  nameEl.style.letterSpacing=M(-.055,0,tr)+'em';

  const lout=C((p-.05)/.17);
  loc.style.opacity=1-lout;

  const nin=E(C((p-.28)/.08));
  nav.style.opacity=nin;
  nav.style.transform=`translateY(${M(-7,0,nin)}px)`;

  // Slower character-by-character question reveal on mobile and desktop.
  const qp=C((p-.37)/.31);
  letters.forEach((el,i)=>{
    const start=i*.09;
    const t=E(C((qp-start)/.12));
    el.style.opacity=t;
    el.style.transform=`translateY(${M(.18,0,t)}em)`;
  });

  const ain=E(C((p-.675)/.05));
  answer.style.opacity=ain;
  answer.style.transform=`translateY(${M(14,0,ain)}px)`;

  // First: the committed straight line. Then: one rewrite at a time.
  draw(commit,C((p-.735)/.042));
  const windows=[
    [.790,.812],[.818,.838],[.844,.864],[.870,.891],
    [.897,.917],[.923,.942],[.948,.967],[.970,.985]
  ];
  rewritePaths.forEach((path,i)=>{
    const[a,b]=windows[i];
    draw(path,C((p-a)/(b-a)));
  });

  draw(navMarks[0],C((p-.986)/.008));
  draw(navMarks[1],C((p-.993)/.007));
}

addEventListener('scroll',update,{passive:true});
addEventListener('resize',()=>{prepared=false;update()});
update();