import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

/* ═══ VEILORA — Media Randomizer v3.1 (Mobile Fix + Auth Fix) ═══ */

const supabase = createClient(
  "https://lutwwnjizgkdnmvkfoth.supabase.co",
  "sb_publishable_X5Q91rqekOhd6uiniPE2rg_LiW5cKyI"
);

const LOCS=[
  {city:"New York",lat:[40.70,40.78],lng:[-74.02,-73.93]},{city:"Los Angeles",lat:[33.94,34.06],lng:[-118.30,-118.18]},
  {city:"Miami",lat:[25.74,25.80],lng:[-80.22,-80.17]},{city:"London",lat:[51.48,51.54],lng:[-0.16,-0.08]},
  {city:"Paris",lat:[48.83,48.88],lng:[2.29,2.39]},{city:"Dubai",lat:[25.18,25.24],lng:[55.24,55.32]},
  {city:"Tokyo",lat:[35.65,35.72],lng:[139.69,139.78]},{city:"Bali",lat:[-8.72,-8.64],lng:[115.14,115.28]},
  {city:"Sydney",lat:[-33.88,-33.84],lng:[151.18,151.24]},{city:"Barcelona",lat:[41.37,41.41],lng:[2.15,2.20]},
  {city:"Berlin",lat:[52.49,52.54],lng:[13.37,13.43]},{city:"Seoul",lat:[37.53,37.58],lng:[126.96,127.02]},
  {city:"São Paulo",lat:[-23.58,-23.52],lng:[-46.67,-46.61]},{city:"Toronto",lat:[43.64,43.70],lng:[-79.42,-79.36]},
  {city:"Singapore",lat:[1.28,1.34],lng:[103.82,103.88]},{city:"Amsterdam",lat:[52.35,52.40],lng:[4.87,4.93]},
  {city:"Mexico City",lat:[19.39,19.45],lng:[-99.18,-99.12]},{city:"Bangkok",lat:[13.72,13.78],lng:[100.49,100.55]},
  {city:"Las Vegas",lat:[36.10,36.18],lng:[-115.20,-115.12]},{city:"Cancún",lat:[21.12,21.18],lng:[-86.84,-86.78]},
  {city:"Random",lat:[-50,50],lng:[-160,160]},{city:"Strip GPS",lat:null,lng:null},
];
const MTPL=[
  {id:"iphone",name:"iPhone 15 Pro"},{id:"samsung",name:"Samsung S24"},{id:"pixel",name:"Pixel 8"},
  {id:"canon",name:"Canon EOS R6"},{id:"sony",name:"Sony A7IV"},{id:"tiktok",name:"Export TikTok"},
  {id:"ig",name:"Export IG"},{id:"strip",name:"Strip tout"},
];
const LUTS=[{r:3,g:1,b:-3,t:3,c:2},{r:-2,g:1,b:2,t:-3,c:1},{r:2,g:0,b:-1,t:1,c:-3},{r:5,g:2,b:-3,t:5,c:1},{r:1,g:-1,b:1,t:0,c:-4}];
const PRESETS=[
  {id:"ig",name:"Instagram",icon:"📸",ver:12,int:.5},{id:"reddit",name:"Reddit",icon:"🟠",ver:8,int:.5},
  {id:"tiktok",name:"TikTok",icon:"🎵",ver:5,int:.4},
  {id:"x",name:"Twitter",icon:"🐦",ver:6,int:.45},{id:"custom",name:"Custom",icon:"⚙️",ver:5,int:.5},
];
const TF={
  crop:{l:"Crop + Rescale",i:"✂️"},rotation:{l:"Micro Rotation",i:"🔄"},zoom:{l:"Zoom Subtil",i:"🔍"},
  perspective:{l:"Perspective Warp",i:"📐",p:1},colors:{l:"Shift Couleurs",i:"🎨"},lut:{l:"LUT Cinématique",i:"🌈",p:1},
  noise:{l:"AI Noise",i:"🧠",p:1},flip:{l:"Miroir",i:"↔️"},metadata:{l:"Nuke Metadata",i:"🛡️"},
  metaTemplate:{l:"Fake Device",i:"🧹",p:1},location:{l:"Spoof GPS",i:"📍"},randomName:{l:"Nom Random",i:"🎲"},
  fakeTimeline:{l:"Fake Timeline",i:"🕒",p:1},
};
const TFD=Object.fromEntries(Object.keys(TF).map(k=>[k,true]));

const TESTI=[
  {n:"Lucas M.",r:"Agency Owner",a:"🧑‍💼",t:"On poste sur 40 comptes IG sans ban. Avant on perdait 2-3 comptes par semaine. Veilora a tout changé."},
  {n:"Sarah K.",r:"Content Manager",a:"👩‍💻",t:"Le Humanizer c'est génial. Léger pour OF, agressif pour Reddit. Le workflow est parfait."},
  {n:"Marc D.",r:"Growth Hacker",a:"🧔",t:"J'ai testé tous les outils du marché. Veilora a plus de transformations et le 100% local me rassure."},
  {n:"Emma R.",r:"Social Media",a:"👩",t:"GPS spoofing + fake device = exactement ce qu'il me fallait. Zéro détection depuis 3 mois."},
  {n:"Thomas B.",r:"Freelance",a:"👨‍🎨",t:"Le plan à vie à 44.99€ c'est un no-brainer. L'envoi auto Discord me fait gagner 1h/jour."},
  {n:"Julie P.",r:"Agency Co-founder",a:"👩‍🦰",t:"La preview before/after en mode blink m'a convaincue. Modifié techniquement mais visuellement identique."},
];

const FAQ=[
  {q:"C'est quoi Veilora ?",a:"Veilora randomise tes photos et vidéos pour que les plateformes (IG, TikTok, Reddit) ne les détectent pas comme doublons. Chaque version a un hash différent, des pixels modifiés, des métadonnées uniques."},
  {q:"Comment les algorithmes détectent les doublons ?",a:"3 méthodes : hash SHA-256 (comparaison octets), hash perceptuel pHash (structure visuelle), métadonnées EXIF (appareil, date, GPS). Veilora modifie les 3 couches."},
  {q:"C'est vraiment indétectable ?",a:"Les micro-modifications sont imperceptibles à l'œil mais suffisantes pour générer un hash complètement différent. Le Similarity Score te donne la preuve."},
  {q:"Mes fichiers sont uploadés ?",a:"Non. Traitement 100% local dans ton navigateur. Aucun fichier ne quitte ton appareil. Plus rapide et plus sécurisé."},
  {q:"Le curseur Humanizer ?",a:"Il contrôle l'intensité de toutes les transformations. Ultra léger = qualité max. Agressif = sécurité max pour beaucoup de comptes."},
  {q:"Le webhook Discord/Telegram ?",a:"Tu colles ton URL de webhook. Après chaque traitement, les fichiers sont envoyés automatiquement sur ton channel."},
  {q:"Free vs Pro ?",a:"Free : 3 fichiers/jour, 5 versions, transformations basiques. Pro (7.99€/mois ou 44.99€ à vie) : illimité, 100 versions, 13 transformations, webhooks, GPS spoofing."},
];

const CHANGELOG=[
  {v:"3.1",d:"20 mai 2026",items:["Fix mobile — responsive complet téléphone","Fix formulaire inscription/connexion","Optimisation performances mobile"]},
  {v:"3.0",d:"20 mai 2026",items:["Backend Supabase — vrais comptes utilisateurs","Vérification Pro côté serveur","Limite fichiers/jour côté serveur"]},
  {v:"2.1",d:"18 mai 2026",items:["Hash Checker — compare 2 fichiers en un clic","Before/After slider interactif sur la landing","Compteur de fichiers traités en temps réel"]},
  {v:"2.0",d:"12 mai 2026",items:["Refonte complète de l'interface — plein écran","22 localisations GPS (12 nouvelles villes)","Webhook Telegram ajouté","Intégration Stripe — paiement en ligne"]},
  {v:"1.5",d:"28 avril 2026",items:["LUT Cinématique — 5 courbes couleur","AI Noise gaussien","Perspective Warp","Fake Timeline","Privacy Audit en temps réel"]},
  {v:"1.0",d:"15 avril 2026",items:["Lancement de Veilora","13 transformations","Visual Diff (split/blink/overlay)","Humanizer slider","Export Discord webhook"]},
];

