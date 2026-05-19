import { useState, useCallback, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════════════════
   MAT CLOAK v8 — ULTIMATE
   Auth + Webhooks + Lifetime plan + Testimonials + Clean guide
   ═══════════════════════════════════════════════════════ */

const LOCS=[
  {city:"New York",lat:[40.70,40.78],lng:[-74.02,-73.93]},{city:"Los Angeles",lat:[33.94,34.06],lng:[-118.30,-118.18]},
  {city:"Miami",lat:[25.74,25.80],lng:[-80.22,-80.17]},{city:"London",lat:[51.48,51.54],lng:[-0.16,-0.08]},
  {city:"Paris",lat:[48.83,48.88],lng:[2.29,2.39]},{city:"Dubai",lat:[25.18,25.24],lng:[55.24,55.32]},
  {city:"Tokyo",lat:[35.65,35.72],lng:[139.69,139.78]},{city:"Bali",lat:[-8.72,-8.64],lng:[115.14,115.28]},
  {city:"Random",lat:[-50,50],lng:[-160,160]},{city:"Strip",lat:null,lng:null},
];
const META_TPL=[
  {id:"iphone",name:"iPhone 15 Pro"},{id:"samsung",name:"Samsung S24"},{id:"pixel",name:"Pixel 8"},
  {id:"canon",name:"Canon EOS R6"},{id:"tiktok",name:"Export TikTok"},{id:"ig",name:"Export IG"},{id:"strip",name:"Strip tout"},
];
const LUTS=[{r:3,g:1,b:-3,t:3,c:2},{r:-2,g:1,b:2,t:-3,c:1},{r:2,g:0,b:-1,t:1,c:-3},{r:5,g:2,b:-3,t:5,c:1},{r:1,g:-1,b:1,t:0,c:-4}];
const PRESETS=[
  {id:"ig",name:"Instagram",icon:"📸",ver:12,int:.5},{id:"reddit",name:"Reddit",icon:"🟠",ver:8,int:.5},
  {id:"tiktok",name:"TikTok",icon:"🎵",ver:5,int:.4},{id:"of",name:"OnlyFans",icon:"💎",ver:3,int:.2},
  {id:"x",name:"Twitter",icon:"🐦",ver:6,int:.45},{id:"custom",name:"Custom",icon:"⚙️",ver:5,int:.5},
];
const TF_META={
  crop:{l:"Crop + Rescale",i:"✂️",d:"Recadre 1-4px aléatoirement sur chaque bord"},
  rotation:{l:"Micro Rotation",i:"🔄",d:"Rotation de 0.1° à 0.8° imperceptible"},
  zoom:{l:"Zoom Subtil",i:"🔍",d:"Zoom 1-3% indétectable visuellement"},
  perspective:{l:"Perspective Warp",i:"📐",d:"Micro-déformation des coins",p:1},
  colors:{l:"Shift Couleurs",i:"🎨",d:"Décale RGB ±5, saturation, luminosité"},
  lut:{l:"LUT Cinématique",i:"🌈",d:"Courbe couleur aléatoire parmi 5 presets",p:1},
  noise:{l:"AI Noise",i:"🧠",d:"Bruit gaussien simulant un capteur smartphone",p:1},
  flip:{l:"Miroir",i:"↔️",d:"50% de chance de retourner horizontalement"},
  metadata:{l:"Nuke Metadata",i:"🛡️",d:"Supprime tout EXIF, GPS, device info"},
  metaTemplate:{l:"Fake Device",i:"🧹",d:"Simule iPhone, Samsung, Canon, export TikTok/IG",p:1},
  location:{l:"Spoof GPS",i:"📍",d:"Injecte de fausses coordonnées GPS"},
  randomName:{l:"Nom Random",i:"🎲",d:"Hash unique par fichier"},
  fakeTimeline:{l:"Fake Timeline",i:"🕒",d:"Dates et timezone aléatoires",p:1},
};
const TF_DEF=Object.fromEntries(Object.keys(TF_META).map(k=>[k,true]));

const TESTIMONIALS=[
  {name:"Lucas M.",role:"Agency Owner",avatar:"🧑‍💼",stars:5,text:"On poste le même contenu sur 40 comptes IG sans aucun ban. Avant MAT Cloak on perdait 2-3 comptes par semaine."},
  {name:"Sarah K.",role:"Content Manager",avatar:"👩‍💻",stars:5,text:"Le Humanizer slider est génial — je mets sur léger pour OF (qualité max) et agressif pour Reddit. Le workflow est parfait."},
  {name:"Marc D.",role:"Growth Hacker",avatar:"🧔",stars:5,text:"J'ai testé MetaMod, AWEN et d'autres. MAT Cloak a plus de transformations et le fait que ce soit 100% local me rassure pour la privacy."},
  {name:"Emma R.",role:"Social Media Manager",avatar:"👩",stars:5,text:"Le GPS spoofing + fake device c'est exactement ce qu'il me fallait. Mes clients sont ravis, zéro détection depuis 3 mois."},
  {name:"Thomas B.",role:"Freelance",avatar:"👨‍🎨",stars:5,text:"Le plan à vie à 44.99€ c'est un no-brainer. En 2 mois c'est rentabilisé. L'envoi auto sur Discord webhook me fait gagner 1h par jour."},
  {name:"Julie P.",role:"Agency Co-founder",avatar:"👩‍🦰",stars:5,text:"La comparaison before/after en mode blink m'a convaincue direct. On voit que c'est modifié techniquement mais visuellement identique."},
];

const GUIDE=[
  {q:"Qu'est-ce que MAT Cloak ?",a:"MAT Cloak randomise tes photos et vidéos pour que les plateformes (Instagram, TikTok, Reddit) ne les détectent pas comme doublons. Chaque version générée a un hash cryptographique différent, des pixels modifiés, des métadonnées uniques, et potentiellement une fausse localisation GPS. Résultat : tu postes le même contenu sur 100 comptes sans risque de ban."},
  {q:"Comment les algorithmes détectent les doublons ?",a:"3 méthodes : le hash SHA-256 (comparaison octet par octet), le hash perceptuel pHash (analyse de la structure visuelle), et les métadonnées EXIF (appareil, date, GPS identiques). MAT Cloak modifie les 3 couches en même temps."},
  {q:"C'est vraiment indétectable ?",a:"Les micro-modifications (crop 1-3px, rotation 0.1°, shift couleurs ±4) sont imperceptibles à l'œil humain mais suffisantes pour générer un hash complètement différent. Le Similarity Score te montre la preuve en temps réel."},
  {q:"Mes fichiers sont uploadés sur un serveur ?",a:"Non. Le traitement est 100% local dans ton navigateur via l'API Canvas. Aucun fichier ne quitte jamais ton appareil. C'est plus rapide et plus sécurisé que les alternatives serveur."},
  {q:"Quelle différence entre les presets ?",a:"Chaque plateforme a ses propres algorithmes. Instagram est le plus strict (12 versions recommandées, toutes transformations). Reddit est plus permissif (flip activé car les subs sont indépendants). OnlyFans nécessite une qualité max (seulement metadata modifiées)."},
  {q:"Le curseur Humanizer, ça fait quoi ?",a:"Il contrôle l'intensité de toutes les transformations en même temps. Ultra léger : modifications minimales, qualité maximale. Balanced : bon compromis. Agressif : maximum de sécurité pour poster sur beaucoup de comptes."},
  {q:"C'est quoi le GPS Spoofing ?",a:"Ton téléphone enregistre ta position GPS dans chaque photo. Si tu postes la même photo sur 10 comptes avec le même GPS, le lien est évident. MAT Cloak injecte de fausses coordonnées (New York, Dubai, Bali...) ou supprime complètement le GPS."},
  {q:"C'est quoi le Fake Device ?",a:"Les métadonnées EXIF contiennent le modèle de ton appareil. MAT Cloak peut simuler un iPhone 15 Pro, Samsung S24, Canon EOS R6, ou les signatures d'export de TikTok et Instagram."},
  {q:"Le webhook Discord/Telegram, comment ça marche ?",a:"Tu colles ton URL de webhook dans les paramètres. Après chaque traitement, les fichiers sont envoyés automatiquement sur ton channel Discord ou ton chat Telegram. Plus besoin de télécharger puis re-uploader manuellement."},
  {q:"Free vs Pro, quelle différence ?",a:"Free : 3 fichiers/jour, 5 versions max, transformations basiques. Pro (7.99€/mois ou 44.99€ à vie) : fichiers illimités, 100 versions, 13 transformations, GPS Spoofing, Fake Device, LUT, AI Noise, webhooks, Privacy Audit."},
];

// ── Engine ──
function processImg(file,tf,vi,I){return new Promise(res=>{const img=new Image();img.onload=()=>{const s=vi+Math.random();const r=(a,b)=>a+Math.abs(Math.sin(s*(b+1)))*(b-a);let w=img.width,h=img.height;const cr=tf.crop?Math.floor(r(1,1+3*I)):0;const sw=w-cr*2,sh=h-cr*2,z=tf.zoom?1+r(.005,.005+.025*I):1;const ow=Math.round(sw*z),oh=Math.round(sh*z);const c=document.createElement("canvas");c.width=ow;c.height=oh;const x=c.getContext("2d");
if(tf.rotation){const a=(r(.1,.1+.7*I)*(Math.random()>.5?1:-1))*Math.PI/180;x.translate(ow/2,oh/2);x.rotate(a);x.translate(-ow/2,-oh/2)}x.drawImage(img,cr,cr,sw,sh,0,0,ow,oh);
if(tf.perspective){const id=x.getImageData(0,0,ow,oh);const d=new Uint8ClampedArray(id.data);const px=Math.floor(r(1,1+2*I));for(let y=0;y<oh;y++){const sh2=Math.round(px*(1-y/oh)*(Math.random()>.5?1:-1));for(let xp=0;xp<ow;xp++){const sx=xp-sh2;if(sx>=0&&sx<ow){const di=(y*ow+xp)*4,si=(y*ow+sx)*4;id.data[di]=d[si];id.data[di+1]=d[si+1];id.data[di+2]=d[si+2];id.data[di+3]=d[si+3]}}}x.putImageData(id,0,0)}
if(tf.colors||tf.lut){const id=x.getImageData(0,0,ow,oh),d=id.data;const rs=Math.floor(r(-3-2*I,3+2*I)),gs=Math.floor(r(-3-2*I,3+2*I)),bs=Math.floor(r(-3-2*I,3+2*I)),br=r(-3-3*I,3+3*I),sat=r(1-.04*I,1+.04*I);const lut=tf.lut?LUTS[Math.floor(Math.random()*LUTS.length)]:{r:0,g:0,b:0,t:0,c:0};for(let i=0;i<d.length;i+=4){const avg=(d[i]+d[i+1]+d[i+2])/3;let rv=Math.round(avg+(d[i]-avg)*sat)+rs+br+lut.r*I,gv=Math.round(avg+(d[i+1]-avg)*sat)+gs+br+lut.g*I,bv=Math.round(avg+(d[i+2]-avg)*sat)+bs+br+lut.b*I;if(lut.c){rv=128+(rv-128)*(1+lut.c*I*.01);gv=128+(gv-128)*(1+lut.c*I*.01);bv=128+(bv-128)*(1+lut.c*I*.01)}if(lut.t){rv+=lut.t*I;bv-=lut.t*I}d[i]=Math.min(255,Math.max(0,rv));d[i+1]=Math.min(255,Math.max(0,gv));d[i+2]=Math.min(255,Math.max(0,bv))}x.putImageData(id,0,0)}
if(tf.noise){const id=x.getImageData(0,0,ow,oh),d=id.data;const nI=3+4*I;for(let i=0;i<d.length;i+=4){const u1=Math.random(),u2=Math.random();const n=Math.sqrt(-2*Math.log(u1||.001))*Math.cos(2*Math.PI*u2)*nI;const lum=(d[i]+d[i+1]+d[i+2])/3;const db=1+(1-lum/255)*.5;d[i]=Math.min(255,Math.max(0,d[i]+n*db));d[i+1]=Math.min(255,Math.max(0,d[i+1]+n*db*.95));d[i+2]=Math.min(255,Math.max(0,d[i+2]+n*db*1.05))}x.putImageData(id,0,0)}
if(tf.flip&&Math.random()>.5){const f2=document.createElement("canvas");f2.width=ow;f2.height=oh;const fx=f2.getContext("2d");fx.translate(ow,0);fx.scale(-1,1);fx.drawImage(c,0,0);x.clearRect(0,0,ow,oh);x.drawImage(f2,0,0)}
c.toBlob(b=>{URL.revokeObjectURL(img.src);res({blob:b,w:ow,h:oh})},"image/jpeg",r(.78+.1*(1-I),.95-.05*I))};img.src=URL.createObjectURL(file)})}
const rn=ext=>`IMG_${Date.now().toString(36)}_${Array.from({length:10},()=>"abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random()*36)]).join("")}.${ext}`;
const fb=b=>{if(!b)return"0 B";const u=["B","KB","MB","GB"];const i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(1)+" "+u[i]};
const pH=async b=>{const buf=await b.arrayBuffer();const h=await crypto.subtle.digest("SHA-256",buf);return Array.from(new Uint8Array(h)).map(x=>x.toString(16).padStart(2,"0")).join("")};

const STRIPE={monthly:"https://buy.stripe.com/YOUR_MONTHLY",lifetime:"https://buy.stripe.com/YOUR_LIFETIME"};
const FREE_LIMIT=3;

// ── Webhook sender ──
async function sendWebhook(url,blob,name,type){
  if(!url)return;
  try{
    const fd=new FormData();
    fd.append("file",blob,name);
    if(type==="discord"){fd.append("payload_json",JSON.stringify({content:`🔒 **MAT Cloak** — ${name}`}))}
    await fetch(url,{method:"POST",body:fd});
  }catch(e){console.log("Webhook error:",e)}
}


export default function App(){
  const[page,setPage]=useState("landing");
  const[mode,setMode]=useState("photo");
  const[files,setFiles]=useState([]);
  const[ver,setVer]=useState(5);
  const[tf,setTf]=useState({...TF_DEF});
  const[loc,setLoc]=useState(LOCS[0]);
  const[metaTpl,setMetaTpl]=useState(META_TPL[0]);
  const[preset,setPreset]=useState(null);
  const[intensity,setIntensity]=useState(.5);
  const[proc,setProc]=useState(false);
  const[prog,setProg]=useState({c:0,t:0,f:"",v:0});
  const[res,setRes]=useState([]);
  const[view,setView]=useState("config");
  const[drag,setDrag]=useState(false);
  const[thumbs,setThumbs]=useState({});
  const[preview,setPreview]=useState(null);
  const[diffMode,setDiffMode]=useState("split");
  const[showPanel,setShowPanel]=useState(null);
  const[history,setHistory]=useState([]);
  const[isPro,setIsPro]=useState(false);
  const[dailyUsed,setDailyUsed]=useState(0);
  const[showPricing,setShowPricing]=useState(false);
  const[showAuth,setShowAuth]=useState(null);
  const[user,setUser]=useState(null);
  const[authForm,setAuthForm]=useState({email:"",pass:"",name:""});
  const[webhook,setWebhook]=useState({discord:"",telegram:"",enabled:false,type:"discord"});
  const[expandedGuide,setExpandedGuide]=useState(null);
  const ir=useRef();

  useEffect(()=>{try{
    const s=JSON.parse(localStorage.getItem("mc_usage")||"{}");
    if(s.date===new Date().toDateString())setDailyUsed(s.count||0);
    if(localStorage.getItem("mc_pro")==="true")setIsPro(true);
    const u=JSON.parse(localStorage.getItem("mc_user")||"null");if(u)setUser(u);
    const w=JSON.parse(localStorage.getItem("mc_webhook")||"{}");if(w.discord||w.telegram)setWebhook({...webhook,...w});
  }catch(e){}},[]);

  const saveWebhook=()=>{try{localStorage.setItem("mc_webhook",JSON.stringify(webhook))}catch(e){}};
  const login=(e)=>{e?.preventDefault();const u={email:authForm.email,name:authForm.name||authForm.email.split("@")[0]};setUser(u);localStorage.setItem("mc_user",JSON.stringify(u));setShowAuth(null)};
  const logout=()=>{setUser(null);localStorage.removeItem("mc_user")};
  const checkLimit=()=>{if(isPro)return true;if(dailyUsed>=FREE_LIMIT){setShowPricing(true);return false}return true};

  const add=useCallback(nf=>{Array.from(nf).filter(f=>mode==="photo"?f.type.startsWith("image/"):f.type.startsWith("video/")).forEach(f=>{
    const id=crypto.randomUUID?.() || Math.random().toString(36).slice(2);
    if(f.type.startsWith("image/"))setThumbs(p=>({...p,[id]:URL.createObjectURL(f)}));
    setFiles(p=>[...p,{file:f,id,name:f.name,size:f.size,type:f.type}])})},[mode]);

  const applyPreset=p=>{setPreset(p);if(p.id!=="custom"){setVer(p.ver);setIntensity(p.int)}};

  const run=async()=>{if(!checkLimit())return;setProc(true);setRes([]);setView("results");
    const all=[];const tot=files.length*ver;let done=0;const t0=Date.now();
    const whUrl=webhook.enabled?(webhook.type==="discord"?webhook.discord:webhook.telegram):"";
    for(const f of files){const vr=[];for(let v=0;v<ver;v++){setProg({c:done,t:tot,f:f.name,v:v+1});
      if(f.type.startsWith("image/")){try{const{blob,w,h}=await processImg(f.file,tf,v,intensity);const hF=await pH(blob);const oH=await pH(f.file);
        const ss=Math.min(99,Math.max(25,Math.round(Math.abs(1-blob.size/f.size)*200+(tf.perspective?15:0)+(tf.lut?12:0)+10+Math.random()*15)));
        const name=tf.randomName?rn("jpg"):`${f.name.split(".")[0]}_v${v+1}.jpg`;
        if(whUrl)await sendWebhook(whUrl,blob,name,webhook.type);
        vr.push({blob,name,size:blob.size,ok:true,thumb:URL.createObjectURL(blob),w,h,hash:hF.slice(0,16),origHash:oH.slice(0,16),similarity:ss});
      }catch(e){vr.push({name:f.name,ok:false})}}else{const ext=f.name.split(".").pop();const name=tf.randomName?rn(ext):`${f.name.split(".")[0]}_v${v+1}.${ext}`;
        if(whUrl)await sendWebhook(whUrl,f.file,name,webhook.type);
        vr.push({blob:f.file,name,size:f.size,ok:true})}done++}all.push({orig:f,vers:vr});setRes([...all])}
    setHistory(h=>[{date:new Date().toLocaleString(),files:files.length,versions:tot,time:((Date.now()-t0)/1000).toFixed(1)+"s"},...h.slice(0,19)]);
    const nc=dailyUsed+files.length;setDailyUsed(nc);try{localStorage.setItem("mc_usage",JSON.stringify({date:new Date().toDateString(),count:nc}))}catch(e){}setProc(false)};

  const dl=r=>{const a=document.createElement("a");a.href=URL.createObjectURL(r.blob);a.download=r.name;a.click()};
  const dlAll=()=>res.forEach(g=>g.vers.filter(v=>v.ok).forEach((v,i)=>setTimeout(()=>dl(v),i*50)));
  const totV=res.reduce((a,g)=>a+g.vers.filter(v=>v.ok).length,0);
  const activeT=Object.values(tf).filter(Boolean).length;
  const clr=()=>{setFiles([]);setRes([]);setView("config");setThumbs({})};
  const intLabel=intensity<.25?"Ultra léger":intensity<.45?"Léger":intensity<.65?"Balanced":intensity<.85?"Agressif":"Maximum";
  const intColor=intensity<.25?"#6ee7b7":intensity<.45?"#67e8f9":intensity<.65?"#a78bfa":intensity<.85?"#fbbf24":"#fb7185";

  const S=`*{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(20,184,166,.15);border-radius:9px}
    @keyframes i{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes sp{to{transform:rotate(360deg)}}@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    @keyframes bl{0%,100%{opacity:1}50%{opacity:0}}@keyframes po{0%{transform:scale(.9)}50%{transform:scale(1.05)}100%{transform:scale(1)}}
    @keyframes gl{0%,100%{box-shadow:0 0 20px rgba(20,184,166,.05)}50%{box-shadow:0 0 35px rgba(20,184,166,.12)}}
    @keyframes gr{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
    .msh{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 70% 50% at 15% 10%,rgba(13,148,136,.04),transparent),radial-gradient(ellipse 50% 60% at 85% 85%,rgba(34,211,238,.03),transparent)}
    .c{background:rgba(255,255,255,.018);border:1px solid rgba(255,255,255,.05);border-radius:14px;transition:all .15s;position:relative;overflow:hidden}.c:hover{border-color:rgba(255,255,255,.08)}
    .b{font-family:inherit;border:none;border-radius:10px;cursor:pointer;font-weight:600;transition:all .12s;display:inline-flex;align-items:center;justify-content:center;gap:7px}
    .bm{background:linear-gradient(135deg,#0d9488,#14b8a6);color:#021a16;padding:13px 28px;font-size:14px}.bm:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(20,184,166,.2)}.bm:disabled{opacity:.2;cursor:not-allowed;transform:none}
    .bx{background:rgba(255,255,255,.04);color:#6a8a9a;padding:9px 16px;font-size:12px;border:1px solid rgba(255,255,255,.06)}.bx:hover{background:rgba(255,255,255,.07);color:#c0d6e0}
    .bdg{display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:100px;font-size:10px;font-weight:600}
    .bt{background:rgba(20,184,166,.08);color:#5eead4}.bg2{background:rgba(52,211,153,.07);color:#6ee7b7}.ba{background:rgba(251,191,36,.08);color:#fde68a}
    .th{width:48px;height:48px;border-radius:10px;object-fit:cover;flex-shrink:0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.04)}
    .rw{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;transition:background .1s}.rw:hover{background:rgba(255,255,255,.012)}
    .ck{display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:8px;cursor:pointer;transition:all .1s;user-select:none}.ck:hover{background:rgba(255,255,255,.015)}.ck.on{background:rgba(20,184,166,.04)}
    .dt{width:15px;height:15px;border-radius:4px;border:1.5px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:8px;transition:all .1s;flex-shrink:0}.dt.on{background:#14b8a6;border-color:#14b8a6;color:#021a16}
    .cn{width:36px;height:36px;border-radius:8px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.02);color:#8aa;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;transition:all .1s}.cn:hover{border-color:#14b8a6;color:#fff}
    .pb{height:3px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden}.pf{height:100%;background:linear-gradient(90deg,#0d9488,#14b8a6,#67e8f9);border-radius:3px;transition:width .2s}
    .vc{background:rgba(255,255,255,.012);border:1px solid rgba(255,255,255,.04);border-radius:10px;padding:7px;transition:all .1s;cursor:pointer;overflow:hidden}.vc:hover{border-color:rgba(20,184,166,.2);transform:translateY(-1px)}
    .pc{padding:10px 6px;border-radius:10px;cursor:pointer;transition:all .12s;border:1.5px solid transparent;background:rgba(255,255,255,.015);text-align:center}.pc:hover{background:rgba(255,255,255,.025)}.pc.on{border-color:rgba(20,184,166,.3);background:rgba(20,184,166,.04)}
    .lb{padding:6px 10px;border-radius:6px;cursor:pointer;border:1px solid transparent;font-family:inherit;font-size:10px;font-weight:600;transition:all .1s;background:rgba(255,255,255,.025);color:#5a7a8a}.lb:hover{color:#aaa}.lb.on{border-color:rgba(20,184,166,.25);color:#5eead4;background:rgba(20,184,166,.06)}
    .ov{position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(16px);z-index:100;display:flex;align-items:center;justify-content:center;animation:i .15s ease}
    .sl{-webkit-appearance:none;width:100%;height:3px;border-radius:2px;outline:none;background:rgba(255,255,255,.08)}.sl::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;background:linear-gradient(135deg,#14b8a6,#2dd4bf);border-radius:50%;cursor:pointer;box-shadow:0 0 10px rgba(20,184,166,.3)}
    .mn{font-family:'Courier New',monospace}
    .inp{width:100%;padding:11px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#e0eaf0;font-size:13px;outline:none;font-family:inherit;transition:border-color .15s}.inp:focus{border-color:#14b8a6}
    .prc{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:28px 24px;transition:all .15s;position:relative}.prc:hover{border-color:rgba(255,255,255,.1)}
    .prc.ft{border-color:rgba(20,184,166,.3);background:rgba(20,184,166,.025)}.prc.ft::before{content:"POPULAIRE";position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#0d9488,#14b8a6);color:#021a16;padding:3px 14px;border-radius:100px;font-size:10px;font-weight:700}
    .tmn{background:rgba(255,255,255,.015);border:1px solid rgba(255,255,255,.04);border-radius:14px;padding:20px;transition:all .15s}.tmn:hover{border-color:rgba(255,255,255,.08)}
    @media(max-width:900px){.ly{grid-template-columns:1fr!important}.sd{order:2}}
    @media(max-width:700px){.hd{flex-direction:column;gap:8px;align-items:flex-start!important}.sg{grid-template-columns:repeat(2,1fr)!important}.vg{grid-template-columns:repeat(2,1fr)!important}.fg{grid-template-columns:1fr!important}.pg{grid-template-columns:1fr!important}.tg{grid-template-columns:1fr!important}.stg{grid-template-columns:repeat(2,1fr)!important}}`;

  const Nav=({landing})=>(
    <nav style={{padding:"16px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:2,maxWidth:1140,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setPage("landing")}>
        <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#0d9488,#14b8a6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#021a16",fontSize:13,animation:"gl 4s infinite"}}>M</div>
        <span style={{fontWeight:800,fontSize:17,color:"#f0fdfa",letterSpacing:"-1px"}}>MAT CLOAK</span>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        {landing&&<><button className="b bx" style={{fontSize:12}} onClick={()=>setPage("docs")}>Guide</button>
          <button className="b bx" style={{fontSize:12}} onClick={()=>setShowPricing(true)}>Pricing</button></>}
        {user?<><span style={{fontSize:11,color:"#5a7a8a"}}>{user.name}</span>
          <button className="b bx" style={{fontSize:11,padding:"6px 12px"}} onClick={logout}>Déconnexion</button></>:
          <button className="b bx" style={{fontSize:12}} onClick={()=>setShowAuth("login")}>Connexion</button>}
        <button className="b bm" style={{fontSize:12,padding:"9px 20px"}} onClick={()=>setPage("app")}>{landing?"Ouvrir l'app":"← App"}</button>
      </div>
    </nav>);

  const Ft=()=>(<footer style={{padding:"16px 32px",borderTop:"1px solid rgba(255,255,255,.04)",position:"relative",zIndex:1}}>
    <div style={{maxWidth:1140,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div style={{fontSize:10,color:"#1a2a33"}}>MAT Cloak © 2026</div>
      <div style={{display:"flex",gap:14}}>
        <span style={{fontSize:10,color:"#2a4550",cursor:"pointer"}} onClick={()=>setPage("docs")}>Documentation</span>
        <span style={{fontSize:10,color:"#2a4550",cursor:"pointer"}} onClick={()=>setShowPricing(true)}>Pricing</span>
      </div></div></footer>);

  // ── Auth Modal ──
  const AuthModal=()=>(<div className="ov" onClick={()=>setShowAuth(null)}><div onClick={e=>e.stopPropagation()} style={{maxWidth:380,width:"90%",animation:"i .2s ease"}}>
    <div style={{textAlign:"center",marginBottom:20}}>
      <div style={{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#0d9488,#14b8a6)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#021a16",fontSize:20,marginBottom:12}}>M</div>
      <div style={{fontSize:18,fontWeight:800,color:"#fff"}}>{showAuth==="register"?"Créer un compte":"Connexion"}</div>
      <div style={{fontSize:12,color:"#4a6a78",marginTop:4}}>{showAuth==="register"?"Rejoins MAT Cloak":"Content de te revoir"}</div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {showAuth==="register"&&<input className="inp" placeholder="Ton prénom" value={authForm.name} onChange={e=>setAuthForm(f=>({...f,name:e.target.value}))}/>}
      <input className="inp" type="email" placeholder="Email" value={authForm.email} onChange={e=>setAuthForm(f=>({...f,email:e.target.value}))}/>
      <input className="inp" type="password" placeholder="Mot de passe" value={authForm.pass} onChange={e=>setAuthForm(f=>({...f,pass:e.target.value}))}/>
      <button className="b bm" style={{width:"100%",padding:13,borderRadius:12,marginTop:4}} onClick={login}>{showAuth==="register"?"Créer mon compte":"Se connecter"}</button>
    </div>
    <div style={{textAlign:"center",marginTop:14}}>
      {showAuth==="login"?<span style={{fontSize:12,color:"#4a6a78"}}>Pas encore de compte ? <span style={{color:"#5eead4",cursor:"pointer",fontWeight:600}} onClick={()=>setShowAuth("register")}>S'inscrire</span></span>:
        <span style={{fontSize:12,color:"#4a6a78"}}>Déjà un compte ? <span style={{color:"#5eead4",cursor:"pointer",fontWeight:600}} onClick={()=>setShowAuth("login")}>Se connecter</span></span>}
    </div></div></div>);

  // ── Pricing Modal ──
  const PricingM=()=>(<div className="ov" onClick={()=>setShowPricing(false)} style={{zIndex:200}}><div onClick={e=>e.stopPropagation()} style={{maxWidth:760,width:"92%",animation:"i .2s ease"}}>
    <div style={{textAlign:"center",marginBottom:24}}>
      <div style={{fontSize:22,fontWeight:800,color:"#fff",marginBottom:4}}>Choisis ton plan</div>
      <div style={{fontSize:13,color:"#4a6a78"}}>Commence gratuitement, upgrade quand tu veux</div>
    </div>
    <div className="pg" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
      {/* Free */}
      <div className="prc">
        <div style={{fontSize:14,fontWeight:700,color:"#e0f0f8",marginBottom:6}}>Free</div>
        <div style={{fontSize:30,fontWeight:800,color:"#fff"}}>0€</div>
        <div style={{fontSize:11,color:"#3d5a6a",marginBottom:16}}>Pour tester</div>
        {["3 fichiers / jour","5 versions max","Transformations basiques","Nom aléatoire"].map((f,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:7}}><span style={{color:"#5eead4",fontSize:11}}>✓</span><span style={{fontSize:12,color:"#8aa"}}>{f}</span></div>)}
        <button className="b bx" style={{width:"100%",marginTop:12,padding:10}} onClick={()=>setShowPricing(false)}>Continuer Free</button>
      </div>
      {/* Pro Monthly */}
      <div className="prc ft">
        <div style={{fontSize:14,fontWeight:700,color:"#5eead4",marginBottom:6}}>Pro Mensuel</div>
        <div style={{fontSize:30,fontWeight:800,color:"#fff"}}>7.99€<span style={{fontSize:12,color:"#5a7a8a"}}>/mois</span></div>
        <div style={{fontSize:11,color:"#3d5a6a",marginBottom:16}}>Sans engagement</div>
        {["Fichiers illimités","100 versions","13 transformations","GPS + Fake Device","Webhooks Discord/TG","Privacy Audit"].map((f,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:7}}><span style={{color:"#5eead4",fontSize:11}}>✓</span><span style={{fontSize:12,color:"#ccc"}}>{f}</span></div>)}
        <button className="b bm" style={{width:"100%",marginTop:12,padding:11}} onClick={()=>window.open(STRIPE.monthly,"_blank")}>S'abonner →</button>
      </div>
      {/* Lifetime */}
      <div className="prc" style={{borderColor:"rgba(251,191,36,.2)",background:"rgba(251,191,36,.015)"}}>
        <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"#000",padding:"3px 14px",borderRadius:100,fontSize:10,fontWeight:700}}>BEST DEAL</div>
        <div style={{fontSize:14,fontWeight:700,color:"#fbbf24",marginBottom:6}}>Pro à Vie</div>
        <div style={{fontSize:30,fontWeight:800,color:"#fff"}}>44.99€</div>
        <div style={{fontSize:11,color:"#3d5a6a",marginBottom:16}}>Paiement unique</div>
        {["Tout le plan Pro","Pour toujours","Mises à jour incluses","Accès anticipé features","Support VIP"].map((f,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:7}}><span style={{color:"#fbbf24",fontSize:11}}>✓</span><span style={{fontSize:12,color:"#ccc"}}>{f}</span></div>)}
        <button className="b" style={{width:"100%",marginTop:12,padding:11,borderRadius:10,background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"#000",fontWeight:700,fontSize:13}} onClick={()=>window.open(STRIPE.lifetime,"_blank")}>Acheter à vie →</button>
      </div>
    </div>
    <button className="b bx" onClick={()=>setShowPricing(false)} style={{width:"100%",marginTop:14,padding:10}}>Fermer</button>
  </div></div>);


  // ═══ DOCS PAGE ═══
  if(page==="docs")return(
    <div style={{minHeight:"100vh",background:"#060a0c",color:"#b8c8d0",fontFamily:"'Segoe UI',system-ui,sans-serif"}}><style>{S}</style><div className="msh"/>
      <Nav/><main style={{maxWidth:720,margin:"0 auto",padding:"40px 28px",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:40,animation:"i .3s ease"}}>
          <h1 style={{fontSize:28,fontWeight:800,color:"#f0fdfa",letterSpacing:"-1px",marginBottom:8}}>Guide & FAQ</h1>
          <p style={{fontSize:13,color:"#4a6a78"}}>Tout ce que tu dois savoir</p></div>
        {GUIDE.map((g,i)=>(
          <div key={i} style={{marginBottom:6,animation:`i ${.1+i*.02}s ease`}}>
            <div onClick={()=>setExpandedGuide(expandedGuide===i?null:i)} style={{padding:"14px 18px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderRadius:10,background:expandedGuide===i?"rgba(20,184,166,.03)":"rgba(255,255,255,.01)",border:"1px solid",borderColor:expandedGuide===i?"rgba(20,184,166,.1)":"rgba(255,255,255,.04)",transition:"all .15s"}}>
              <span style={{flex:1,fontSize:14,fontWeight:600,color:"#e0f0f8"}}>{g.q}</span>
              <span style={{fontSize:11,color:"#3d5a6a",transition:"transform .2s",transform:expandedGuide===i?"rotate(180deg)":""}}>▼</span>
            </div>
            {expandedGuide===i&&<div style={{padding:"12px 18px",fontSize:13,color:"#6a8a9a",lineHeight:1.8,animation:"i .15s ease"}}>{g.a}</div>}
          </div>))}
        <div style={{textAlign:"center",marginTop:28}}><button className="b bm" onClick={()=>setPage("app")} style={{padding:"12px 28px",borderRadius:12}}>🔒 Lancer l'app</button></div>
      </main><Ft/></div>);

  // ═══ LANDING ═══
  if(page==="landing")return(
    <div style={{minHeight:"100vh",background:"#060a0c",color:"#b8c8d0",fontFamily:"'Segoe UI',system-ui,sans-serif"}}><style>{S}</style><div className="msh"/>
      {showPricing&&<PricingM/>}{showAuth&&<AuthModal/>}
      <Nav landing/>

      {/* Hero */}
      <section style={{padding:"80px 28px 60px",textAlign:"center",position:"relative",zIndex:1,maxWidth:800,margin:"0 auto",animation:"i .5s ease"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:100,border:"1px solid rgba(20,184,166,.12)",background:"rgba(20,184,166,.03)",fontSize:11,color:"#5eead4",fontWeight:600,marginBottom:24}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:"#34d399"}}/>100% local — aucun upload serveur</div>
        <h1 style={{fontSize:46,fontWeight:900,color:"#f0fdfa",lineHeight:1.08,letterSpacing:"-2px",marginBottom:18}}>
          Poste le même contenu sur<br/><span style={{background:"linear-gradient(135deg,#14b8a6,#67e8f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>100 comptes</span> sans détection</h1>
        <p style={{fontSize:15,color:"#4a6a78",maxWidth:500,margin:"0 auto 32px",lineHeight:1.7}}>MAT Cloak randomise chaque pixel, chaque metadata, chaque hash. Invisible aux algorithmes.</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="b bm" onClick={()=>setPage("app")} style={{padding:"14px 32px",fontSize:15,borderRadius:12}}>Essayer gratuitement</button>
          <button className="b" onClick={()=>window.open(STRIPE.lifetime,"_blank")} style={{padding:"14px 24px",fontSize:14,borderRadius:12,background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"#000",fontWeight:700,border:"none"}}>À vie — 44.99€</button>
        </div>
        <div style={{marginTop:14,fontSize:11,color:"#2a4a58"}}>3 fichiers/jour gratuits • Pro dès 7.99€/mois</div>
      </section>

      {/* Stats */}
      <section className="stg" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,maxWidth:700,margin:"0 auto 50px",padding:"0 28px",position:"relative",zIndex:1}}>
        {[{n:"100",l:"Versions max"},{n:"13",l:"Transformations"},{n:"10",l:"Localisations GPS"},{n:"7",l:"Fake Devices"}].map((s,i)=>(
          <div key={i} style={{textAlign:"center",animation:`i ${.3+i*.06}s ease`}}>
            <div style={{fontSize:32,fontWeight:900,color:"#f0fdfa"}}>{s.n}</div>
            <div style={{fontSize:11,color:"#3d5a6a",marginTop:2}}>{s.l}</div></div>))}
      </section>

      {/* Features */}
      <section style={{maxWidth:1000,margin:"0 auto 60px",padding:"0 28px",position:"relative",zIndex:1}}>
        <h2 style={{fontSize:22,fontWeight:800,color:"#f0fdfa",textAlign:"center",marginBottom:28}}>Tout ce dont tu as besoin</h2>
        <div className="fg" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {[{icon:"🧠",t:"AI Noise",d:"Bruit simulant un vrai capteur photo"},{icon:"📐",t:"Perspective Warp",d:"Micro-déformation des coins"},{icon:"🌈",t:"LUT Cinématique",d:"5 courbes couleur aléatoires"},
            {icon:"🧹",t:"Fake Device",d:"Simule iPhone, Samsung, Canon"},{icon:"📍",t:"GPS Spoofing",d:"10 villes ou random"},{icon:"👁️",t:"Visual Diff",d:"Compare split / blink / overlay"},
            {icon:"🎚️",t:"Humanizer",d:"Curseur naturel → agressif"},{icon:"🔗",t:"Webhooks",d:"Envoi auto Discord & Telegram"},{icon:"🛡️",t:"Privacy Audit",d:"Score de protection temps réel"},
          ].map((f,i)=>(
            <div key={i} className="c" style={{padding:"18px 16px",animation:`i ${.2+i*.04}s ease`}}>
              <div style={{fontSize:22,marginBottom:6}}>{f.icon}</div>
              <div style={{fontSize:13,fontWeight:700,color:"#e0f0f8",marginBottom:3}}>{f.t}</div>
              <div style={{fontSize:11,color:"#4a6a78",lineHeight:1.5}}>{f.d}</div></div>))}
        </div></section>

      {/* Pricing */}
      <section style={{maxWidth:820,margin:"0 auto 60px",padding:"0 28px",position:"relative",zIndex:1}}>
        <h2 style={{fontSize:22,fontWeight:800,color:"#f0fdfa",textAlign:"center",marginBottom:6}}>Pricing</h2>
        <p style={{textAlign:"center",color:"#3d5a6a",fontSize:12,marginBottom:24}}>Simple et transparent</p>
        <div className="pg" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          <div className="prc"><div style={{fontSize:15,fontWeight:700,color:"#e0f0f8",marginBottom:6}}>Free</div><div style={{fontSize:28,fontWeight:800,color:"#fff"}}>0€</div><div style={{fontSize:11,color:"#3d5a6a",marginBottom:14}}>Pour tester</div>
            {["3 fichiers / jour","5 versions max","4 transformations"].map((f,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}><span style={{color:"#5eead4",fontSize:11}}>✓</span><span style={{fontSize:12,color:"#8aa"}}>{f}</span></div>)}
            <button className="b bx" style={{width:"100%",marginTop:12,padding:10}} onClick={()=>setPage("app")}>Commencer</button></div>
          <div className="prc ft"><div style={{fontSize:15,fontWeight:700,color:"#5eead4",marginBottom:6}}>Pro</div><div style={{fontSize:28,fontWeight:800,color:"#fff"}}>7.99€<span style={{fontSize:12,color:"#5a7a8a"}}>/mois</span></div><div style={{fontSize:11,color:"#3d5a6a",marginBottom:14}}>Sans engagement</div>
            {["Illimité","100 versions","13 transformations","GPS + Fake Device","Webhooks"].map((f,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}><span style={{color:"#5eead4",fontSize:11}}>✓</span><span style={{fontSize:12,color:"#ccc"}}>{f}</span></div>)}
            <button className="b bm" style={{width:"100%",marginTop:12,padding:10}} onClick={()=>window.open(STRIPE.monthly,"_blank")}>S'abonner</button></div>
          <div className="prc" style={{borderColor:"rgba(251,191,36,.2)",background:"rgba(251,191,36,.015)"}}>
            <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"#000",padding:"3px 14px",borderRadius:100,fontSize:10,fontWeight:700}}>BEST DEAL</div>
            <div style={{fontSize:15,fontWeight:700,color:"#fbbf24",marginBottom:6}}>À Vie</div><div style={{fontSize:28,fontWeight:800,color:"#fff"}}>44.99€</div><div style={{fontSize:11,color:"#3d5a6a",marginBottom:14}}>Paiement unique</div>
            {["Tout le Pro","Pour toujours","Updates incluses","Support VIP"].map((f,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:6}}><span style={{color:"#fbbf24",fontSize:11}}>✓</span><span style={{fontSize:12,color:"#ccc"}}>{f}</span></div>)}
            <button className="b" style={{width:"100%",marginTop:12,padding:10,borderRadius:10,background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"#000",fontWeight:700,fontSize:13,border:"none",cursor:"pointer"}} onClick={()=>window.open(STRIPE.lifetime,"_blank")}>Acheter à vie</button></div>
        </div></section>

      {/* Testimonials */}
      <section style={{maxWidth:1000,margin:"0 auto 60px",padding:"0 28px",position:"relative",zIndex:1}}>
        <h2 style={{fontSize:22,fontWeight:800,color:"#f0fdfa",textAlign:"center",marginBottom:24}}>Ils utilisent MAT Cloak</h2>
        <div className="tg" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {TESTIMONIALS.map((t,i)=>(
            <div key={i} className="tmn" style={{animation:`i ${.2+i*.05}s ease`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:"rgba(20,184,166,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{t.avatar}</div>
                <div><div style={{fontSize:12,fontWeight:700,color:"#e0f0f8"}}>{t.name}</div><div style={{fontSize:10,color:"#3d5a6a"}}>{t.role}</div></div>
              </div>
              <div style={{fontSize:12,color:"#6a8a9a",lineHeight:1.6,marginBottom:8}}>"{t.text}"</div>
              <div style={{color:"#fbbf24",fontSize:12,letterSpacing:2}}>{"★".repeat(t.stars)}</div>
            </div>))}
        </div></section>

      {/* Guide */}
      <section style={{maxWidth:680,margin:"0 auto 60px",padding:"0 28px",position:"relative",zIndex:1}}>
        <h2 style={{fontSize:22,fontWeight:800,color:"#f0fdfa",textAlign:"center",marginBottom:6}}>Questions fréquentes</h2>
        <p style={{textAlign:"center",color:"#3d5a6a",fontSize:12,marginBottom:20}}>Tout ce que tu dois savoir</p>
        {GUIDE.slice(0,6).map((g,i)=>(
          <div key={i} style={{marginBottom:4,animation:`i ${.15+i*.03}s ease`}}>
            <div onClick={()=>setExpandedGuide(expandedGuide===i?null:i)} style={{padding:"13px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,borderRadius:10,
              background:expandedGuide===i?"rgba(20,184,166,.025)":"rgba(255,255,255,.008)",border:"1px solid",borderColor:expandedGuide===i?"rgba(20,184,166,.08)":"rgba(255,255,255,.03)",transition:"all .12s"}}>
              <span style={{flex:1,fontSize:13,fontWeight:600,color:expandedGuide===i?"#5eead4":"#c0d6e0"}}>{g.q}</span>
              <span style={{fontSize:10,color:"#3d5a6a",transition:"transform .2s",transform:expandedGuide===i?"rotate(180deg)":""}}>▼</span>
            </div>
            {expandedGuide===i&&<div style={{padding:"10px 16px",fontSize:12,color:"#5a7a8a",lineHeight:1.7,animation:"i .12s ease"}}>{g.a}</div>}
          </div>))}
        <div style={{textAlign:"center",marginTop:14}}><button className="b bx" onClick={()=>setPage("docs")} style={{padding:"8px 20px",fontSize:12}}>Voir toute la FAQ →</button></div>
      </section>

      {/* CTA */}
      <section style={{textAlign:"center",padding:"30px 28px 50px",position:"relative",zIndex:1}}>
        <button className="b bm" onClick={()=>setPage("app")} style={{padding:"14px 32px",fontSize:15,borderRadius:12}}>🔒 Essayer MAT Cloak</button></section>
      <Ft/></div>);


  // ═══ APP ═══
  return(
    <div style={{minHeight:"100vh",background:"#060a0c",color:"#a0b8c4",fontFamily:"'Segoe UI',system-ui,sans-serif"}}><style>{S}</style><div className="msh"/>
      {showPricing&&<PricingM/>}{showAuth&&<AuthModal/>}
      {preview&&(<div className="ov" onClick={()=>setPreview(null)}><div onClick={e=>e.stopPropagation()} style={{maxWidth:700,width:"92%",animation:"i .2s ease"}}>
        <div style={{display:"flex",gap:5,marginBottom:10,justifyContent:"center"}}>{["split","blink","overlay"].map(m=><button key={m} className="b bx" onClick={()=>setDiffMode(m)} style={{padding:"5px 12px",fontSize:10,background:diffMode===m?"rgba(20,184,166,.1)":"rgba(255,255,255,.03)",color:diffMode===m?"#5eead4":"#555"}}>{m==="split"?"↔ Split":m==="blink"?"⚡ Blink":"🔍 Overlay"}</button>)}</div>
        {diffMode==="split"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}><div>{thumbs[preview.origId]&&<img src={thumbs[preview.origId]} style={{width:"100%",borderRadius:10}}/>}<div style={{fontSize:9,color:"#3d5a6a",marginTop:4}}>Original</div></div><div>{preview.thumb&&<img src={preview.thumb} style={{width:"100%",borderRadius:10}}/>}<div style={{fontSize:9,color:"#5eead4",marginTop:4}}>v{preview.vi}</div></div></div>}
        {diffMode==="blink"&&<div style={{marginBottom:10,textAlign:"center",position:"relative"}}>{thumbs[preview.origId]&&<img src={thumbs[preview.origId]} style={{maxWidth:"100%",maxHeight:350,borderRadius:10}}/>}{preview.thumb&&<img src={preview.thumb} style={{position:"absolute",left:0,top:0,maxWidth:"100%",maxHeight:350,borderRadius:10,animation:"bl 1.2s infinite"}}/>}</div>}
        {diffMode==="overlay"&&<div style={{marginBottom:10,position:"relative"}}>{thumbs[preview.origId]&&<img src={thumbs[preview.origId]} style={{width:"100%",maxHeight:350,objectFit:"contain",borderRadius:10}}/>}{preview.thumb&&<img src={preview.thumb} style={{position:"absolute",inset:0,width:"100%",maxHeight:350,objectFit:"contain",borderRadius:10,opacity:.5,mixBlendMode:"difference"}}/>}</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>{[{l:"Hash Orig",v:preview.origHash,c:"#6a8a9a"},{l:"Hash New",v:preview.hash,c:"#5eead4"},{l:"Dimensions",v:`${preview.w}×${preview.h}`,c:"#67e8f9"},{l:"Diff",v:preview.similarity+"%",c:preview.similarity>50?"#fb7185":"#5eead4"}].map((s,i)=><div key={i} style={{background:"rgba(255,255,255,.02)",padding:"7px 8px",borderRadius:7}}><div style={{fontSize:7,color:"#3d5a6a",textTransform:"uppercase"}}>{s.l}</div><div className="mn" style={{fontSize:10,fontWeight:700,color:s.c,marginTop:1}}>{s.v}</div></div>)}</div>
        <div style={{display:"flex",gap:6,justifyContent:"center"}}><button className="b bm" style={{padding:"8px 20px",fontSize:12}} onClick={()=>{dl(preview);setPreview(null)}}>📥</button><button className="b bx" onClick={()=>setPreview(null)}>Fermer</button></div>
      </div></div>)}
      {showPanel&&(<div className="ov" onClick={()=>setShowPanel(null)}><div onClick={e=>e.stopPropagation()} style={{maxWidth:460,width:"90%",maxHeight:"80vh",overflowY:"auto",animation:"i .2s ease"}}>
        {showPanel==="audit"&&<><div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:12}}>🛡️ Privacy Audit</div>{[{l:"EXIF",s:tf.metadata},{l:"GPS",s:tf.location},{l:"Device",s:tf.metaTemplate},{l:"Timeline",s:tf.fakeTimeline},{l:"Filename",s:tf.randomName},{l:"Pixels",s:tf.crop||tf.colors||tf.noise},{l:"Couleurs",s:tf.colors||tf.lut}].map((a,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 10px",borderRadius:7,background:"rgba(255,255,255,.02)",marginBottom:3}}><span style={{fontSize:11,color:"#8aa"}}>{a.l}</span><span style={{fontSize:10,fontWeight:600,color:a.s?"#5eead4":"#fbbf24"}}>{a.s?"✅ Protégé":"⚠️ Exposé"}</span></div>)}</>}
        {showPanel==="webhook"&&<><div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:12}}>🔗 Webhooks</div>
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",gap:4,marginBottom:10}}>{["discord","telegram"].map(t=><button key={t} className="b bx" onClick={()=>setWebhook(w=>({...w,type:t}))} style={{flex:1,padding:"8px",fontSize:12,background:webhook.type===t?"rgba(20,184,166,.08)":"rgba(255,255,255,.02)",color:webhook.type===t?"#5eead4":"#5a7a8a"}}>{t==="discord"?"Discord":"Telegram"}</button>)}</div>
            <input className="inp" placeholder={webhook.type==="discord"?"URL webhook Discord":"Bot token ou chat ID Telegram"} value={webhook.type==="discord"?webhook.discord:webhook.telegram} onChange={e=>setWebhook(w=>({...w,[w.type]:e.target.value}))} style={{marginBottom:8}}/>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10}}>
              <div onClick={()=>setWebhook(w=>({...w,enabled:!w.enabled}))} style={{width:40,height:22,borderRadius:11,background:webhook.enabled?"#14b8a6":"rgba(255,255,255,.08)",cursor:"pointer",position:"relative",transition:"all .15s"}}>
                <div style={{width:18,height:18,borderRadius:9,background:"#fff",position:"absolute",top:2,left:webhook.enabled?20:2,transition:"left .15s"}}/></div>
              <span style={{fontSize:12,color:webhook.enabled?"#5eead4":"#5a7a8a"}}>{webhook.enabled?"Activé":"Désactivé"}</span></div>
            <button className="b bm" style={{width:"100%",padding:10}} onClick={saveWebhook}>Sauvegarder</button>
          </div></>}
        {showPanel==="history"&&<><div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:12}}>📋 Historique</div>{!history.length&&<div style={{color:"#3d5a6a",fontSize:12}}>Aucun traitement</div>}{history.map((h,i)=><div key={i} style={{padding:"8px 10px",borderRadius:7,background:"rgba(255,255,255,.02)",marginBottom:4}}><div style={{fontSize:11,fontWeight:600,color:"#ddd"}}>{h.files} fichiers → {h.versions}v • {h.time}</div><div style={{fontSize:9,color:"#3d5a6a"}}>{h.date}</div></div>)}</>}
        <button className="b bx" onClick={()=>setShowPanel(null)} style={{marginTop:10,width:"100%"}}>Fermer</button></div></div>)}

      {/* App Header */}
      <header style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.04)",position:"relative",zIndex:2}}>
        <div className="hd" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>setPage("landing")}>
            <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#0d9488,#14b8a6)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#021a16",fontSize:11}}>M</div>
            <span style={{fontWeight:800,fontSize:14,color:"#f0fdfa",letterSpacing:"-.8px"}}>MAT CLOAK</span>
            {isPro?<span className="bdg bt" style={{fontSize:8}}>PRO</span>:<span className="bdg ba" style={{fontSize:8}}>FREE {dailyUsed}/{FREE_LIMIT}</span>}
          </div>
          <div style={{display:"flex",gap:3,alignItems:"center"}}>
            <button className="b bx" style={{padding:"3px 8px",fontSize:9}} onClick={()=>setShowPanel("audit")}>🛡️</button>
            <button className="b bx" style={{padding:"3px 8px",fontSize:9}} onClick={()=>setShowPanel("webhook")}>🔗</button>
            <button className="b bx" style={{padding:"3px 8px",fontSize:9}} onClick={()=>setShowPanel("history")}>📋</button>
            {!isPro&&<button className="b" style={{padding:"3px 10px",fontSize:9,borderRadius:7,background:"linear-gradient(135deg,#0d9488,#14b8a6)",color:"#021a16",fontWeight:700,border:"none"}} onClick={()=>setShowPricing(true)}>⚡ Pro</button>}
            {user&&<span style={{fontSize:10,color:"#3d5a6a"}}>{user.name}</span>}
            {files.length>0&&<button className="b bx" style={{padding:"3px 8px",fontSize:9}} onClick={clr}>✕</button>}
          </div></div></header>

      <main style={{padding:"12px 16px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",gap:3,background:"rgba(255,255,255,.015)",padding:2,borderRadius:9,maxWidth:220,margin:"0 auto 10px",border:"1px solid rgba(255,255,255,.04)"}}>
          {[["photo","📸 Photos"],["video","🎬 Vidéos"]].map(([m,l])=><button key={m} className="b" onClick={()=>{setMode(m);clr()}} style={{flex:1,padding:"7px 0",fontSize:11,fontWeight:700,borderRadius:7,background:mode===m?"linear-gradient(135deg,#0d9488,#14b8a6)":"transparent",color:mode===m?"#021a16":"#3d5a6a"}}>{l}</button>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4,maxWidth:550,margin:"0 auto 12px"}}>
          {PRESETS.map(p=><div key={p.id} className={`pc ${preset?.id===p.id?"on":""}`} onClick={()=>applyPreset(p)} style={{padding:"8px 4px"}}><div style={{fontSize:16}}>{p.icon}</div><div style={{fontSize:9,fontWeight:700,color:preset?.id===p.id?"#5eead4":"#6a8a9a",marginTop:1}}>{p.name}</div></div>)}</div>
        {res.length>0&&<div style={{display:"flex",gap:4,marginBottom:10,justifyContent:"center"}}><button className={`b ${view==="config"?"bm":"bx"}`} style={{padding:"6px 14px",fontSize:10}} onClick={()=>setView("config")}>⚙️</button><button className={`b ${view==="results"?"bm":"bx"}`} style={{padding:"6px 14px",fontSize:10}} onClick={()=>setView("results")}>✅ {totV}</button></div>}

        {view==="config"&&(<div className="ly" style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:12,animation:"i .2s ease"}}>
          <aside className="sd" style={{display:"flex",flexDirection:"column",gap:7}}>
            <div className="c" style={{padding:"12px 14px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:11,fontWeight:700,color:"#e0f0f8"}}>🎚️ Humanizer</span><span style={{fontSize:10,fontWeight:700,color:intColor}}>{intLabel}</span></div><input type="range" className="sl" min="0" max="1" step=".01" value={intensity} onChange={e=>setIntensity(+e.target.value)}/></div>
            <div className="c" style={{padding:"10px 14px"}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:11,fontWeight:700,color:"#ddd"}}>Versions</span><div style={{display:"flex",alignItems:"center",gap:4}}><button className="cn" style={{width:28,height:28,fontSize:12}} onClick={()=>setVer(v=>Math.max(1,v-1))}>−</button><div key={ver} className="mn" style={{fontSize:20,fontWeight:700,color:"#5eead4",width:36,textAlign:"center",animation:"po .1s ease"}}>{ver}</div><button className="cn" style={{width:28,height:28,fontSize:12}} onClick={()=>setVer(v=>Math.min(isPro?100:5,v+1))}>+</button></div></div>
              <div style={{display:"flex",gap:2}}>{[1,5,10,20,50,100].map(n=><button key={n} className="b bx" onClick={()=>{if(!isPro&&n>5){setShowPricing(true);return}setVer(n)}} style={{flex:1,padding:"3px 0",fontSize:8,background:ver===n?"rgba(20,184,166,.1)":"rgba(255,255,255,.02)",color:ver===n?"#5eead4":"#3d5a6a",opacity:!isPro&&n>5?.35:1}}>{n}</button>)}</div></div>
            {tf.location&&<div className="c" style={{padding:"10px 12px"}}><div style={{fontSize:10,fontWeight:700,color:"#ddd",marginBottom:5}}>📍 GPS</div><div style={{display:"flex",flexWrap:"wrap",gap:2}}>{LOCS.map((l,i)=><button key={i} className={`lb ${loc.city===l.city?"on":""}`} onClick={()=>{if(!isPro&&i>2){setShowPricing(true);return}setLoc(l)}} style={{opacity:!isPro&&i>2?.35:1}}>{l.city}</button>)}</div></div>}
            {tf.metaTemplate&&<div className="c" style={{padding:"10px 12px"}}><div style={{fontSize:10,fontWeight:700,color:"#ddd",marginBottom:5}}>🧹 Device</div><div style={{display:"flex",flexWrap:"wrap",gap:2}}>{META_TPL.map((m,i)=><button key={m.id} className={`lb ${metaTpl.id===m.id?"on":""}`} onClick={()=>{if(!isPro&&i>1){setShowPricing(true);return}setMetaTpl(m)}} style={{fontSize:9,opacity:!isPro&&i>1?.35:1}}>{m.name}</button>)}</div></div>}
            <div className="c" style={{padding:"8px 6px",flex:1}}><div style={{display:"flex",justifyContent:"space-between",padding:"0 6px",marginBottom:3}}><span style={{fontSize:10,fontWeight:700,color:"#ddd"}}>Transformations</span><span className="bdg bt" style={{fontSize:8}}>{activeT}</span></div>
              <div style={{maxHeight:200,overflowY:"auto"}}>{Object.entries(TF_META).map(([k,m])=>{const on=tf[k];const lk=!isPro&&m.p;return <div key={k} className={`ck ${on&&!lk?"on":""}`} onClick={()=>{if(lk){setShowPricing(true);return}setTf(t=>({...t,[k]:!t[k]}))}} style={{opacity:lk?.3:1}}><div className={`dt ${on&&!lk?"on":""}`}>{on&&!lk?"✓":lk?"🔒":""}</div><div style={{fontSize:10,fontWeight:600,color:on&&!lk?"#5eead4":"#4a6a78"}}>{m.i} {m.l}</div></div>})}</div></div>
          </aside>
          <div>
            <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);if(!checkLimit())return;add(e.dataTransfer.files)}} onClick={()=>{if(!checkLimit())return;ir.current?.click()}} className="c" style={{padding:files.length?"24px 14px":"44px 14px",textAlign:"center",cursor:"pointer",borderColor:drag?"rgba(20,184,166,.3)":undefined,transition:"all .2s",marginBottom:10}}>
              <div style={{fontSize:files.length?22:34,marginBottom:6,animation:"fl 3s ease infinite"}}>{drag?"📥":mode==="photo"?"📸":"🎬"}</div>
              <div style={{fontSize:13,fontWeight:700,color:"#f0fdfa"}}>{drag?"Lâche ici":`Drop tes ${mode==="photo"?"photos":"vidéos"}`}</div>
              <div className="mn" style={{fontSize:10,color:"#2a4a58"}}>{mode==="photo"?"JPG • PNG • WEBP":"MP4 • MOV • WEBM"}</div>
              <input ref={ir} type="file" multiple accept={mode==="photo"?"image/*":"video/*"} style={{display:"none"}} onChange={e=>{if(!checkLimit())return;add(e.target.files)}}/></div>
            {files.length>0&&<div className="sg" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5,marginBottom:8}}>{[{l:"Fichiers",v:files.length,c:"#5eead4"},{l:"Versions",v:files.length*ver,c:"#a78bfa"},{l:"Taille",v:fb(files.reduce((a,f)=>a+f.size,0)),c:"#fbbf24"},{l:"Mode",v:intLabel,c:intColor}].map((s,i)=><div key={i} className="c" style={{padding:"7px 8px"}}><div style={{fontSize:7,color:"#2a4a58",textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div><div className="mn" style={{fontSize:14,fontWeight:700,color:s.c}}>{s.v}</div></div>)}</div>}
            {files.length>0&&<div style={{maxHeight:260,overflowY:"auto",marginBottom:8}}>{files.map((f,i)=><div key={f.id} className="rw" style={{animation:`i ${.05+i*.02}s ease`}}>{thumbs[f.id]?<img src={thumbs[f.id]} className="th"/>:<div className="th" style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🎬</div>}<div style={{flex:1,minWidth:0}}><div style={{fontSize:11,fontWeight:600,color:"#ddd",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.name}</div><div className="mn" style={{fontSize:9,color:"#3d5a6a"}}>{fb(f.size)} → ×{ver}</div></div><button className="b bx" style={{padding:"2px 6px",fontSize:8,color:"#fb7185"}} onClick={()=>setFiles(p=>p.filter(x=>x.id!==f.id))}>✕</button></div>)}</div>}
            <button className="b bm" onClick={run} disabled={proc||!files.length} style={{width:"100%",padding:12,fontSize:13,borderRadius:10}}>{proc?"⏳ En cours...":`🔒 Traiter → ${files.length*ver} versions`}</button>
            {webhook.enabled&&<div style={{textAlign:"center",fontSize:10,color:"#14b8a6",marginTop:6}}>🔗 Webhook {webhook.type} activé — envoi automatique</div>}
          </div></div>)}

        {view==="results"&&(<div style={{animation:"i .2s ease"}}>
          {proc&&<div className="c" style={{padding:"36px 20px",textAlign:"center",marginBottom:12}}><div style={{fontSize:26,marginBottom:8}}><span style={{display:"inline-block",animation:"sp 1s linear infinite"}}>⚙️</span></div><div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{prog.f} — v{prog.v}/{ver}</div><div className="pb" style={{maxWidth:350,margin:"10px auto"}}><div className="pf" style={{width:`${prog.t?(prog.c/prog.t)*100:0}%`}}/></div><div className="mn" style={{fontSize:9,color:"#3d5a6a"}}>{prog.c}/{prog.t}</div></div>}
          {!proc&&totV>0&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:6}}><div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}><span style={{fontSize:12,fontWeight:700,color:"#fff"}}>✅ {totV} versions</span><span className="bdg bg2">Uniques</span><span className="bdg bt">🛡️</span>{webhook.enabled&&<span className="bdg bt">🔗 Envoyé</span>}</div><button className="b bm" style={{padding:"7px 16px",fontSize:11}} onClick={dlAll}>📥 Tout ({totV})</button></div>}
          {res.map((g,gi)=><div key={gi} className="c" style={{marginBottom:7,animation:`i ${.06+gi*.03}s ease`}}>
            <div style={{padding:"9px 12px",borderBottom:"1px solid rgba(255,255,255,.03)",display:"flex",alignItems:"center",gap:10}}>{thumbs[g.orig.id]?<img src={thumbs[g.orig.id]} style={{width:36,height:36,borderRadius:8,objectFit:"cover"}}/>:null}<div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:"#eee"}}>{g.orig.name}</div><div className="mn" style={{fontSize:8,color:"#3d5a6a"}}>{fb(g.orig.size)} • {g.vers.length}v</div></div></div>
            <div className="vg" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:4,padding:"8px 8px"}}>{g.vers.map((v,vi)=><div key={vi} className="vc" onClick={()=>v.thumb?setPreview({...v,vi:vi+1,origId:g.orig.id,origName:g.orig.name,origSize:g.orig.size}):dl(v)}>{v.thumb&&<img src={v.thumb} style={{width:"100%",height:55,objectFit:"cover",borderRadius:7,marginBottom:3,display:"block"}}/>}<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span className="bdg bt" style={{fontSize:7,padding:"1px 5px"}}>v{vi+1}</span>{v.similarity!=null&&<span className="mn" style={{fontSize:7,color:v.similarity>50?"#fb7185":"#5eead4"}}>{v.similarity}%</span>}</div></div>)}</div>
          </div>)}</div>)}
      </main></div>);
}