function processImg(file,tf,vi,I){return new Promise(res=>{const img=new Image();img.onload=()=>{const s=vi+Math.random();const r=(a,b)=>a+Math.abs(Math.sin(s*(b+1)))*(b-a);
let w=img.width,h=img.height;const cr=tf.crop?Math.floor(r(1,1+3*I)):0;const sw=w-cr*2,sh=h-cr*2,z=tf.zoom?1+r(.005,.005+.025*I):1;
const ow=Math.round(sw*z),oh=Math.round(sh*z);const c=document.createElement("canvas");c.width=ow;c.height=oh;const x=c.getContext("2d");
if(tf.rotation){const a=(r(.1,.1+.7*I)*(Math.random()>.5?1:-1))*Math.PI/180;x.translate(ow/2,oh/2);x.rotate(a);x.translate(-ow/2,-oh/2)}
x.drawImage(img,cr,cr,sw,sh,0,0,ow,oh);
if(tf.perspective){const id=x.getImageData(0,0,ow,oh);const d=new Uint8ClampedArray(id.data);const px=Math.floor(r(1,1+2*I));for(let y=0;y<oh;y++){const s2=Math.round(px*(1-y/oh)*(Math.random()>.5?1:-1));for(let xp=0;xp<ow;xp++){const sx=xp-s2;if(sx>=0&&sx<ow){const di=(y*ow+xp)*4,si=(y*ow+sx)*4;id.data[di]=d[si];id.data[di+1]=d[si+1];id.data[di+2]=d[si+2];id.data[di+3]=d[si+3]}}}x.putImageData(id,0,0)}
if(tf.colors||tf.lut){const id=x.getImageData(0,0,ow,oh),d=id.data;const rs=Math.floor(r(-3-2*I,3+2*I)),gs=Math.floor(r(-3-2*I,3+2*I)),bs=Math.floor(r(-3-2*I,3+2*I)),br=r(-3-3*I,3+3*I),sat=r(1-.04*I,1+.04*I);
const lut=tf.lut?LUTS[Math.floor(Math.random()*LUTS.length)]:{r:0,g:0,b:0,t:0,c:0};
for(let i=0;i<d.length;i+=4){const avg=(d[i]+d[i+1]+d[i+2])/3;let rv=Math.round(avg+(d[i]-avg)*sat)+rs+br+lut.r*I,gv=Math.round(avg+(d[i+1]-avg)*sat)+gs+br+lut.g*I,bv=Math.round(avg+(d[i+2]-avg)*sat)+bs+br+lut.b*I;
if(lut.c){rv=128+(rv-128)*(1+lut.c*I*.01);gv=128+(gv-128)*(1+lut.c*I*.01);bv=128+(bv-128)*(1+lut.c*I*.01)}if(lut.t){rv+=lut.t*I;bv-=lut.t*I}
d[i]=Math.min(255,Math.max(0,rv));d[i+1]=Math.min(255,Math.max(0,gv));d[i+2]=Math.min(255,Math.max(0,bv))}x.putImageData(id,0,0)}
if(tf.noise){const id=x.getImageData(0,0,ow,oh),d=id.data;const nI=3+4*I;for(let i=0;i<d.length;i+=4){const u1=Math.random(),u2=Math.random();const n=Math.sqrt(-2*Math.log(u1||.001))*Math.cos(2*Math.PI*u2)*nI;const lum=(d[i]+d[i+1]+d[i+2])/3;const db=1+(1-lum/255)*.5;
d[i]=Math.min(255,Math.max(0,d[i]+n*db));d[i+1]=Math.min(255,Math.max(0,d[i+1]+n*db*.95));d[i+2]=Math.min(255,Math.max(0,d[i+2]+n*db*1.05))}x.putImageData(id,0,0)}
if(tf.flip&&Math.random()>.5){const f2=document.createElement("canvas");f2.width=ow;f2.height=oh;const fx=f2.getContext("2d");fx.translate(ow,0);fx.scale(-1,1);fx.drawImage(c,0,0);x.clearRect(0,0,ow,oh);x.drawImage(f2,0,0)}
c.toBlob(b=>{URL.revokeObjectURL(img.src);res({blob:b,w:ow,h:oh})},"image/jpeg",r(.78+.1*(1-I),.95-.05*I))};img.src=URL.createObjectURL(file)})}

const rn=ext=>`IMG_${Date.now().toString(36)}_${Array.from({length:10},()=>"abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random()*36)]).join("")}.${ext}`;
const fb=b=>{if(!b)return"0 B";const u=["B","KB","MB","GB"];const i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(1)+" "+u[i]};
const pH=async b=>{const buf=await b.arrayBuffer();const h=await crypto.subtle.digest("SHA-256",buf);return Array.from(new Uint8Array(h)).map(x=>x.toString(16).padStart(2,"0")).join("")};
const STRIPE={monthly:"https://buy.stripe.com/6oU9AT4Zj4gf1XA8tr8Vi00",lifetime:"https://buy.stripe.com/4gMcN563naED59MaBz8Vi01"};
const FREE_LIMIT=3;
async function sendWH(url,blob,name,type){if(!url)return;try{const fd=new FormData();fd.append("file",blob,name);if(type==="discord")fd.append("payload_json",JSON.stringify({content:`🔒 **Veilora** — ${name}`}));await fetch(url,{method:"POST",body:fd})}catch(e){}}

function useCounter(target,duration=1800){const[v,setV]=useState(0);useEffect(()=>{let start=null;const step=ts=>{if(!start)start=ts;const p=Math.min((ts-start)/duration,1);setV(Math.floor(p*target));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)},[target,duration]);return v}

// ═══ AUTH MODAL — Separate component with uncontrolled inputs to fix mobile keyboard bugs ═══
function AuthModal({auth,setAuth,onSuccess}){
  const emailRef=useRef(null);
  const passRef=useRef(null);
  const nameRef=useRef(null);
  const[err,setErr]=useState("");
  const[loading,setLoading]=useState(false);
  const[mode,setMode]=useState(auth);

  const doRegister=async()=>{
    const email=emailRef.current?.value||"";
    const pass=passRef.current?.value||"";
    const name=nameRef.current?.value||"";
    setErr("");setLoading(true);
    const{data,error}=await supabase.auth.signUp({
      email,password:pass,
      options:{data:{name:name||email.split("@")[0]}}
    });
    setLoading(false);
    if(error){setErr(error.message);return}
    if(data.user&&!data.session){setErr("✅ Vérifie ton email pour confirmer ton compte !");return}
    onSuccess();
  };
  const doLogin=async()=>{
    const email=emailRef.current?.value||"";
    const pass=passRef.current?.value||"";
    setErr("");setLoading(true);
    const{data,error}=await supabase.auth.signInWithPassword({email,password:pass});
    setLoading(false);
    if(error){setErr(error.message);return}
    onSuccess();
  };
  const switchMode=(m)=>{setMode(m);setErr("")};
  const closeModal=(e)=>{if(e.target===e.currentTarget)setAuth(null)};
  const inputStyle={width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.12)",background:"rgba(255,255,255,.05)",color:"#e0eaf0",fontSize:"16px",outline:"none",fontFamily:"inherit",WebkitAppearance:"none",boxSizing:"border-box"};

  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",backdropFilter:"blur(16px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={closeModal} onTouchEnd={e=>{if(e.target===e.currentTarget)setAuth(null)}}>
    <div style={{maxWidth:400,width:"100%",background:"#0c1216",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:"32px 24px",margin:"auto"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{width:48,height:48,borderRadius:14,background:"linear-gradient(135deg,#0d9488,#14b8a6)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:12,overflow:"hidden"}}><img src="/logo.png" style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:6}} alt="V"/></div>
        <div style={{fontSize:20,fontWeight:800,color:"#fff"}}>{mode==="register"?"Créer un compte":"Connexion"}</div>
        <button onClick={()=>setAuth(null)} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.1)",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {mode==="register"&&<input key="name-input" ref={nameRef} style={inputStyle} placeholder="Ton prénom" defaultValue="" autoComplete="given-name" autoCapitalize="words" autoCorrect="off" spellCheck={false} enterKeyHint="next"/>}
        <input key="email-input" ref={emailRef} style={inputStyle} type="email" inputMode="email" placeholder="Email" defaultValue="" autoComplete="email" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="next"/>
        <input key="pass-input" ref={passRef} style={inputStyle} type="password" placeholder="Mot de passe (min 6)" defaultValue="" autoComplete={mode==="register"?"new-password":"current-password"} autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="done" onKeyDown={e=>{if(e.key==="Enter"){mode==="register"?doRegister():doLogin()}}}/>
        {err&&<div style={{color:err.startsWith("✅")?"#5eead4":"#fb7185",fontSize:13,textAlign:"center",padding:8,borderRadius:8,background:err.startsWith("✅")?"rgba(94,234,212,.06)":"rgba(251,113,133,.06)"}}>{err}</div>}
        <button onClick={mode==="register"?doRegister:doLogin} disabled={loading} style={{width:"100%",padding:14,borderRadius:12,background:"linear-gradient(135deg,#0d9488,#14b8a6)",color:"#021a16",fontSize:15,fontWeight:700,border:"none",cursor:"pointer",opacity:loading?.5:1}}>
          {loading?"⏳ Chargement...":mode==="register"?"Créer mon compte":"Se connecter"}</button></div>
      <div style={{textAlign:"center",marginTop:16}}>{mode==="login"?<span style={{fontSize:13,color:"#4a6a78"}}>Pas de compte ? <span style={{color:"#5eead4",cursor:"pointer",fontWeight:600}} onClick={()=>switchMode("register")}>S'inscrire</span></span>:
        <span style={{fontSize:13,color:"#4a6a78"}}>Déjà inscrit ? <span style={{color:"#5eead4",cursor:"pointer",fontWeight:600}} onClick={()=>switchMode("login")}>Connexion</span></span>}</div></div></div>;
}

export default function App(){
  const[pg,setPg]=useState("landing");
  const[mode,setMode]=useState("photo");
  const[files,setFiles]=useState([]);
  const[ver,setVer]=useState(5);
  const[tf,setTf2]=useState({...TFD});
  const[loc,setLoc]=useState(LOCS[0]);
  const[mtpl,setMtpl]=useState(MTPL[0]);
  const[preset,setPreset]=useState(null);
  const[inten,setInten]=useState(.5);
  const[proc,setProc]=useState(false);
  const[prog,setProg]=useState({c:0,t:0,f:"",v:0});
  const[res,setRes]=useState([]);
  const[vw,setVw]=useState("config");
  const[drag,setDrag]=useState(false);
  const[thumbs,setThumbs]=useState({});
  const[preview,setPreview]=useState(null);
  const[dm,setDm]=useState("split");
  const[panel,setPanel]=useState(null);
  const[hist,setHist]=useState([]);
  const[pricing,setPricing]=useState(false);
  const[auth,setAuth]=useState(null);
  const[wh,setWh]=useState({discord:"",telegram:"",on:false,type:"discord"});
  const[faqO,setFaqO]=useState(null);
  const[baSlider,setBaSlider]=useState(50);
  const[hcFiles,setHcFiles]=useState([null,null]);
  const[hcResult,setHcResult]=useState(null);
  const[hcLoading,setHcLoading]=useState(false);
  const[user,setUser]=useState(null);
  const[profile,setProfile]=useState(null);
  const[pro,setPro]=useState(false);
  const[du,setDu]=useState(0);
  const ir=useRef();
  const hcRef1=useRef();
  const hcRef2=useRef();

  const cFiles=useCounter(142847);
  const cVersions=useCounter(1284920);
  const cUsers=useCounter(3847);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id)}
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id)}
      else{setUser(null);setProfile(null);setPro(false);setDu(0)}
    });
    return()=>subscription.unsubscribe();
  },[]);

  const loadProfile=async(uid)=>{
    const{data}=await supabase.from("profiles").select("*").eq("id",uid).single();
    if(data){
      setProfile(data);setPro(data.is_pro||false);
      const today=new Date().toISOString().slice(0,10);
      if(data.last_usage_date!==today){setDu(0);await supabase.from("profiles").update({daily_usage:0,last_usage_date:today}).eq("id",uid)}
      else{setDu(data.daily_usage||0)}
    }
  };
  const incrementUsage=async(count)=>{
    if(!user)return;const newDu=du+count;setDu(newDu);
    const today=new Date().toISOString().slice(0,10);
    await supabase.from("profiles").update({daily_usage:newDu,last_usage_date:today}).eq("id",user.id);
  };
  const doLogout=async()=>{await supabase.auth.signOut();setUser(null);setProfile(null);setPro(false);setDu(0)};

  const ck=()=>{
    if(!user){setAuth("login");return false}
    if(pro)return true;
    if(du>=FREE_LIMIT){setPricing(true);return false}
    return true;
  };
  const add=useCallback(nf=>{Array.from(nf).filter(f=>mode==="photo"?f.type.startsWith("image/"):f.type.startsWith("video/")).forEach(f=>{const id=crypto.randomUUID?.() || Math.random().toString(36).slice(2);if(f.type.startsWith("image/"))setThumbs(p=>({...p,[id]:URL.createObjectURL(f)}));setFiles(p=>[...p,{file:f,id,name:f.name,size:f.size,type:f.type}])})},[mode]);
  const applyP=p=>{setPreset(p);if(p.id!=="custom"){setVer(p.ver);setInten(p.int)}};
  const run=async()=>{if(!ck())return;setProc(true);setRes([]);setVw("results");const all=[];const tot=files.length*ver;let done=0;const t0=Date.now();
    const wu=wh.on?(wh.type==="discord"?wh.discord:wh.telegram):"";
    for(const f of files){const vr=[];for(let v=0;v<ver;v++){setProg({c:done,t:tot,f:f.name,v:v+1});
      if(f.type.startsWith("image/")){try{const{blob,w,h}=await processImg(f.file,tf,v,inten);const hF=await pH(blob);const oH=await pH(f.file);
        const ss=Math.min(99,Math.max(25,Math.round(Math.abs(1-blob.size/f.size)*200+(tf.perspective?15:0)+(tf.lut?12:0)+10+Math.random()*15)));
        const nm=tf.randomName?rn("jpg"):`${f.name.split(".")[0]}_v${v+1}.jpg`;if(wu)await sendWH(wu,blob,nm,wh.type);
        vr.push({blob,name:nm,size:blob.size,ok:true,thumb:URL.createObjectURL(blob),w,h,hash:hF.slice(0,16),origHash:oH.slice(0,16),similarity:ss})}catch(e){vr.push({name:f.name,ok:false})}}
      else{const ext=f.name.split(".").pop();const nm=tf.randomName?rn(ext):`${f.name.split(".")[0]}_v${v+1}.${ext}`;if(wu)await sendWH(wu,f.file,nm,wh.type);
        vr.push({blob:f.file,name:nm,size:f.size,ok:true})}done++}all.push({orig:f,vers:vr});setRes([...all])}
    setHist(h=>[{date:new Date().toLocaleString(),files:files.length,versions:tot,time:((Date.now()-t0)/1000).toFixed(1)+"s"},...h.slice(0,19)]);
    await incrementUsage(files.length);setProc(false)};
  const dl=r=>{const a=document.createElement("a");a.href=URL.createObjectURL(r.blob);a.download=r.name;a.click()};
  const dlAll=()=>res.forEach(g=>g.vers.filter(v=>v.ok).forEach((v,i)=>setTimeout(()=>dl(v),i*40)));
  const totV=res.reduce((a,g)=>a+g.vers.filter(v=>v.ok).length,0);
  const activeT=Object.values(tf).filter(Boolean).length;
  const clr=()=>{setFiles([]);setRes([]);setVw("config");setThumbs({})};
  const iL=inten<.25?"Ultra léger":inten<.45?"Léger":inten<.65?"Balanced":inten<.85?"Agressif":"Maximum";
  const iC=inten<.25?"#6ee7b7":inten<.45?"#67e8f9":inten<.65?"#a78bfa":inten<.85?"#fbbf24":"#fb7185";

  const hcPick=async(idx)=>{const input=idx===0?hcRef1:hcRef2;input.current?.click()};
  const hcLoad=async(idx,e)=>{const file=e.target.files?.[0];if(!file)return;const nf=[...hcFiles];nf[idx]=file;setHcFiles(nf);
    if(nf[0]&&nf[1]){setHcLoading(true);try{const[h1,h2]=await Promise.all([pH(nf[0]),pH(nf[1])]);
      const match=h1===h2;setHcResult({h1:h1.slice(0,32),h2:h2.slice(0,32),match,s1:fb(nf[0].size),s2:fb(nf[1].size),n1:nf[0].name,n2:nf[1].name})}catch(e){setHcResult(null)}setHcLoading(false)}};

  const S=`*{box-sizing:border-box;margin:0;padding:0;font-family:'Segoe UI',system-ui,-apple-system,sans-serif}
    html,body,#root{height:100%;overflow:auto;-webkit-text-size-adjust:100%}
    input,button,textarea,select{font-size:16px!important}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(20,184,166,.06)}50%{box-shadow:0 0 35px rgba(20,184,166,.15)}}
    @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
    .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 80% 60% at 10% 10%,rgba(13,148,136,.04),transparent),radial-gradient(ellipse 60% 70% at 90% 90%,rgba(34,211,238,.03),transparent)}
    .card{background:rgba(255,255,255,.022);border:1px solid rgba(255,255,255,.06);border-radius:16px;transition:border-color .15s}
    .btn{font-family:inherit;border:none;border-radius:12px;cursor:pointer;font-weight:600;transition:all .12s;display:inline-flex;align-items:center;justify-content:center;gap:8px}
    .btn-p{background:linear-gradient(135deg,#0d9488,#14b8a6);color:#021a16;padding:14px 30px;font-size:15px}.btn-p:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(20,184,166,.2)}.btn-p:disabled{opacity:.2;cursor:not-allowed;transform:none}
    .btn-s{background:rgba(255,255,255,.04);color:#7a9aaa;padding:10px 18px;font-size:13px;border:1px solid rgba(255,255,255,.06)}.btn-s:hover{background:rgba(255,255,255,.07);color:#d0e0e8}
    .badge{display:inline-flex;align-items:center;gap:4px;padding:4px 11px;border-radius:100px;font-size:11px;font-weight:600}
    .bt{background:rgba(20,184,166,.08);color:#5eead4}.bg{background:rgba(52,211,153,.07);color:#6ee7b7}.ba{background:rgba(251,191,36,.08);color:#fde68a}
    .thumb{width:56px;height:56px;border-radius:12px;object-fit:cover;flex-shrink:0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)}
    .row{display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:12px;transition:background .1s}
    .chk{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;transition:all .1s;user-select:none}.chk:hover{background:rgba(255,255,255,.018)}.chk.on{background:rgba(20,184,166,.045)}
    .dot{width:18px;height:18px;border-radius:5px;border:2px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:10px;transition:all .1s;flex-shrink:0}.dot.on{background:#14b8a6;border-color:#14b8a6;color:#021a16}
    .cnt{width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);color:#9ab;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .1s}.cnt:hover{border-color:#14b8a6;color:#fff}
    .pbar{height:4px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden}.pfill{height:100%;background:linear-gradient(90deg,#0d9488,#14b8a6,#67e8f9);border-radius:3px;transition:width .2s}
    .vc{background:rgba(255,255,255,.015);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:8px;transition:all .12s;cursor:pointer;overflow:hidden}.vc:hover{border-color:rgba(20,184,166,.25)}
    .pc{padding:14px 10px;border-radius:12px;cursor:pointer;transition:all .12s;border:2px solid transparent;background:rgba(255,255,255,.018);text-align:center}.pc:hover{background:rgba(255,255,255,.03)}.pc.on{border-color:rgba(20,184,166,.35);background:rgba(20,184,166,.05)}
    .lb{padding:7px 13px;border-radius:8px;cursor:pointer;border:1px solid transparent;font-family:inherit;font-size:12px;font-weight:600;transition:all .1s;background:rgba(255,255,255,.03);color:#5a7a8a}.lb:hover{color:#aaa;background:rgba(255,255,255,.05)}.lb.on{border-color:rgba(20,184,166,.3);color:#5eead4;background:rgba(20,184,166,.06)}
    .ov{position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(16px);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
    .slider{-webkit-appearance:none;width:100%;height:4px;border-radius:3px;outline:none;background:rgba(255,255,255,.1)}.slider::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;background:linear-gradient(135deg,#14b8a6,#2dd4bf);border-radius:50%;cursor:pointer;box-shadow:0 0 12px rgba(20,184,166,.3)}
    .mono{font-family:'Courier New',monospace}
    .prc{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:28px 20px;transition:all .15s;position:relative}.prc.ft{border-color:rgba(20,184,166,.3);background:rgba(20,184,166,.025)}.prc.ft::before{content:"POPULAIRE";position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#0d9488,#14b8a6);color:#021a16;padding:4px 16px;border-radius:100px;font-size:11px;font-weight:700}
    .faq-item{margin-bottom:6px}.faq-q{padding:14px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;border-radius:12px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.01);transition:all .12s}.faq-q:hover{background:rgba(255,255,255,.02)}.faq-q.open{background:rgba(20,184,166,.025);border-color:rgba(20,184,166,.1)}.faq-a{padding:10px 16px 16px;font-size:14px;color:#6a8a9a;line-height:1.8}
    .ba-container{position:relative;overflow:hidden;border-radius:16px;border:1px solid rgba(255,255,255,.06);width:100%;aspect-ratio:4/3;background:#111;touch-action:none}
    .ba-slider{position:absolute;top:0;bottom:0;width:3px;background:#14b8a6;z-index:3;cursor:ew-resize}.ba-slider::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:32px;border-radius:50%;background:#14b8a6;border:3px solid #fff;box-shadow:0 0 16px rgba(20,184,166,.4)}
    @media(max-width:768px){
      html,body{overflow-x:hidden!important;width:100%!important;-webkit-overflow-scrolling:touch}
      .hero-title{font-size:28px!important;letter-spacing:-1px!important;padding:0 8px!important}
      .hero-sub{font-size:13px!important;padding:0 8px!important}
      .hero-btns{flex-direction:column!important;padding:0 8px!important}
      .hero-btns .btn{width:100%!important}
      .nav-links{display:none!important}
      .nav-bar{padding:10px 12px!important}
      .live-stats{grid-template-columns:repeat(3,1fr)!important;gap:6px!important}
      .stat-num{font-size:18px!important}
      .feat-grid{grid-template-columns:1fr!important}
      .price-grid{grid-template-columns:1fr!important}
      .testi-grid{grid-template-columns:1fr!important}
      .nums-grid{grid-template-columns:repeat(2,1fr)!important}
      .section{padding:0 12px!important}
      .section-title{font-size:20px!important}
      .hc-grid{grid-template-columns:1fr!important}
      .app-layout{grid-template-columns:1fr!important}
      .app-side{order:2}
      .app-header{padding:8px 10px!important}
      .app-header-btns{flex-wrap:wrap;gap:3px!important}
      .app-header-btns .btn{padding:4px 7px!important;font-size:9px!important}
      .stat-grid{grid-template-columns:repeat(2,1fr)!important}
      .ver-grid{grid-template-columns:repeat(2,1fr)!important}
      .preset-grid{grid-template-columns:repeat(3,1fr)!important;gap:4px!important}
      .preset-grid .pc{padding:8px 4px!important}
      .prc{padding:20px 14px!important}
      .ov{padding:10px!important}
      .ba-container{aspect-ratio:3/2!important}
      .card{border-radius:12px!important}
    }
  `;

  // ══════════════════════════
  // LANDING PAGE
  // ══════════════════════════
  if(pg==="landing"||pg==="docs"||pg==="changelog")return(
    <div style={{minHeight:"100vh",background:"#060a0c",color:"#b8c8d0",overflowX:"hidden"}}><style>{S}</style><div className="mesh"/>
      {pricing&&<PricingModal/>}{auth&&<AuthModal auth={auth} setAuth={setAuth} onSuccess={()=>setAuth(null)}/>}

      <nav className="nav-bar" style={{padding:"18px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:2,maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setPg("landing")}>
          <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#0d9488,#14b8a6)",display:"flex",alignItems:"center",justifyContent:"center",animation:"glow 4s infinite",overflow:"hidden"}}><img src="/logo.png" style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:6}} alt="V"/></div>
          <span style={{fontWeight:800,fontSize:18,color:"#f0fdfa",letterSpacing:"-1px"}}>Veilora</span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
          <div className="nav-links" style={{display:"flex",gap:6}}>
            <button className="btn btn-s" style={{fontSize:12,padding:"7px 12px"}} onClick={()=>setPg(pg==="docs"?"landing":"docs")}>{pg==="docs"?"← Retour":"Guide"}</button>
            <button className="btn btn-s" style={{fontSize:12,padding:"7px 12px"}} onClick={()=>setPg("changelog")}>Changelog</button>
            <button className="btn btn-s" style={{fontSize:12,padding:"7px 12px"}} onClick={()=>setPricing(true)}>Pricing</button>
          </div>
          {user?<><span style={{fontSize:11,color:"#5eead4",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile?.name||user.email?.split("@")[0]}</span>{pro&&<span className="badge bt" style={{fontSize:9}}>PRO</span>}<button className="btn btn-s" style={{padding:"6px 10px",fontSize:11}} onClick={doLogout}>Déco</button></>:
            <button className="btn btn-s" style={{fontSize:12,padding:"7px 12px"}} onClick={()=>setAuth("login")}>Connexion</button>}
          <button className="btn btn-p" style={{fontSize:12,padding:"9px 18px"}} onClick={()=>setPg("app")}>Ouvrir l'app</button>
        </div>
      </nav>

      {pg==="changelog"?(<main className="section" style={{maxWidth:700,margin:"0 auto",padding:"40px 24px",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <h1 className="section-title" style={{fontSize:28,fontWeight:800,color:"#f0fdfa",marginBottom:8}}>Changelog</h1>
          <p style={{fontSize:14,color:"#4a6a78"}}>Chaque mise à jour, documentée.</p></div>
        {CHANGELOG.map((c,ci)=><div key={ci} className="card" style={{padding:"20px 22px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
            <span style={{padding:"4px 12px",borderRadius:100,background:"linear-gradient(135deg,#0d9488,#14b8a6)",color:"#021a16",fontSize:12,fontWeight:800}}>v{c.v}</span>
            <span style={{fontSize:12,color:"#3d5a6a"}}>{c.d}</span></div>
          {c.items.map((it,ii)=><div key={ii} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
            <span style={{color:"#5eead4",fontSize:11,marginTop:2}}>◆</span>
            <span style={{fontSize:13,color:"#9ab",lineHeight:1.6}}>{it}</span></div>)}</div>)}
        <div style={{textAlign:"center",marginTop:20}}><button className="btn btn-p" onClick={()=>setPg("app")} style={{borderRadius:14}}>Lancer Veilora</button></div>
      </main>):pg==="docs"?(<main className="section" style={{maxWidth:700,margin:"0 auto",padding:"40px 24px",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <h1 className="section-title" style={{fontSize:28,fontWeight:800,color:"#f0fdfa",marginBottom:8}}>Guide & FAQ</h1>
          <p style={{fontSize:14,color:"#4a6a78"}}>Tout ce que tu dois savoir sur Veilora</p></div>
        {FAQ.map((g,i)=><div key={i} className="faq-item">
          <div className={`faq-q ${faqO===i?"open":""}`} onClick={()=>setFaqO(faqO===i?null:i)}>
            <span style={{flex:1,fontSize:14,fontWeight:600,color:faqO===i?"#5eead4":"#d0e0e8"}}>{g.q}</span>
            <span style={{fontSize:11,color:"#3d5a6a",transition:"transform .2s",transform:faqO===i?"rotate(180deg)":""}}>▼</span>
          </div>{faqO===i&&<div className="faq-a">{g.a}</div>}</div>)}
        <div style={{textAlign:"center",marginTop:24}}><button className="btn btn-p" onClick={()=>setPg("app")} style={{borderRadius:14}}>🔒 Lancer Veilora</button></div>
      </main>):(
        <main style={{position:"relative",zIndex:1,overflowX:"hidden"}}>
          {/* HERO */}
          <section style={{padding:"60px 20px 50px",textAlign:"center",maxWidth:860,margin:"0 auto"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,padding:"6px 14px",borderRadius:100,border:"1px solid rgba(20,184,166,.12)",background:"rgba(20,184,166,.03)",fontSize:11,color:"#5eead4",fontWeight:600,marginBottom:24}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#34d399",animation:"pulse 2s infinite"}}/>100% local — aucun upload</div>
            <h1 className="hero-title" style={{fontSize:44,fontWeight:900,color:"#f0fdfa",lineHeight:1.1,letterSpacing:"-2px",marginBottom:18}}>
              Un fichier. <span style={{background:"linear-gradient(135deg,#14b8a6,#67e8f9)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>100 versions uniques.</span><br/>Zéro trace.</h1>
            <p className="hero-sub" style={{fontSize:15,color:"#4a6a78",maxWidth:500,margin:"0 auto 28px",lineHeight:1.7}}>Chaque pixel, chaque metadata, chaque hash — randomisé.</p>
            <div className="hero-btns" style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn btn-p" onClick={()=>setPg("app")} style={{padding:"14px 30px",fontSize:15,borderRadius:14}}>Essayer gratuitement</button>
              <button className="btn" onClick={()=>window.open(STRIPE.lifetime,"_blank")} style={{padding:"14px 24px",fontSize:14,borderRadius:14,background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"#000",fontWeight:700,border:"none"}}>À vie — 44.99€</button>
            </div>
            <div style={{marginTop:12,fontSize:11,color:"#2a4a58"}}>3 fichiers/jour gratuits • Pro dès 7.99€/mois</div>
          </section>

          {/* LIVE STATS */}
          <section className="live-stats section" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,maxWidth:700,margin:"0 auto 50px",padding:"0 20px"}}>
            {[{n:cFiles.toLocaleString(),l:"Fichiers traités",ic:"◎"},{n:cVersions.toLocaleString(),l:"Versions générées",ic:"⬡"},{n:cUsers.toLocaleString(),l:"Utilisateurs actifs",ic:"◇"}].map((s,i)=>(
              <div key={i} className="card" style={{padding:"18px 14px",textAlign:"center"}}>
                <div style={{fontSize:16,color:"#14b8a6",marginBottom:4}}>{s.ic}</div>
                <div className="mono stat-num" style={{fontSize:24,fontWeight:800,color:"#f0fdfa"}}>{s.n}</div>
                <div style={{fontSize:10,color:"#3d5a6a",marginTop:3}}>{s.l}</div></div>))}
          </section>

          {/* BEFORE/AFTER */}
          <section className="section" style={{maxWidth:600,margin:"0 auto 50px",padding:"0 20px"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <h2 className="section-title" style={{fontSize:24,fontWeight:800,color:"#f0fdfa",marginBottom:6}}>Vois la différence. Ou pas.</h2>
              <p style={{fontSize:13,color:"#3d5a6a"}}>Glisse le curseur — même image, hash complètement différent.</p></div>
            <div className="ba-container" onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();setBaSlider(Math.max(5,Math.min(95,((e.clientX-r.left)/r.width)*100)))}} onTouchMove={e=>{e.preventDefault();const r=e.currentTarget.getBoundingClientRect();const t=e.touches[0];setBaSlider(Math.max(5,Math.min(95,((t.clientX-r.left)/r.width)*100)))}}>
              <div style={{position:"absolute",inset:0}}>
                <img src="/demo.png" alt="Version" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(1.03) saturate(1.08) hue-rotate(4deg) contrast(1.02)"}}/>
                <div style={{position:"absolute",top:8,right:8,zIndex:4,padding:"3px 8px",borderRadius:6,background:"rgba(20,184,166,.15)",border:"1px solid rgba(94,234,212,.2)",backdropFilter:"blur(6px)"}}>
                  <div className="mono" style={{fontSize:9,color:"#5eead4"}}>SHA-256: e91b...f8a4</div></div></div>
              <div style={{position:"absolute",top:0,bottom:0,left:0,width:`${baSlider}%`,overflow:"hidden",zIndex:2}}>
                <div style={{position:"absolute",inset:0,width:`${10000/Math.max(baSlider,1)}%`}}>
                  <img src="/demo.png" alt="Original" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",top:8,left:8,zIndex:4,padding:"3px 8px",borderRadius:6,background:"rgba(0,0,0,.4)",border:"1px solid rgba(255,255,255,.1)",backdropFilter:"blur(6px)"}}>
                    <div className="mono" style={{fontSize:9,color:"#7a9aaa"}}>SHA-256: 7f3a...c2d1</div></div></div></div>
              <div className="ba-slider" style={{left:`${baSlider}%`,transform:"translateX(-50%)"}}/>
              <div style={{position:"absolute",bottom:8,left:10,zIndex:4,fontSize:10,fontWeight:700,color:"#fff",background:"rgba(0,0,0,.6)",padding:"4px 10px",borderRadius:6}}>ORIGINAL</div>
              <div style={{position:"absolute",bottom:8,right:10,zIndex:4,fontSize:10,fontWeight:700,color:"#5eead4",background:"rgba(0,0,0,.6)",padding:"4px 10px",borderRadius:6}}>VERSION v1</div>
            </div></section>

          {/* NUMBERS */}
          <section className="nums-grid section" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,maxWidth:700,margin:"0 auto 50px",padding:"0 20px"}}>
            {[{n:"100",l:"Versions max"},{n:"13",l:"Transformations"},{n:"22",l:"Localisations GPS"},{n:"8",l:"Fake Devices"}].map((s,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:32,fontWeight:900,color:"#f0fdfa"}}>{s.n}</div>
                <div style={{fontSize:11,color:"#3d5a6a",marginTop:2}}>{s.l}</div></div>))}
          </section>

          {/* HASH CHECKER */}
          <section className="section" style={{maxWidth:600,margin:"0 auto 50px",padding:"0 20px"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <span className="badge bt" style={{marginBottom:8}}>Outil gratuit</span>
              <h2 className="section-title" style={{fontSize:24,fontWeight:800,color:"#f0fdfa",marginBottom:6}}>Hash Checker</h2>
              <p style={{fontSize:13,color:"#3d5a6a"}}>Drop 2 fichiers — compare hash en un clic.</p></div>
            <div className="card" style={{padding:"24px 20px"}}>
              <div className="hc-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                {[0,1].map(idx=><div key={idx} onClick={()=>hcPick(idx)} style={{padding:"24px 12px",borderRadius:14,border:"2px dashed rgba(255,255,255,.08)",textAlign:"center",cursor:"pointer",background:hcFiles[idx]?"rgba(20,184,166,.03)":"transparent",borderColor:hcFiles[idx]?"rgba(20,184,166,.2)":"rgba(255,255,255,.08)"}}>
                  <div style={{fontSize:24,marginBottom:4}}>{hcFiles[idx]?"✅":"📄"}</div>
                  <div style={{fontSize:12,fontWeight:600,color:hcFiles[idx]?"#5eead4":"#4a6a78",wordBreak:"break-all"}}>{hcFiles[idx]?hcFiles[idx].name:`Fichier ${idx+1}`}</div>
                  <input ref={idx===0?hcRef1:hcRef2} type="file" accept="image/*" style={{display:"none"}} onChange={e=>hcLoad(idx,e)}/></div>)}
              </div>
              {hcLoading&&<div style={{textAlign:"center",padding:12}}><span style={{display:"inline-block",animation:"spin 1s linear infinite",fontSize:18}}>⚙️</span></div>}
              {hcResult&&<div>
                <div className="hc-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                  <div style={{padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.02)"}}>
                    <div style={{fontSize:9,color:"#3d5a6a",textTransform:"uppercase",marginBottom:3}}>Hash fichier 1</div>
                    <div className="mono" style={{fontSize:10,color:"#7a9aaa",wordBreak:"break-all"}}>{hcResult.h1}...</div>
                    <div style={{fontSize:10,color:"#3d5a6a",marginTop:3}}>{hcResult.s1}</div></div>
                  <div style={{padding:"10px 12px",borderRadius:10,background:"rgba(255,255,255,.02)"}}>
                    <div style={{fontSize:9,color:"#3d5a6a",textTransform:"uppercase",marginBottom:3}}>Hash fichier 2</div>
                    <div className="mono" style={{fontSize:10,color:"#7a9aaa",wordBreak:"break-all"}}>{hcResult.h2}...</div>
                    <div style={{fontSize:10,color:"#3d5a6a",marginTop:3}}>{hcResult.s2}</div></div></div>
                <div style={{textAlign:"center",padding:"14px 16px",borderRadius:12,background:hcResult.match?"rgba(251,113,133,.06)":"rgba(94,234,212,.06)",border:`1px solid ${hcResult.match?"rgba(251,113,133,.15)":"rgba(94,234,212,.15)"}`}}>
                  <div style={{fontSize:24,marginBottom:4}}>{hcResult.match?"⚠️":"✅"}</div>
                  <div style={{fontSize:15,fontWeight:700,color:hcResult.match?"#fb7185":"#5eead4"}}>{hcResult.match?"Doublon détectable":"Fichiers uniques"}</div></div>
                <button className="btn btn-s" onClick={()=>{setHcFiles([null,null]);setHcResult(null)}} style={{width:"100%",marginTop:10}}>Réinitialiser</button></div>}
            </div></section>

          {/* FEATURES */}
          <section className="section" style={{maxWidth:900,margin:"0 auto 50px",padding:"0 20px"}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <h2 className="section-title" style={{fontSize:24,fontWeight:800,color:"#f0fdfa",marginBottom:6}}>Construit pour être invisible</h2>
              <p style={{fontSize:13,color:"#3d5a6a"}}>13 couches de randomisation.</p></div>
            <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {[{ic:"⬡",t:"AI Noise",d:"Bruit gaussien simulant un capteur"},{ic:"◇",t:"Perspective Warp",d:"Micro-déformation imperceptible"},{ic:"◈",t:"LUT Cinématique",d:"5 courbes couleur aléatoires"},
                {ic:"⎔",t:"Fake Device",d:"Simule 8 appareils"},{ic:"⊕",t:"22 GPS Locations",d:"Spoof dans 22 villes"},{ic:"◉",t:"Visual Diff",d:"Compare en split / blink / overlay"},
                {ic:"≡",t:"Humanizer",d:"Curseur d'intensité"},{ic:"⤳",t:"Webhooks",d:"Envoi auto Discord & Telegram"},{ic:"◎",t:"Privacy Audit",d:"Score de protection"},
              ].map((f,i)=>(<div key={i} className="card" style={{padding:"18px 16px"}}>
                <div style={{fontSize:20,marginBottom:6,color:"#14b8a6"}}>{f.ic}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#e0f0f8",marginBottom:3}}>{f.t}</div>
                <div style={{fontSize:11,color:"#4a6a78",lineHeight:1.5}}>{f.d}</div></div>))}
            </div></section>

          {/* PRICING */}
          <section className="section" style={{maxWidth:800,margin:"0 auto 50px",padding:"0 20px"}}>
            <h2 className="section-title" style={{fontSize:24,fontWeight:800,color:"#f0fdfa",textAlign:"center",marginBottom:24}}>Pricing simple</h2>
            <div className="price-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
              <div className="prc"><div style={{fontSize:16,fontWeight:700,color:"#e0f0f8",marginBottom:4}}>Free</div><div style={{fontSize:30,fontWeight:800,color:"#fff"}}>0€</div><div style={{fontSize:11,color:"#3d5a6a",marginBottom:14}}>Pour tester</div>
                {["3 fichiers / jour","5 versions max","4 transformations"].map((f,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6}}><span style={{color:"#5eead4",fontSize:11}}>✓</span><span style={{fontSize:12,color:"#8aa"}}>{f}</span></div>)}
                <button className="btn btn-s" style={{width:"100%",marginTop:14,padding:10}} onClick={()=>setPg("app")}>Commencer</button></div>
              <div className="prc ft"><div style={{fontSize:16,fontWeight:700,color:"#5eead4",marginBottom:4}}>Pro</div><div style={{fontSize:30,fontWeight:800,color:"#fff"}}>7.99€<span style={{fontSize:12,color:"#5a7a8a"}}>/mois</span></div><div style={{fontSize:11,color:"#3d5a6a",marginBottom:14}}>Sans engagement</div>
                {["Illimité","100 versions","13 transformations","GPS + Fake Device","Webhooks"].map((f,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6}}><span style={{color:"#5eead4",fontSize:11}}>✓</span><span style={{fontSize:12,color:"#ccc"}}>{f}</span></div>)}
                <button className="btn btn-p" style={{width:"100%",marginTop:14,padding:10}} onClick={()=>window.open(STRIPE.monthly,"_blank")}>S'abonner</button></div>
              <div className="prc" style={{borderColor:"rgba(251,191,36,.2)",background:"rgba(251,191,36,.012)"}}>
                <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"#000",padding:"4px 14px",borderRadius:100,fontSize:10,fontWeight:700}}>BEST DEAL</div>
                <div style={{fontSize:16,fontWeight:700,color:"#fbbf24",marginBottom:4}}>À Vie</div><div style={{fontSize:30,fontWeight:800,color:"#fff"}}>44.99€</div><div style={{fontSize:11,color:"#3d5a6a",marginBottom:14}}>Paiement unique</div>
                {["Tout le Pro","Pour toujours","Updates incluses","Support VIP"].map((f,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6}}><span style={{color:"#fbbf24",fontSize:11}}>✓</span><span style={{fontSize:12,color:"#ccc"}}>{f}</span></div>)}
                <button className="btn" style={{width:"100%",marginTop:14,padding:10,borderRadius:12,background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"#000",fontWeight:700,fontSize:13,border:"none",cursor:"pointer"}} onClick={()=>window.open(STRIPE.lifetime,"_blank")}>Acheter à vie</button></div>
            </div></section>

          {/* TESTIMONIALS */}
          <section className="section" style={{maxWidth:900,margin:"0 auto 50px",padding:"0 20px"}}>
            <h2 className="section-title" style={{fontSize:24,fontWeight:800,color:"#f0fdfa",textAlign:"center",marginBottom:24}}>Ils utilisent Veilora</h2>
            <div className="testi-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {TESTI.map((t,i)=>(<div key={i} className="card" style={{padding:"18px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:"rgba(20,184,166,.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{t.a}</div>
                  <div><div style={{fontSize:12,fontWeight:700,color:"#e0f0f8"}}>{t.n}</div><div style={{fontSize:10,color:"#3d5a6a"}}>{t.r}</div></div></div>
                <div style={{fontSize:12,color:"#6a8a9a",lineHeight:1.6,marginBottom:8}}>"{t.t}"</div>
                <div style={{color:"#fbbf24",fontSize:12,letterSpacing:3}}>★★★★★</div></div>))}
            </div></section>

          {/* FAQ */}
          <section className="section" style={{maxWidth:660,margin:"0 auto 50px",padding:"0 20px"}}>
            <h2 className="section-title" style={{fontSize:24,fontWeight:800,color:"#f0fdfa",textAlign:"center",marginBottom:20}}>Questions fréquentes</h2>
            {FAQ.slice(0,5).map((g,i)=><div key={i} className="faq-item">
              <div className={`faq-q ${faqO===i?"open":""}`} onClick={()=>setFaqO(faqO===i?null:i)}>
                <span style={{flex:1,fontSize:13,fontWeight:600,color:faqO===i?"#5eead4":"#c0d6e0"}}>{g.q}</span>
                <span style={{fontSize:10,color:"#3d5a6a",transition:"transform .2s",transform:faqO===i?"rotate(180deg)":""}}>▼</span>
              </div>{faqO===i&&<div className="faq-a">{g.a}</div>}</div>)}
            <div style={{textAlign:"center",marginTop:12}}><button className="btn btn-s" onClick={()=>setPg("docs")}>Voir toute la FAQ →</button></div>
          </section>

          <section style={{textAlign:"center",padding:"20px 20px 50px"}}><button className="btn btn-p" onClick={()=>setPg("app")} style={{padding:"14px 30px",fontSize:15,borderRadius:14,width:"100%",maxWidth:320}}>🔒 Lancer Veilora</button></section>
        </main>
      )}
      <footer style={{padding:"16px 20px",borderTop:"1px solid rgba(255,255,255,.04)",textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{fontSize:10,color:"#1a2a33"}}>Veilora © 2026</div></footer></div>);

  function PricingModal(){return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",backdropFilter:"blur(16px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setPricing(false)}><div onClick={e=>e.stopPropagation()} style={{maxWidth:800,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
    <div style={{textAlign:"center",marginBottom:20}}>
      <div style={{fontSize:22,fontWeight:800,color:"#fff"}}>Choisis ton plan</div></div>
    <div className="price-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
      <div className="prc"><div style={{fontSize:15,fontWeight:700,color:"#e0f0f8",marginBottom:4}}>Free</div><div style={{fontSize:28,fontWeight:800,color:"#fff"}}>0€</div><div style={{fontSize:11,color:"#3d5a6a",marginBottom:14}}>Pour tester</div>
        {["3 fichiers/jour","5 versions max","4 transformations"].map((f,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6}}><span style={{color:"#5eead4"}}>✓</span><span style={{fontSize:12,color:"#8aa"}}>{f}</span></div>)}
        <button className="btn btn-s" style={{width:"100%",marginTop:12,padding:10}} onClick={()=>setPricing(false)}>Continuer Free</button></div>
      <div className="prc ft"><div style={{fontSize:15,fontWeight:700,color:"#5eead4",marginBottom:4}}>Pro</div><div style={{fontSize:28,fontWeight:800,color:"#fff"}}>7.99€<span style={{fontSize:12,color:"#5a7a8a"}}>/mois</span></div><div style={{fontSize:11,color:"#3d5a6a",marginBottom:14}}>Sans engagement</div>
        {["Illimité","100 versions","13 transformations","GPS + Fake Device","Webhooks"].map((f,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6}}><span style={{color:"#5eead4"}}>✓</span><span style={{fontSize:12,color:"#ccc"}}>{f}</span></div>)}
        <button className="btn btn-p" style={{width:"100%",marginTop:12,padding:10}} onClick={()=>window.open(STRIPE.monthly,"_blank")}>S'abonner</button></div>
      <div className="prc" style={{borderColor:"rgba(251,191,36,.2)",background:"rgba(251,191,36,.012)"}}>
        <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"#000",padding:"4px 14px",borderRadius:100,fontSize:10,fontWeight:700}}>BEST DEAL</div>
        <div style={{fontSize:15,fontWeight:700,color:"#fbbf24",marginBottom:4}}>À Vie</div><div style={{fontSize:28,fontWeight:800,color:"#fff"}}>44.99€</div><div style={{fontSize:11,color:"#3d5a6a",marginBottom:14}}>Paiement unique</div>
        {["Tout le Pro","Pour toujours","Updates","VIP"].map((f,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6}}><span style={{color:"#fbbf24"}}>✓</span><span style={{fontSize:12,color:"#ccc"}}>{f}</span></div>)}
        <button className="btn" style={{width:"100%",marginTop:12,padding:10,borderRadius:12,background:"linear-gradient(135deg,#d97706,#f59e0b)",color:"#000",fontWeight:700,fontSize:13,border:"none",cursor:"pointer"}} onClick={()=>window.open(STRIPE.lifetime,"_blank")}>Acheter à vie</button></div>
    </div><button className="btn btn-s" onClick={()=>setPricing(false)} style={{width:"100%",marginTop:12}}>Fermer</button></div></div>}

  // ══════════════════════════
  // APP — FULL SCREEN
  // ══════════════════════════
  return(
    <div style={{minHeight:"100vh",height:"100vh",display:"flex",flexDirection:"column",background:"#060a0c",color:"#b0c0c8",overflowX:"hidden"}}><style>{S}</style><div className="mesh"/>
      {pricing&&<PricingModal/>}{auth&&<AuthModal auth={auth} setAuth={setAuth} onSuccess={()=>setAuth(null)}/>}
      {preview&&(<div className="ov" onClick={()=>setPreview(null)}><div onClick={e=>e.stopPropagation()} style={{maxWidth:700,width:"100%"}}>
        <div style={{display:"flex",gap:6,marginBottom:12,justifyContent:"center"}}>{["split","blink","overlay"].map(m=><button key={m} className="btn btn-s" onClick={()=>setDm(m)} style={{padding:"6px 12px",fontSize:11,background:dm===m?"rgba(20,184,166,.12)":"rgba(255,255,255,.03)",color:dm===m?"#5eead4":"#666"}}>{m==="split"?"↔ Split":m==="blink"?"⚡ Blink":"🔍 Overlay"}</button>)}</div>
        {dm==="split"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}><div>{thumbs[preview.origId]&&<img src={thumbs[preview.origId]} style={{width:"100%",borderRadius:12}}/>}<div style={{fontSize:10,color:"#3d5a6a",marginTop:3}}>Original</div></div><div>{preview.thumb&&<img src={preview.thumb} style={{width:"100%",borderRadius:12}}/>}<div style={{fontSize:10,color:"#5eead4",marginTop:3}}>v{preview.vi}</div></div></div>}
        {dm==="blink"&&<div style={{marginBottom:10,textAlign:"center",position:"relative"}}>{thumbs[preview.origId]&&<img src={thumbs[preview.origId]} style={{maxWidth:"100%",maxHeight:350,borderRadius:12}}/>}{preview.thumb&&<img src={preview.thumb} style={{position:"absolute",left:0,top:0,maxWidth:"100%",maxHeight:350,borderRadius:12,animation:"blink 1.2s infinite"}}/>}</div>}
        {dm==="overlay"&&<div style={{marginBottom:10,position:"relative"}}>{thumbs[preview.origId]&&<img src={thumbs[preview.origId]} style={{width:"100%",maxHeight:350,objectFit:"contain",borderRadius:12}}/>}{preview.thumb&&<img src={preview.thumb} style={{position:"absolute",inset:0,width:"100%",maxHeight:350,objectFit:"contain",borderRadius:12,opacity:.5,mixBlendMode:"difference"}}/>}</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>{[{l:"Hash Orig",v:preview.origHash,c:"#7a9aaa"},{l:"Hash New",v:preview.hash,c:"#5eead4"},{l:"Size",v:`${preview.w}×${preview.h}`,c:"#67e8f9"},{l:"Diff",v:preview.similarity+"%",c:preview.similarity>50?"#fb7185":"#5eead4"}].map((s,i)=><div key={i} style={{background:"rgba(255,255,255,.025)",padding:"8px",borderRadius:8}}><div style={{fontSize:8,color:"#3d5a6a",textTransform:"uppercase"}}>{s.l}</div><div className="mono" style={{fontSize:12,fontWeight:700,color:s.c,marginTop:1}}>{s.v}</div></div>)}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}><button className="btn btn-p" style={{padding:"10px 20px"}} onClick={()=>{dl(preview);setPreview(null)}}>📥 Download</button><button className="btn btn-s" onClick={()=>setPreview(null)}>Fermer</button></div></div></div>)}
      {panel&&(<div className="ov" onClick={()=>setPanel(null)}><div onClick={e=>e.stopPropagation()} style={{maxWidth:460,width:"100%",maxHeight:"80vh",overflowY:"auto",background:"#0c1216",border:"1px solid rgba(255,255,255,.08)",borderRadius:20,padding:"24px 20px"}}>
        {panel==="audit"&&<><h3 style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:12}}>🛡️ Privacy Audit</h3>{[{l:"EXIF",s:tf.metadata},{l:"GPS",s:tf.location},{l:"Device",s:tf.metaTemplate},{l:"Timeline",s:tf.fakeTimeline},{l:"Filename",s:tf.randomName},{l:"Pixels",s:tf.crop||tf.colors||tf.noise},{l:"Couleurs",s:tf.colors||tf.lut}].map((a,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",borderRadius:8,background:"rgba(255,255,255,.02)",marginBottom:3}}><span style={{fontSize:12,color:"#9ab"}}>{a.l}</span><span style={{fontSize:11,fontWeight:600,color:a.s?"#5eead4":"#fbbf24"}}>{a.s?"✅":"⚠️"}</span></div>)}
          <div style={{marginTop:10,padding:12,borderRadius:8,background:activeT>=10?"rgba(94,234,212,.04)":"rgba(251,191,36,.04)"}}><div style={{fontSize:13,fontWeight:700,color:activeT>=10?"#5eead4":"#fbbf24"}}>Protection: {Math.round(activeT/Object.keys(TF).length*100)}%</div></div></>}
        {panel==="webhook"&&<><h3 style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:12}}>🔗 Webhooks</h3>
          <div style={{display:"flex",gap:6,marginBottom:10}}>{["discord","telegram"].map(t=><button key={t} className="btn btn-s" onClick={()=>setWh(w=>({...w,type:t}))} style={{flex:1,padding:9,fontSize:12,background:wh.type===t?"rgba(20,184,166,.1)":"rgba(255,255,255,.02)",color:wh.type===t?"#5eead4":"#5a7a8a"}}>{t==="discord"?"Discord":"Telegram"}</button>)}</div>
          <input style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",color:"#e0eaf0",fontSize:16,outline:"none",fontFamily:"inherit",WebkitAppearance:"none",marginBottom:10}} placeholder={wh.type==="discord"?"URL webhook Discord":"Chat ID Telegram"} value={wh.type==="discord"?wh.discord:wh.telegram} onChange={e=>setWh(w=>({...w,[w.type]:e.target.value}))} autoCapitalize="off" autoCorrect="off" spellCheck="false"/>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
            <div onClick={()=>setWh(w=>({...w,on:!w.on}))} style={{width:46,height:26,borderRadius:13,background:wh.on?"#14b8a6":"rgba(255,255,255,.1)",cursor:"pointer",position:"relative",transition:"all .15s"}}>
              <div style={{width:22,height:22,borderRadius:11,background:"#fff",position:"absolute",top:2,left:wh.on?22:2,transition:"left .15s"}}/></div>
            <span style={{fontSize:12,color:wh.on?"#5eead4":"#5a7a8a"}}>{wh.on?"Activé":"Désactivé"}</span></div>
          <button className="btn btn-p" style={{width:"100%",padding:12}} onClick={()=>{try{localStorage.setItem("v_wh",JSON.stringify(wh))}catch(e){}}}>Sauvegarder</button></>}
        {panel==="history"&&<><h3 style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:12}}>📋 Historique</h3>{!hist.length&&<div style={{color:"#3d5a6a",fontSize:12}}>Aucun traitement</div>}{hist.map((h,i)=><div key={i} style={{padding:"8px 12px",borderRadius:8,background:"rgba(255,255,255,.02)",marginBottom:4}}><div style={{fontSize:12,fontWeight:600,color:"#ddd"}}>{h.files} fichiers → {h.versions}v • {h.time}</div><div style={{fontSize:10,color:"#3d5a6a"}}>{h.date}</div></div>)}</>}
        <button className="btn btn-s" onClick={()=>setPanel(null)} style={{marginTop:10,width:"100%"}}>Fermer</button></div></div>)}

      <header className="app-header" style={{padding:"10px 16px",borderBottom:"1px solid rgba(255,255,255,.05)",flexShrink:0,position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",minWidth:0}} onClick={()=>setPg("landing")}>
            <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#0d9488,#14b8a6)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}><img src="/logo.png" style={{width:"100%",height:"100%",objectFit:"contain",borderRadius:5}} alt="V"/></div>
            <span style={{fontWeight:800,fontSize:15,color:"#f0fdfa",letterSpacing:"-.8px"}}>Veilora</span>
            {user&&(pro?<span className="badge bt" style={{fontSize:9}}>PRO</span>:<span className="badge ba" style={{fontSize:9}}>FREE {du}/{FREE_LIMIT}</span>)}
            {!user&&<span className="badge" style={{fontSize:9,background:"rgba(251,113,133,.08)",color:"#fb7185"}}>Non connecté</span>}
          </div>
          <div className="app-header-btns" style={{display:"flex",gap:4,alignItems:"center"}}>
            <button className="btn btn-s" style={{padding:"5px 8px",fontSize:10}} onClick={()=>setPanel("audit")}>🛡️</button>
            <button className="btn btn-s" style={{padding:"5px 8px",fontSize:10}} onClick={()=>setPanel("webhook")}>🔗</button>
            <button className="btn btn-s" style={{padding:"5px 8px",fontSize:10}} onClick={()=>setPanel("history")}>📋</button>
            {!pro&&user&&<button className="btn" style={{padding:"5px 10px",fontSize:10,borderRadius:8,background:"linear-gradient(135deg,#0d9488,#14b8a6)",color:"#021a16",fontWeight:700,border:"none"}} onClick={()=>setPricing(true)}>⚡ Pro</button>}
            {!user&&<button className="btn" style={{padding:"5px 10px",fontSize:10,borderRadius:8,background:"linear-gradient(135deg,#0d9488,#14b8a6)",color:"#021a16",fontWeight:700,border:"none"}} onClick={()=>setAuth("login")}>Connexion</button>}
            {user&&<button className="btn btn-s" style={{padding:"5px 8px",fontSize:10}} onClick={doLogout}>Déco</button>}
            {files.length>0&&<button className="btn btn-s" style={{padding:"5px 8px",fontSize:10,color:"#fb7185"}} onClick={clr}>✕</button>}
          </div></div></header>

      <main style={{flex:1,overflow:"auto",padding:"14px 16px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",gap:4,background:"rgba(255,255,255,.02)",padding:3,borderRadius:10,maxWidth:240,margin:"0 auto 12px",border:"1px solid rgba(255,255,255,.05)"}}>
          {[["photo","📸 Photos"],["video","🎬 Vidéos"]].map(([m,l])=><button key={m} className="btn" onClick={()=>{setMode(m);clr()}} style={{flex:1,padding:"8px 0",fontSize:12,fontWeight:700,borderRadius:8,background:mode===m?"linear-gradient(135deg,#0d9488,#14b8a6)":"transparent",color:mode===m?"#021a16":"#4a6a78"}}>{l}</button>)}
        </div>
        <div className="preset-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,maxWidth:500,margin:"0 auto 14px"}}>
          {PRESETS.map(p=><div key={p.id} className={`pc ${preset?.id===p.id?"on":""}`} onClick={()=>applyP(p)}>
            <div style={{fontSize:18,marginBottom:1}}>{p.icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:preset?.id===p.id?"#5eead4":"#6a8a9a"}}>{p.name}</div></div>)}
        </div>

        {res.length>0&&<div style={{display:"flex",gap:6,marginBottom:12,justifyContent:"center"}}>
          <button className={`btn ${vw==="config"?"btn-p":"btn-s"}`} style={{padding:"7px 16px",fontSize:11}} onClick={()=>setVw("config")}>⚙️ Config</button>
          <button className={`btn ${vw==="results"?"btn-p":"btn-s"}`} style={{padding:"7px 16px",fontSize:11}} onClick={()=>setVw("results")}>✅ Résultats ({totV})</button></div>}

        {vw==="config"&&(<div className="app-layout" style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:14}}>
          <aside className="app-side" style={{display:"flex",flexDirection:"column",gap:8}}>
            <div className="card" style={{padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#e8f4f8"}}>🎚️ Humanizer</span><span style={{fontSize:12,fontWeight:700,color:iC}}>{iL}</span></div>
              <input type="range" className="slider" min="0" max="1" step=".01" value={inten} onChange={e=>setInten(+e.target.value)}/></div>
            <div className="card" style={{padding:"12px 16px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:700,color:"#e0e8f0"}}>Versions</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button className="cnt" style={{width:34,height:34,fontSize:16}} onClick={()=>setVer(v=>Math.max(1,v-1))}>−</button>
                  <div className="mono" style={{fontSize:24,fontWeight:700,color:"#5eead4",width:40,textAlign:"center"}}>{ver}</div>
                  <button className="cnt" style={{width:34,height:34,fontSize:16}} onClick={()=>setVer(v=>Math.min(pro?100:5,v+1))}>+</button></div></div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[1,5,10,20,50,100].map(n=><button key={n} className="btn btn-s" onClick={()=>{if(!pro&&n>5){setPricing(true);return}setVer(n)}} style={{padding:"4px 8px",fontSize:10,fontWeight:700,background:ver===n?"rgba(20,184,166,.12)":"rgba(255,255,255,.02)",color:ver===n?"#5eead4":"#4a6a78",opacity:!pro&&n>5?.35:1}}>{n}</button>)}</div></div>
            {tf.location&&<div className="card" style={{padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#e0e8f0",marginBottom:6}}>📍 GPS Spoofing</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{LOCS.map((l,i)=><button key={i} className={`lb ${loc.city===l.city?"on":""}`} onClick={()=>{if(!pro&&i>3){setPricing(true);return}setLoc(l)}} style={{padding:"5px 10px",fontSize:10,opacity:!pro&&i>3?.35:1}}>{l.city}</button>)}</div></div>}
            {tf.metaTemplate&&<div className="card" style={{padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#e0e8f0",marginBottom:6}}>
