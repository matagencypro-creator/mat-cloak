import { useState, useCallback, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

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
  {n:"Lucas M.",r:"Agency Owner",a:"🧑‍💼",t:"On poste sur 40 comptes IG sans ban. Avant on perdait 2-3 comptes par semaine."},
  {n:"Sarah K.",r:"Content Manager",a:"👩‍💻",t:"Le Humanizer c'est génial. Le workflow est parfait pour notre équipe."},
  {n:"Marc D.",r:"Growth Hacker",a:"🧔",t:"J'ai testé tous les outils du marché. Veilora est de loin le plus complet."},
  {n:"Emma R.",r:"Social Media",a:"👩",t:"GPS spoofing + fake device = zéro détection depuis 3 mois."},
  {n:"Thomas B.",r:"Freelance",a:"👨‍🎨",t:"Le plan à vie c'est un no-brainer. L'envoi auto Discord me fait gagner 1h/jour."},
  {n:"Julie P.",r:"Agency Co-founder",a:"👩‍🦰",t:"Visuellement identique, techniquement différent. Exactement ce qu'il nous fallait."},
];

const GUIDE=[
  {title:"1. Crée ton compte",desc:"Inscris-toi en 10 secondes avec ton email. Aucune carte bancaire requise pour le plan gratuit. Tu as immédiatement accès à 3 fichiers par jour.",icon:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"},
  {title:"2. Choisis ton preset",desc:"Sélectionne Instagram, TikTok, Reddit, Twitter ou Custom. Chaque preset optimise automatiquement les transformations pour la plateforme cible.",icon:"M4 6h16M4 10h16M4 14h16M4 18h16"},
  {title:"3. Upload tes fichiers",desc:"Drag & drop tes photos ou vidéos. Formats supportés : JPG, PNG, WEBP, MP4, MOV, WEBM. Tout est traité localement dans ton navigateur — rien n'est uploadé.",icon:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"},
  {title:"4. Règle le Humanizer",desc:"Le curseur contrôle l'intensité de toutes les transformations. Ultra léger = qualité maximale. Agressif = sécurité maximale pour poster sur beaucoup de comptes.",icon:"M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"},
  {title:"5. Lance le traitement",desc:"Clique sur Traiter. Veilora génère jusqu'à 100 versions uniques par fichier. Chaque version a des pixels, métadonnées et hash différents.",icon:"M13 10V3L4 14h7v7l9-11h-7z"},
  {title:"6. Vérifie avec Visual Diff",desc:"Compare l'original et les versions en mode Split, Blink ou Overlay. Le Similarity Score te prouve que chaque version est techniquement unique.",icon:"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"},
  {title:"7. Télécharge & partage",desc:"Download toutes les versions en un clic ou envoie-les automatiquement sur Discord/Telegram via webhook. Tes fichiers sont prêts à poster.",icon:"M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"},
  {title:"8. Content Studio IA",desc:"Passe sur l'onglet Content Studio dans l'app. Choisis le type (captions, titres, hashtags, script, bio), entre ta niche, sélectionne la plateforme et le ton — l'IA génère tout en 1 clic. Copie et colle directement sur tes posts.",icon:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"},
];

const FAQ=[
  {q:"C'est quoi Veilora ?",a:"Veilora est un outil qui randomise tes photos et vidéos à chaque export. Il modifie les pixels, les métadonnées EXIF, le hash SHA-256, les coordonnées GPS et les infos device. Résultat : chaque version est techniquement unique et indétectable comme doublon par les algorithmes des réseaux sociaux."},
  {q:"Comment les plateformes détectent les doublons ?",a:"Les réseaux sociaux utilisent 3 méthodes principales : le hash SHA-256 (comparaison bit à bit du fichier), le hash perceptuel pHash (analyse de la structure visuelle), et les métadonnées EXIF (appareil, date, GPS). Veilora modifie les 3 couches simultanément pour rendre chaque fichier unique."},
  {q:"Mes fichiers sont uploadés sur un serveur ?",a:"Non, jamais. Tout le traitement est 100% local dans ton navigateur grâce à l'API Canvas et les Web Workers. Aucun fichier ne quitte ton appareil. C'est plus rapide ET plus sécurisé qu'un traitement serveur."},
  {q:"À quoi sert le curseur Humanizer ?",a:"Le Humanizer contrôle l'intensité de toutes les transformations en même temps. À gauche (Ultra léger) : modifications minimales, qualité maximale — idéal pour 2-3 comptes. À droite (Maximum) : modifications agressives pour poster sur des dizaines de comptes sans risque."},
  {q:"C'est vraiment indétectable ?",a:"Les micro-modifications sont imperceptibles à l'oeil humain mais suffisantes pour générer un hash complètement différent. Le mode Visual Diff te permet de vérifier toi-même : original et version côte à côte, impossible de voir la différence."},
  {q:"Free vs Pro, quelle différence ?",a:"Free : 3 fichiers/jour, 5 versions max, 4 transformations de base. Pro (7.99€/mois ou 44.99€ à vie) : fichiers illimités, 100 versions par fichier, 13 transformations incluant AI Noise, LUT, Perspective Warp, GPS Spoofing, Fake Device, et webhooks Discord/Telegram."},
  {q:"Le webhook Discord/Telegram, comment ça marche ?",a:"Dans l'app, clique sur l'icône Webhooks. Colle l'URL de ton webhook Discord ou ton Chat ID Telegram. Active le toggle. Après chaque traitement, toutes les versions sont automatiquement envoyées sur ton channel. Zéro action manuelle."},
  {q:"Je peux traiter des vidéos ?",a:"Oui. Veilora supporte les formats MP4, MOV et WEBM. Les vidéos sont renommées avec un nom aléatoire et les métadonnées sont modifiées. Le traitement pixel par pixel n'est pas disponible pour les vidéos (limitation navigateur)."},
  {q:"C'est quoi le Content Studio ?",a:"Le Content Studio est un outil IA intégré directement dans Veilora (onglet dédié dans l'app). Il te permet de générer en 1 clic des captions Instagram/TikTok, des titres et hooks accrocheurs, des packs de 30 hashtags optimisés, des scripts de Reels complets avec indications de montage, et des bios percutantes. Tu choisis ta niche, ta plateforme, la langue (FR/EN) et le ton (Pro, Fun, Storytelling, Viral, Edgy). Réservé aux utilisateurs Pro."},
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

function useCounter(target,dur=2000){const[v,setV]=useState(0);useEffect(()=>{let s=null;const step=ts=>{if(!s)s=ts;const p=Math.min((ts-s)/dur,1);setV(Math.floor(p*target));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step)},[target,dur]);return v}

const IC=({d,size=20,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>;

function AuthModal({mode:initMode,onClose,onSuccess}){
  const emailRef=useRef(null);const passRef=useRef(null);const nameRef=useRef(null);
  const[err,setErr]=useState("");const[loading,setLoading]=useState(false);const[mode,setMode]=useState(initMode);
  const doRegister=async()=>{
    const email=emailRef.current?.value||"";const pass=passRef.current?.value||"";const name=nameRef.current?.value||"";
    setErr("");setLoading(true);
    const{data,error}=await supabase.auth.signUp({email,password:pass,options:{data:{name:name||email.split("@")[0]}}});
    setLoading(false);if(error){setErr(error.message);return}
    if(data.user&&!data.session){setErr("✅ Vérifie ton email !");return}onSuccess();};
  const doLogin=async()=>{
    const email=emailRef.current?.value||"";const pass=passRef.current?.value||"";
    setErr("");setLoading(true);
    const{data,error}=await supabase.auth.signInWithPassword({email,password:pass});
    setLoading(false);if(error){setErr(error.message);return}onSuccess();};
  const IS={width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.1)",background:"rgba(255,255,255,.04)",color:"#e0eaf0",fontSize:"16px",outline:"none",fontFamily:"inherit",WebkitAppearance:"none",boxSizing:"border-box"};
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.92)",backdropFilter:"blur(20px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{maxWidth:420,width:"100%",background:"linear-gradient(180deg,#0a1014,#080c10)",border:"1px solid rgba(255,255,255,.08)",borderRadius:24,padding:"36px 28px",position:"relative"}}>
        <button onClick={onClose} style={{position:"absolute",top:16,right:16,background:"rgba(255,255,255,.06)",border:"none",color:"#667",width:32,height:32,borderRadius:"50%",fontSize:14,cursor:"pointer"}}>✕</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:52,height:52,borderRadius:16,background:"linear-gradient(135deg,#0d9488,#06b6d4)",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:14,overflow:"hidden"}}><img src="/logo.png" style={{width:"100%",height:"100%",objectFit:"contain"}} alt="V"/></div>
          <div style={{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:"-.5px"}}>{mode==="register"?"Créer un compte":"Connexion"}</div>
          <div style={{fontSize:13,color:"#4a5568",marginTop:4}}>{mode==="register"?"Commence gratuitement":"Content de te revoir"}</div></div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {mode==="register"&&<input key="auth-name" ref={nameRef} style={IS} placeholder="Prénom" defaultValue="" autoComplete="given-name" autoCapitalize="words" autoCorrect="off" spellCheck={false} enterKeyHint="next"/>}
          <input key="auth-email" ref={emailRef} style={IS} type="email" inputMode="email" placeholder="Email" defaultValue="" autoComplete="email" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="next"/>
          <input key="auth-pass" ref={passRef} style={IS} type="password" placeholder="Mot de passe (min 6 caractères)" defaultValue="" autoComplete={mode==="register"?"new-password":"current-password"} autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="done" onKeyDown={e=>{if(e.key==="Enter"){mode==="register"?doRegister():doLogin()}}}/>
          {err&&<div style={{color:err.startsWith("✅")?"#5eead4":"#f87171",fontSize:13,textAlign:"center",padding:"10px 12px",borderRadius:10,background:err.startsWith("✅")?"rgba(94,234,212,.06)":"rgba(248,113,113,.06)"}}>{err}</div>}
          <button onClick={mode==="register"?doRegister:doLogin} disabled={loading} style={{width:"100%",padding:15,borderRadius:12,background:"linear-gradient(135deg,#0d9488,#06b6d4)",color:"#fff",fontSize:15,fontWeight:700,border:"none",cursor:"pointer",opacity:loading?.5:1,letterSpacing:"-.2px",marginTop:4}}>
            {loading?"⏳":mode==="register"?"Créer mon compte":"Se connecter"}</button></div>
        <div style={{textAlign:"center",marginTop:18}}>
          {mode==="login"?<span style={{fontSize:13,color:"#4a5568"}}>Pas de compte ? <span style={{color:"#2dd4bf",cursor:"pointer",fontWeight:600}} onClick={()=>{setMode("register");setErr("")}}>S'inscrire</span></span>:
          <span style={{fontSize:13,color:"#4a5568"}}>Déjà inscrit ? <span style={{color:"#2dd4bf",cursor:"pointer",fontWeight:600}} onClick={()=>{setMode("login");setErr("")}}>Connexion</span></span>}</div></div></div>);
}

export default function App(){
  const[pg,setPg]=useState("landing");
  const[mode,setMode]=useState("photo");const[files,setFiles]=useState([]);const[ver,setVer]=useState(5);
  const[tf,setTf2]=useState({...TFD});const[loc,setLoc]=useState(LOCS[0]);const[mtpl,setMtpl]=useState(MTPL[0]);
  const[preset,setPreset]=useState(null);const[inten,setInten]=useState(.5);const[proc,setProc]=useState(false);
  const[prog,setProg]=useState({c:0,t:0,f:"",v:0});const[res,setRes]=useState([]);const[vw,setVw]=useState("config");
  const[drag,setDrag]=useState(false);const[thumbs,setThumbs]=useState({});const[preview,setPreview]=useState(null);
  const[dm,setDm]=useState("split");const[panel,setPanel]=useState(null);const[hist,setHist]=useState([]);
  const[pricing,setPricing]=useState(false);const[auth,setAuth]=useState(null);const[pendingStripe,setPendingStripe]=useState(null);
  const[wh,setWh]=useState({discord:"",telegram:"",on:false,type:"discord"});
  const[faqO,setFaqO]=useState(null);const[baSlider,setBaSlider]=useState(50);
  const[hcFiles,setHcFiles]=useState([null,null]);const[hcResult,setHcResult]=useState(null);const[hcLoading,setHcLoading]=useState(false);
  const[cs,setCs]=useState({niche:"",tone:"pro",platform:"instagram",type:"caption",lang:"fr",result:"",loading:false,copied:false});
  const[user,setUser]=useState(null);const[profile,setProfile]=useState(null);const[pro,setPro]=useState(false);const[du,setDu]=useState(0);
  const ir=useRef();const hcRef1=useRef();const hcRef2=useRef();
  const cFiles=useCounter(142847);const cVersions=useCounter(1284920);const cUsers=useCounter(3847);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{if(session?.user){setUser(session.user);loadProfile(session.user.id)}});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id)}
      else{setUser(null);setProfile(null);setPro(false);setDu(0)}});
    return()=>subscription.unsubscribe();},[]);

  const loadProfile=async(uid)=>{const{data}=await supabase.from("profiles").select("*").eq("id",uid).single();
    if(data){setProfile(data);setPro(data.is_pro||false);const today=new Date().toISOString().slice(0,10);
      if(data.last_usage_date!==today){setDu(0);await supabase.from("profiles").update({daily_usage:0,last_usage_date:today}).eq("id",uid)}
      else{setDu(data.daily_usage||0)}}};
  const incrementUsage=async(count)=>{if(!user)return;const newDu=du+count;setDu(newDu);const today=new Date().toISOString().slice(0,10);
    await supabase.from("profiles").update({daily_usage:newDu,last_usage_date:today}).eq("id",user.id);};
  const doLogout=async()=>{await supabase.auth.signOut();setUser(null);setProfile(null);setPro(false);setDu(0)};
  const ck=()=>{if(!user){setAuth("login");return false}if(pro)return true;if(du>=FREE_LIMIT){setPricing(true);return false}return true;};
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
  const iC=inten<.25?"#6ee7b7":inten<.45?"#67e8f9":inten<.65?"#a78bfa":inten<.85?"#fbbf24":"#f87171";
  const hcPick=async(idx)=>{(idx===0?hcRef1:hcRef2).current?.click()};
  const hcLoad=async(idx,e)=>{const file=e.target.files?.[0];if(!file)return;const nf=[...hcFiles];nf[idx]=file;setHcFiles(nf);
    if(nf[0]&&nf[1]){setHcLoading(true);try{const[h1,h2]=await Promise.all([pH(nf[0]),pH(nf[1])]);
      const match=h1===h2;setHcResult({h1:h1.slice(0,32),h2:h2.slice(0,32),match,s1:fb(nf[0].size),s2:fb(nf[1].size)})}catch(e){setHcResult(null)}setHcLoading(false)}};
  const goStripe=(url)=>{if(user){window.open(url,"_blank")}else{setPendingStripe(url);setAuth("register")}};
  const generateContent=async()=>{if(!cs.niche.trim())return;setCs(p=>({...p,loading:true,result:"",copied:false}));
    const prompts={caption:`Tu es un expert en social media marketing. G\u00e9n\u00e8re 3 captions ${cs.lang==="fr"?"en fran\u00e7ais":"in English"} pour un Reel ${cs.platform} dans la niche "${cs.niche}". Ton: ${cs.tone==="pro"?"professionnel et autoritaire":cs.tone==="fun"?"fun et d\u00e9contract\u00e9":cs.tone==="storytelling"?"storytelling \u00e9motionnel":cs.tone==="viral"?"viral et accrocheur":"provocateur et polarisant"}. Chaque caption doit avoir un hook percutant en premi\u00e8re ligne, du contenu engageant, un CTA, et 5-8 hashtags pertinents. S\u00e9pare chaque caption par ---`,
      title:`Tu es un expert en social media. G\u00e9n\u00e8re 10 titres/hooks ${cs.lang==="fr"?"en fran\u00e7ais":"in English"} ultra accrocheurs pour des Reels ${cs.platform} dans la niche "${cs.niche}". Ton: ${cs.tone==="pro"?"professionnel":cs.tone==="fun"?"fun":cs.tone==="storytelling"?"storytelling":cs.tone==="viral"?"viral":"provocateur"}. Format: un titre par ligne, num\u00e9rot\u00e9. Chaque titre doit donner envie de regarder le Reel.`,
      hashtag:`G\u00e9n\u00e8re 30 hashtags ${cs.lang==="fr"?"en fran\u00e7ais et anglais mix\u00e9s":"in English"} ultra pertinents pour des Reels ${cs.platform} dans la niche "${cs.niche}". M\u00e9lange : 10 gros hashtags (>1M posts), 10 moyens (100K-1M), 10 petits (<100K) pour maximiser la port\u00e9e. Format: tous sur une ligne s\u00e9par\u00e9s par des espaces.`,
      script:`Tu es un expert en cr\u00e9ation de contenu vid\u00e9o. \u00c9cris un script complet ${cs.lang==="fr"?"en fran\u00e7ais":"in English"} pour un Reel ${cs.platform} de 30-60 secondes dans la niche "${cs.niche}". Ton: ${cs.tone==="pro"?"professionnel":cs.tone==="fun"?"fun":cs.tone==="storytelling"?"storytelling":cs.tone==="viral"?"viral":"provocateur"}. Inclus: [HOOK] les 3 premi\u00e8res secondes, [CONTENU] le d\u00e9veloppement, [CTA] l'appel \u00e0 l'action. Ajoute des indications de montage entre crochets.`,
      bio:`G\u00e9n\u00e8re 5 bios ${cs.lang==="fr"?"en fran\u00e7ais":"in English"} pour un profil ${cs.platform} dans la niche "${cs.niche}". Chaque bio doit \u00eatre courte (150 caract\u00e8res max), percutante, avec des emojis pertinents et un CTA. S\u00e9pare chaque bio par ---`};
    try{const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompts[cs.type]||prompts.caption}]})});
      const d=await r.json();const txt=d.content?.map(b=>b.text||"").join("\n")||"Erreur de g\u00e9n\u00e9ration";
      setCs(p=>({...p,result:txt,loading:false}))}catch(e){setCs(p=>({...p,result:"Erreur: "+e.message,loading:false}))}};

  const FEATURES=[
    {t:"Photos & Vidéos",d:"Traitement batch de JPG, PNG, WEBP, MP4, MOV. Génère autant de versions uniques que nécessaire.",ic:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"},
    {t:"Métadonnées EXIF",d:"Réécriture complète des métadonnées : date, appareil, logiciel — avec des valeurs aléatoires uniques.",ic:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"},
    {t:"GPS Aléatoire",d:"Coordonnées GPS générées dans la zone géographique de ton choix — 22 villes ou monde entier.",ic:"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"},
    {t:"Zoom & Recadrage",d:"Zoom aléatoire subtil appliqué à chaque version pour varier le cadrage sans altérer le contenu visible.",ic:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"},
    {t:"Micro-bruit Visuel",d:"Ajout de bruit gaussien invisible à l'oeil nu pour rendre chaque fichier unique sur le plan technique.",ic:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"},
    {t:"Envoi Automatique",d:"Envoi direct vers Telegram ou Discord via webhook dès que le traitement est terminé. Zéro action manuelle.",ic:"M12 19l9 2-9-18-9 18 9-2zm0 0v-8"},
    {t:"Content Studio IA",d:"Génère des captions, titres, hooks, hashtags, scripts de Reels et bios optimisés par IA. Choisis ta niche, ton ton et ta plateforme.",ic:"M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"},
  ];

  const S=`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;font-family:'Plus Jakarta Sans',system-ui,sans-serif;-webkit-tap-highlight-color:transparent}
    html,body,#root{height:100%;overflow-x:hidden;-webkit-text-size-adjust:100%}
    input,button,textarea,select{font-size:16px!important;-webkit-appearance:none;font-family:inherit}
    @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
    @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
    @keyframes glow{0%,100%{box-shadow:0 0 30px rgba(13,148,136,.1)}50%{box-shadow:0 0 60px rgba(13,148,136,.2)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:16px;transition:all .2s}
    .card:hover{border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.03)}
    .btn{font-family:inherit;border:none;border-radius:12px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:all .15s}
    .btn:active{transform:scale(.97)}
    .btn-p{background:linear-gradient(135deg,#0d9488,#06b6d4);color:#fff;padding:14px 28px;font-size:15px}
    .btn-p:hover{box-shadow:0 8px 32px rgba(13,148,136,.3);transform:translateY(-1px)}
    .btn-s{background:rgba(255,255,255,.04);color:#94a3b8;padding:10px 18px;font-size:13px;border:1px solid rgba(255,255,255,.06)}
    .btn-s:hover{background:rgba(255,255,255,.07);color:#e2e8f0}
    .badge{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:600}
    .bt{background:rgba(13,148,136,.1);color:#2dd4bf}.bg{background:rgba(52,211,153,.07);color:#6ee7b7}.ba{background:rgba(251,191,36,.08);color:#fde68a}
    .thumb{width:56px;height:56px;border-radius:12px;object-fit:cover;flex-shrink:0;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)}
    .row{display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:12px}
    .chk{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;user-select:none;transition:all .1s}.chk:hover{background:rgba(255,255,255,.02)}.chk.on{background:rgba(13,148,136,.05)}
    .dot{width:18px;height:18px;border-radius:5px;border:2px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;transition:all .15s}.dot.on{background:linear-gradient(135deg,#0d9488,#06b6d4);border-color:transparent;color:#fff}
    .cnt{width:38px;height:38px;border-radius:10px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);color:#94a3b8;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .1s}.cnt:hover{border-color:#0d9488;color:#fff}
    .pbar{height:3px;background:rgba(255,255,255,.04);border-radius:3px;overflow:hidden}.pfill{height:100%;background:linear-gradient(90deg,#0d9488,#06b6d4);border-radius:3px}
    .vc{background:rgba(255,255,255,.015);border:1px solid rgba(255,255,255,.05);border-radius:12px;padding:8px;cursor:pointer;overflow:hidden;transition:all .15s}.vc:hover{border-color:rgba(13,148,136,.3)}
    .pc{padding:14px 10px;border-radius:12px;cursor:pointer;border:2px solid transparent;background:rgba(255,255,255,.02);text-align:center;transition:all .15s}.pc:hover{background:rgba(255,255,255,.04)}.pc.on{border-color:rgba(13,148,136,.4);background:rgba(13,148,136,.06)}
    .lb{padding:7px 13px;border-radius:8px;cursor:pointer;border:1px solid transparent;font-family:inherit;font-size:12px;font-weight:600;background:rgba(255,255,255,.03);color:#64748b;transition:all .1s}.lb:hover{color:#94a3b8}.lb.on{border-color:rgba(13,148,136,.3);color:#2dd4bf;background:rgba(13,148,136,.06)}
    .ov{position:fixed;inset:0;background:rgba(0,0,0,.9);backdrop-filter:blur(20px);z-index:100;display:flex;align-items:center;justify-content:center;padding:16px}
    .slider{-webkit-appearance:none;width:100%;height:3px;border-radius:3px;outline:none;background:rgba(255,255,255,.08)}.slider::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;background:linear-gradient(135deg,#0d9488,#06b6d4);border-radius:50%;cursor:pointer;box-shadow:0 0 16px rgba(13,148,136,.4)}
    .mono{font-family:'SF Mono',SFMono-Regular,Menlo,monospace}
    .faq-item{margin-bottom:4px}.faq-q{padding:16px 18px;cursor:pointer;display:flex;align-items:center;gap:12px;border-radius:14px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.01);transition:all .15s}.faq-q:hover{background:rgba(255,255,255,.025)}.faq-q.open{background:rgba(13,148,136,.03);border-color:rgba(13,148,136,.12)}.faq-a{padding:12px 18px 18px;font-size:14px;color:#64748b;line-height:1.8}
    .ba-container{position:relative;overflow:hidden;border-radius:20px;border:1px solid rgba(255,255,255,.06);width:100%;aspect-ratio:16/9;background:#0a0e12;touch-action:none}
    .ba-slider{position:absolute;top:0;bottom:0;width:2px;background:linear-gradient(180deg,#0d9488,#06b6d4);z-index:3;cursor:ew-resize}.ba-slider::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#0d9488,#06b6d4);border:3px solid rgba(255,255,255,.9);box-shadow:0 0 20px rgba(13,148,136,.5)}
    .feat-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:18px;padding:28px 24px;transition:all .25s;position:relative;overflow:hidden}
    .feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(13,148,136,.3),transparent);opacity:0;transition:opacity .25s}.feat-card:hover::before{opacity:1}
    .feat-card:hover{border-color:rgba(255,255,255,.08);background:rgba(255,255,255,.03);transform:translateY(-2px)}
    .feat-icon{width:44px;height:44px;border-radius:12px;background:rgba(13,148,136,.08);display:flex;align-items:center;justify-content:center;margin-bottom:16px}
    .prc{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:20px;padding:32px 24px;position:relative;transition:all .2s}
    .prc.ft{border-color:rgba(13,148,136,.25);background:linear-gradient(180deg,rgba(13,148,136,.04),transparent)}
    .prc.ft::before{content:"POPULAIRE";position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#0d9488,#06b6d4);color:#fff;padding:5px 18px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:.5px}
    .prc.lt{border-color:rgba(13,148,136,.15);background:linear-gradient(180deg,rgba(6,182,212,.03),transparent)}
    @media(max-width:768px){
      html,body{overflow-x:hidden!important;width:100%!important}
      .hero-t{font-size:32px!important;letter-spacing:-1px!important}
      .hero-sub{font-size:14px!important}
      .hero-btns{flex-direction:column!important;width:100%!important}
      .hero-btns .btn{width:100%!important}
      .nav-bar{padding:12px 16px!important}
      .nav-links{display:none!important}
      .live-stats{grid-template-columns:repeat(3,1fr)!important;gap:8px!important}
      .feat-grid{grid-template-columns:1fr!important}
      .price-grid{grid-template-columns:1fr!important}
      .testi-grid{grid-template-columns:1fr!important}
      .nums-grid{grid-template-columns:repeat(2,1fr)!important}
      .guide-grid{grid-template-columns:1fr!important}
      .section{padding:0 16px!important}
      .section-t{font-size:24px!important}
      .hc-grid{grid-template-columns:1fr!important}
      .app-layout{grid-template-columns:1fr!important}
      .app-side{order:2}
      .app-header{padding:8px 12px!important}
      .app-header-btns{flex-wrap:wrap;gap:3px!important}
      .app-header-btns .btn{padding:4px 7px!important;font-size:9px!important}
      .stat-grid{grid-template-columns:repeat(2,1fr)!important}
      .ver-grid{grid-template-columns:repeat(2,1fr)!important}
      .preset-grid{grid-template-columns:repeat(3,1fr)!important;gap:4px!important}
      .preset-grid .pc{padding:8px 4px!important}
      .prc{padding:24px 18px!important}
      .ov{padding:10px!important}
    }
  `;

  /* ===== LANDING PAGE ===== */
  if(pg==="landing"||pg==="guide")return(
    <div style={{minHeight:"100vh",background:"#050809",color:"#94a3b8",overflowX:"hidden"}}><style>{S}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse 80% 50% at 50% -20%,rgba(13,148,136,.08),transparent 70%)"}}/>
      {pricing&&<PricingModal close={()=>setPricing(false)}/>}
      {auth&&<AuthModal mode={auth} onClose={()=>{setAuth(null);setPendingStripe(null)}} onSuccess={()=>{setAuth(null);if(pendingStripe){window.open(pendingStripe,"_blank");setPendingStripe(null)}}}/>}

      <nav className="nav-bar" style={{padding:"16px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:2,maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setPg("landing")}>
          <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#0d9488,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}><img src="/logo.png" style={{width:"100%",height:"100%",objectFit:"contain"}} alt="V"/></div>
          <span style={{fontWeight:800,fontSize:18,color:"#f1f5f9",letterSpacing:"-1px"}}>Veilora</span></div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <div className="nav-links" style={{display:"flex",gap:4}}>
            <button className="btn btn-s" style={{fontSize:12,padding:"8px 14px"}} onClick={()=>setPg(pg==="guide"?"landing":"guide")}>{pg==="guide"?"← Retour":"Guide"}</button>
            <button className="btn btn-s" style={{fontSize:12,padding:"8px 14px"}} onClick={()=>setPricing(true)}>Pricing</button></div>
          {user?<><span style={{fontSize:11,color:"#2dd4bf",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile?.name||user.email?.split("@")[0]}</span>{pro&&<span className="badge bt" style={{fontSize:9}}>PRO</span>}<button className="btn btn-s" style={{padding:"6px 12px",fontSize:11}} onClick={doLogout}>Déconnexion</button></>:
            <button className="btn btn-s" style={{fontSize:12,padding:"8px 14px"}} onClick={()=>setAuth("login")}>Connexion</button>}
          {user&&<button className="btn btn-p" style={{fontSize:12,padding:"10px 20px"}} onClick={()=>setPg("app")}>Ouvrir l'app</button>}
        </div></nav>

      {pg==="guide"?(<main className="section" style={{maxWidth:800,margin:"0 auto",padding:"40px 28px",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div className="badge bt" style={{marginBottom:12}}>Guide complet</div>
          <h1 className="section-t" style={{fontSize:32,fontWeight:800,color:"#f1f5f9",letterSpacing:"-1px",marginBottom:8}}>Comment utiliser Veilora</h1>
          <p style={{fontSize:15,color:"#475569",maxWidth:500,margin:"0 auto"}}>De l'inscription au téléchargement, tout est expliqué en détail.</p></div>
        <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:50}}>
          {GUIDE.map((g,i)=><div key={i} style={{display:"flex",gap:20,alignItems:"flex-start",padding:"24px 28px",background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.05)",borderRadius:18,animation:`fadeUp .4s ease ${i*.08}s both`}}>
            <div style={{width:48,height:48,borderRadius:14,background:"rgba(13,148,136,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <IC d={g.icon} size={22} color="#2dd4bf"/></div>
            <div><div style={{fontSize:16,fontWeight:700,color:"#e2e8f0",marginBottom:6}}>{g.title}</div>
              <div style={{fontSize:14,color:"#64748b",lineHeight:1.8}}>{g.desc}</div></div></div>)}
        </div>
        <div style={{textAlign:"center",marginBottom:50}}>
          <h2 className="section-t" style={{fontSize:28,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.5px",marginBottom:28}}>Questions fréquentes</h2>
          {FAQ.map((g,i)=><div key={i} className="faq-item">
            <div className={`faq-q ${faqO===i?"open":""}`} onClick={()=>setFaqO(faqO===i?null:i)}>
              <span style={{flex:1,fontSize:14,fontWeight:600,color:faqO===i?"#2dd4bf":"#cbd5e1"}}>{g.q}</span>
              <span style={{fontSize:11,color:"#475569",transition:"transform .2s",transform:faqO===i?"rotate(180deg)":"",flexShrink:0}}>▼</span>
            </div>{faqO===i&&<div className="faq-a">{g.a}</div>}</div>)}</div>
        <div style={{textAlign:"center"}}><button className="btn btn-p" onClick={()=>{user?setPg("app"):setAuth("register")}} style={{borderRadius:14}}>{user?"Ouvrir l'app":"Créer un compte"}</button></div>
      </main>):(

        <main style={{position:"relative",zIndex:1}}>
          {/* HERO */}
          <section style={{padding:"80px 20px 60px",textAlign:"center",maxWidth:900,margin:"0 auto"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:100,border:"1px solid rgba(13,148,136,.15)",background:"rgba(13,148,136,.04)",fontSize:12,color:"#2dd4bf",fontWeight:600,marginBottom:28}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:"#2dd4bf",animation:"pulse 2s infinite"}}/>100% local — aucun fichier uploadé</div>
            <h1 className="hero-t" style={{fontSize:52,fontWeight:800,color:"#f1f5f9",lineHeight:1.08,letterSpacing:"-2.5px",marginBottom:20}}>
              Modifiez vos médias.<br/><span style={{background:"linear-gradient(135deg,#0d9488,#06b6d4,#22d3ee)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Invisiblement.</span></h1>
            <p className="hero-sub" style={{fontSize:16,color:"#475569",maxWidth:520,margin:"0 auto 32px",lineHeight:1.7}}>Veilora modifie les métadonnées, le GPS, le bruit visuel, le zoom et bien plus — pour que chaque export soit unique.</p>
            <div className="hero-btns" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn btn-p" onClick={()=>setAuth("register")} style={{padding:"15px 32px",fontSize:15,borderRadius:14}}>→ Commencer — 7.99€/mois</button>
              <button className="btn" onClick={()=>goStripe(STRIPE.lifetime)} style={{padding:"15px 28px",fontSize:14,borderRadius:14,background:"rgba(13,148,136,.08)",color:"#2dd4bf",fontWeight:700,border:"1px solid rgba(13,148,136,.2)",cursor:"pointer"}}>☆ À vie — 44.99€</button>
              <button className="btn btn-s" onClick={()=>setAuth("login")} style={{padding:"15px 22px",fontSize:14,borderRadius:14}}>→ Se connecter</button></div>
            <div style={{marginTop:14,fontSize:12,color:"#334155"}}>3 fichiers/jour gratuits • Aucune carte requise</div></section>

          {/* STATS */}
          <section className="live-stats section" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,maxWidth:700,margin:"0 auto 60px",padding:"0 20px"}}>
            {[{n:cFiles.toLocaleString(),l:"Fichiers traités"},{n:cVersions.toLocaleString(),l:"Versions générées"},{n:cUsers.toLocaleString(),l:"Utilisateurs actifs"}].map((s,i)=>(
              <div key={i} className="card" style={{padding:"20px 16px",textAlign:"center"}}>
                <div className="mono" style={{fontSize:22,fontWeight:800,color:"#f1f5f9"}}>{s.n}</div>
                <div style={{fontSize:11,color:"#475569",marginTop:4}}>{s.l}</div></div>))}</section>

          {/* BEFORE/AFTER */}
          <section className="section" style={{maxWidth:700,margin:"0 auto 60px",padding:"0 20px"}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <h2 className="section-t" style={{fontSize:28,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.5px",marginBottom:6}}>Vois la différence. Ou pas.</h2>
              <p style={{fontSize:14,color:"#475569"}}>Glisse le curseur — même image, hash complètement différent.</p></div>
            <div className="ba-container" onMouseMove={e=>{const r=e.currentTarget.getBoundingClientRect();setBaSlider(Math.max(5,Math.min(95,((e.clientX-r.left)/r.width)*100)))}} onTouchMove={e=>{e.preventDefault();const r=e.currentTarget.getBoundingClientRect();const t=e.touches[0];setBaSlider(Math.max(5,Math.min(95,((t.clientX-r.left)/r.width)*100)))}}>
              <div style={{position:"absolute",inset:0}}>
                <img src="/demo.png" alt="V" style={{width:"100%",height:"100%",objectFit:"cover",filter:"brightness(1.03) saturate(1.08) hue-rotate(4deg)"}}/>
                <div style={{position:"absolute",top:12,right:12,zIndex:4,padding:"4px 10px",borderRadius:8,background:"rgba(13,148,136,.12)",border:"1px solid rgba(45,212,191,.2)",backdropFilter:"blur(8px)"}}><div className="mono" style={{fontSize:10,color:"#2dd4bf"}}>SHA-256: e91b...f8a4</div></div></div>
              <div style={{position:"absolute",top:0,bottom:0,left:0,width:`${baSlider}%`,overflow:"hidden",zIndex:2}}>
                <div style={{position:"absolute",inset:0,width:`${10000/Math.max(baSlider,1)}%`}}>
                  <img src="/demo.png" alt="O" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div style={{position:"absolute",top:12,left:12,zIndex:4,padding:"4px 10px",borderRadius:8,background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)"}}><div className="mono" style={{fontSize:10,color:"#94a3b8"}}>SHA-256: 7f3a...c2d1</div></div></div></div>
              <div className="ba-slider" style={{left:`${baSlider}%`,transform:"translateX(-50%)"}}/>
              <div style={{position:"absolute",bottom:12,left:14,zIndex:4,fontSize:11,fontWeight:700,color:"#fff",background:"rgba(0,0,0,.6)",padding:"5px 12px",borderRadius:8,backdropFilter:"blur(8px)"}}>ORIGINAL</div>
              <div style={{position:"absolute",bottom:12,right:14,zIndex:4,fontSize:11,fontWeight:700,color:"#2dd4bf",background:"rgba(0,0,0,.6)",padding:"5px 12px",borderRadius:8,backdropFilter:"blur(8px)"}}>VERSION</div></div></section>

          {/* NUMBERS */}
          <section className="nums-grid section" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,maxWidth:700,margin:"0 auto 60px",padding:"0 20px"}}>
            {[{n:"100",l:"Versions max"},{n:"13",l:"Transformations"},{n:"22",l:"Localisations GPS"},{n:"8",l:"Fake Devices"}].map((s,i)=>(
              <div key={i} style={{textAlign:"center"}}><div style={{fontSize:36,fontWeight:800,color:"#f1f5f9",letterSpacing:"-1px"}}>{s.n}</div><div style={{fontSize:11,color:"#475569",marginTop:2}}>{s.l}</div></div>))}</section>

          {/* FEATURES */}
          <section className="section" style={{maxWidth:900,margin:"0 auto 60px",padding:"0 20px"}}>
            <div style={{textAlign:"center",marginBottom:32}}>
              <div className="badge bt" style={{marginBottom:12}}>Fonctionnalités</div>
              <h2 className="section-t" style={{fontSize:28,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.5px",marginBottom:6}}>Tout ce dont vous avez besoin</h2>
              <p style={{fontSize:14,color:"#475569",maxWidth:500,margin:"0 auto"}}>Un outil complet pour modifier, anonymiser et diversifier vos médias en quelques clics.</p></div>
            <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {FEATURES.map((f,i)=>(<div key={i} className="feat-card">
                <div className="feat-icon"><IC d={f.ic} size={22} color="#2dd4bf"/></div>
                <div style={{fontSize:15,fontWeight:700,color:"#e2e8f0",marginBottom:6}}>{f.t}</div>
                <div style={{fontSize:13,color:"#64748b",lineHeight:1.7}}>{f.d}</div></div>))}</div></section>

          {/* CONTENT STUDIO SHOWCASE */}
          <section className="section" style={{maxWidth:700,margin:"0 auto 60px",padding:"0 20px"}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <div className="badge bt" style={{marginBottom:12}}>Nouveau — IA int&eacute;gr&eacute;e</div>
              <h2 className="section-t" style={{fontSize:28,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.5px",marginBottom:6}}>Content Studio</h2>
              <p style={{fontSize:14,color:"#475569",maxWidth:500,margin:"0 auto"}}>G&eacute;n&egrave;re tout le contenu dont tu as besoin pour tes Reels, directement dans l'app.</p></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:20}}>
              {[{ic:"\ud83d\udcdd",t:"Captions",d:"3 captions avec hook, CTA et hashtags"},{ic:"\ud83c\udfaf",t:"Titres & Hooks",d:"10 titres accrocheurs pour tes Reels"},{ic:"#\ufe0f\u20e3",t:"Hashtags",d:"30 hashtags mix gros/moyens/petits"},{ic:"\ud83c\udfac",t:"Scripts",d:"Script Reel 30-60s avec montage"},{ic:"\ud83d\udc64",t:"Bios",d:"5 bios optimis\u00e9es avec emojis"}].map((c,i)=>
                <div key={i} className="feat-card" style={{padding:"18px 14px",textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:8}}>{c.ic}</div>
                  <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>{c.t}</div>
                  <div style={{fontSize:10,color:"#64748b",lineHeight:1.5}}>{c.d}</div></div>)}</div>
            <div className="card" style={{padding:"24px 22px"}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:16}}>
                <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#0d9488,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{"\u270d\ufe0f"}</div>
                <div><div style={{fontSize:15,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>Comment &ccedil;a marche ?</div>
                  <div style={{fontSize:13,color:"#64748b",lineHeight:1.8}}>Dans l'app, clique sur l'onglet <span style={{color:"#2dd4bf",fontWeight:600}}>Content Studio</span>. Choisis le type de contenu, entre ta niche (fitness, crypto, mode...), s&eacute;lectionne ta plateforme et ton style. L'IA g&eacute;n&egrave;re ton contenu en quelques secondes. Copie en 1 clic et colle directement dans ton post.</div></div></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {["Instagram","TikTok","YouTube Shorts","X/Twitter"].map((p,i)=><span key={i} className="badge bt" style={{fontSize:10}}>{p}</span>)}
                {["Pro","Fun","Story","Viral","Edgy"].map((t,i)=><span key={i} className="badge" style={{background:"rgba(255,255,255,.04)",color:"#94a3b8",fontSize:10}}>{t}</span>)}</div></div></section>

          {/* HASH CHECKER */}
          <section className="section" style={{maxWidth:600,margin:"0 auto 60px",padding:"0 20px"}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div className="badge bt" style={{marginBottom:12}}>Outil gratuit</div>
              <h2 className="section-t" style={{fontSize:28,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.5px",marginBottom:6}}>Hash Checker</h2>
              <p style={{fontSize:14,color:"#475569"}}>Drop 2 fichiers — compare leur hash instantanément.</p></div>
            <div className="card" style={{padding:"28px 24px"}}>
              <div className="hc-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                {[0,1].map(idx=><div key={idx} onClick={()=>hcPick(idx)} style={{padding:"28px 16px",borderRadius:16,border:"2px dashed rgba(255,255,255,.06)",textAlign:"center",cursor:"pointer",background:hcFiles[idx]?"rgba(13,148,136,.03)":"transparent",borderColor:hcFiles[idx]?"rgba(13,148,136,.2)":"rgba(255,255,255,.06)",transition:"all .15s"}}>
                  <div style={{marginBottom:6}}><IC d={hcFiles[idx]?"M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z":"M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"} size={24} color={hcFiles[idx]?"#2dd4bf":"#475569"}/></div>
                  <div style={{fontSize:12,fontWeight:600,color:hcFiles[idx]?"#2dd4bf":"#475569",wordBreak:"break-all"}}>{hcFiles[idx]?hcFiles[idx].name:`Fichier ${idx+1}`}</div>
                  <input ref={idx===0?hcRef1:hcRef2} type="file" accept="image/*" style={{display:"none"}} onChange={e=>hcLoad(idx,e)}/></div>)}</div>
              {hcResult&&<div>
                <div className="hc-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                  {[{h:hcResult.h1,s:hcResult.s1,l:"Hash fichier 1"},{h:hcResult.h2,s:hcResult.s2,l:"Hash fichier 2"}].map((x,i)=><div key={i} style={{padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,.02)"}}>
                    <div style={{fontSize:10,color:"#475569",textTransform:"uppercase",marginBottom:4,letterSpacing:".5px"}}>{x.l}</div>
                    <div className="mono" style={{fontSize:11,color:"#94a3b8",wordBreak:"break-all"}}>{x.h}...</div>
                    <div style={{fontSize:11,color:"#475569",marginTop:4}}>{x.s}</div></div>)}</div>
                <div style={{textAlign:"center",padding:"16px 18px",borderRadius:14,background:hcResult.match?"rgba(248,113,113,.05)":"rgba(45,212,191,.05)",border:`1px solid ${hcResult.match?"rgba(248,113,113,.12)":"rgba(45,212,191,.12)"}`}}>
                  <div style={{fontSize:16,fontWeight:700,color:hcResult.match?"#f87171":"#2dd4bf"}}>{hcResult.match?"⚠ Doublon détectable":"✓ Fichiers uniques"}</div></div>
                <button className="btn btn-s" onClick={()=>{setHcFiles([null,null]);setHcResult(null)}} style={{width:"100%",marginTop:12}}>Réinitialiser</button></div>}</div></section>

          {/* PRICING */}
          <section className="section" style={{maxWidth:860,margin:"0 auto 60px",padding:"0 20px"}}>
            <div style={{textAlign:"center",marginBottom:32}}>
              <h2 className="section-t" style={{fontSize:28,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.5px",marginBottom:6}}>Prêt à commencer ?</h2>
              <p style={{fontSize:14,color:"#475569"}}>Choisissez l'offre qui vous convient.</p></div>
            <div className="price-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
              <div className="prc"><div style={{fontSize:17,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>Free</div><div style={{fontSize:36,fontWeight:800,color:"#f1f5f9",letterSpacing:"-1px"}}>0€</div><div style={{fontSize:12,color:"#475569",marginBottom:18}}>Pour tester</div>
                {["3 fichiers/jour","5 versions max","4 transformations"].map((f,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}><IC d="M5 13l4 4L19 7" size={14} color="#2dd4bf"/><span style={{fontSize:13,color:"#94a3b8"}}>{f}</span></div>)}
                <button className="btn btn-s" style={{width:"100%",marginTop:18,padding:12}} onClick={()=>setAuth("register")}>Commencer</button></div>
              <div className="prc ft"><div style={{fontSize:17,fontWeight:700,color:"#2dd4bf",marginBottom:4}}>Pro</div><div style={{fontSize:36,fontWeight:800,color:"#f1f5f9",letterSpacing:"-1px"}}>7.99€<span style={{fontSize:13,color:"#64748b",fontWeight:500}}>/mois</span></div><div style={{fontSize:12,color:"#475569",marginBottom:18}}>Sans engagement</div>
                {["Fichiers illimités","100 versions","13 transformations","GPS + Fake Device","Webhooks Discord/TG","Content Studio IA"].map((f,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}><IC d="M5 13l4 4L19 7" size={14} color="#2dd4bf"/><span style={{fontSize:13,color:"#e2e8f0"}}>{f}</span></div>)}
                <button className="btn btn-p" style={{width:"100%",marginTop:18,padding:12}} onClick={()=>goStripe(STRIPE.monthly)}>S'abonner</button></div>
              <div className="prc lt"><div style={{fontSize:17,fontWeight:700,color:"#06b6d4",marginBottom:4}}>À Vie</div><div style={{fontSize:36,fontWeight:800,color:"#f1f5f9",letterSpacing:"-1px"}}>44.99€</div><div style={{fontSize:12,color:"#475569",marginBottom:18}}>Paiement unique</div>
                {["Tout le Pro","Pour toujours","Mises à jour incluses","Support prioritaire"].map((f,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}><IC d="M5 13l4 4L19 7" size={14} color="#06b6d4"/><span style={{fontSize:13,color:"#e2e8f0"}}>{f}</span></div>)}
                <button className="btn" style={{width:"100%",marginTop:18,padding:12,borderRadius:12,background:"rgba(6,182,212,.1)",color:"#22d3ee",fontWeight:700,fontSize:13,border:"1px solid rgba(6,182,212,.2)",cursor:"pointer"}} onClick={()=>goStripe(STRIPE.lifetime)}>Acheter à vie</button></div></div>
            <div style={{textAlign:"center",marginTop:14,fontSize:12,color:"#334155"}}>🔒 Paiement sécurisé par Stripe</div></section>

          {/* TESTIMONIALS */}
          <section className="section" style={{maxWidth:900,margin:"0 auto 60px",padding:"0 20px"}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <h2 className="section-t" style={{fontSize:28,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.5px"}}>Ils utilisent Veilora</h2></div>
            <div className="testi-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
              {TESTI.map((t,i)=>(<div key={i} className="card" style={{padding:"22px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"rgba(13,148,136,.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{t.a}</div>
                  <div><div style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>{t.n}</div><div style={{fontSize:11,color:"#475569"}}>{t.r}</div></div></div>
                <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>"{t.t}"</div></div>))}</div></section>

          {/* CTA FINAL */}
          <section style={{textAlign:"center",padding:"40px 20px 70px",maxWidth:600,margin:"0 auto"}}>
            <h2 style={{fontSize:24,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.5px",marginBottom:10}}>Prêt à commencer ?</h2>
            <p style={{fontSize:14,color:"#475569",marginBottom:24}}>Créez votre compte et accédez à Veilora en quelques secondes.</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn btn-p" onClick={()=>setAuth("register")} style={{padding:"14px 28px",fontSize:15,borderRadius:14}}>→ Commencer gratuitement</button>
              <button className="btn" onClick={()=>goStripe(STRIPE.lifetime)} style={{padding:"14px 24px",fontSize:14,borderRadius:14,background:"rgba(13,148,136,.08)",color:"#2dd4bf",fontWeight:700,border:"1px solid rgba(13,148,136,.2)",cursor:"pointer"}}>☆ À vie — 44.99€</button></div></section>
        </main>)}
      <footer style={{padding:"20px 28px",borderTop:"1px solid rgba(255,255,255,.04)",textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{fontSize:11,color:"#1e293b"}}>Veilora © 2026 — Par Alkyma Agency</div></footer></div>);

  function PricingModal({close}){return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",backdropFilter:"blur(20px)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={close}><div onClick={e=>e.stopPropagation()} style={{maxWidth:860,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
    <div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:24,fontWeight:800,color:"#fff",letterSpacing:"-.5px"}}>Choisis ton plan</div></div>
    <div className="price-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
      <div className="prc"><div style={{fontSize:16,fontWeight:700,color:"#e2e8f0"}}>Free</div><div style={{fontSize:32,fontWeight:800,color:"#fff"}}>0€</div>
        <button className="btn btn-s" style={{width:"100%",marginTop:14,padding:12}} onClick={close}>Continuer Free</button></div>
      <div className="prc ft"><div style={{fontSize:16,fontWeight:700,color:"#2dd4bf"}}>Pro</div><div style={{fontSize:32,fontWeight:800,color:"#fff"}}>7.99€<span style={{fontSize:12,color:"#64748b"}}>/mois</span></div>
        <button className="btn btn-p" style={{width:"100%",marginTop:14,padding:12}} onClick={()=>goStripe(STRIPE.monthly)}>S'abonner</button></div>
      <div className="prc lt"><div style={{fontSize:16,fontWeight:700,color:"#06b6d4"}}>À Vie</div><div style={{fontSize:32,fontWeight:800,color:"#fff"}}>44.99€</div>
        <button className="btn" style={{width:"100%",marginTop:14,padding:12,borderRadius:12,background:"rgba(6,182,212,.1)",color:"#22d3ee",fontWeight:700,fontSize:13,border:"1px solid rgba(6,182,212,.2)",cursor:"pointer"}} onClick={()=>goStripe(STRIPE.lifetime)}>Acheter</button></div></div>
    <button className="btn btn-s" onClick={close} style={{width:"100%",marginTop:14}}>Fermer</button></div></div>}

  /* ===== APP ===== */
  return(
    <div style={{minHeight:"100vh",height:"100vh",display:"flex",flexDirection:"column",background:"#050809",color:"#94a3b8",overflowX:"hidden"}}><style>{S}</style>
      <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",background:"radial-gradient(ellipse 60% 40% at 50% 0%,rgba(13,148,136,.04),transparent)"}}/>
      {pricing&&<PricingModal close={()=>setPricing(false)}/>}
      {auth&&<AuthModal mode={auth} onClose={()=>{setAuth(null);setPendingStripe(null)}} onSuccess={()=>{setAuth(null);if(pendingStripe){window.open(pendingStripe,"_blank");setPendingStripe(null)}}}/>}
      {preview&&(<div className="ov" onClick={()=>setPreview(null)}><div onClick={e=>e.stopPropagation()} style={{maxWidth:700,width:"100%"}}>
        <div style={{display:"flex",gap:6,marginBottom:12,justifyContent:"center"}}>{["split","blink","overlay"].map(m=><button key={m} className="btn btn-s" onClick={()=>setDm(m)} style={{padding:"6px 14px",fontSize:11,background:dm===m?"rgba(13,148,136,.1)":"rgba(255,255,255,.03)",color:dm===m?"#2dd4bf":"#64748b"}}>{m}</button>)}</div>
        {dm==="split"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}><div>{thumbs[preview.origId]&&<img src={thumbs[preview.origId]} style={{width:"100%",borderRadius:12}}/>}</div><div>{preview.thumb&&<img src={preview.thumb} style={{width:"100%",borderRadius:12}}/>}</div></div>}
        {dm==="blink"&&<div style={{marginBottom:10,textAlign:"center",position:"relative"}}>{thumbs[preview.origId]&&<img src={thumbs[preview.origId]} style={{maxWidth:"100%",maxHeight:350,borderRadius:12}}/>}{preview.thumb&&<img src={preview.thumb} style={{position:"absolute",left:0,top:0,maxWidth:"100%",maxHeight:350,borderRadius:12,animation:"blink 1.2s infinite"}}/>}</div>}
        {dm==="overlay"&&<div style={{marginBottom:10,position:"relative"}}>{thumbs[preview.origId]&&<img src={thumbs[preview.origId]} style={{width:"100%",maxHeight:350,objectFit:"contain",borderRadius:12}}/>}{preview.thumb&&<img src={preview.thumb} style={{position:"absolute",inset:0,width:"100%",maxHeight:350,objectFit:"contain",borderRadius:12,opacity:.5,mixBlendMode:"difference"}}/>}</div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6,marginBottom:10}}>{[{l:"Hash Orig",v:preview.origHash,c:"#94a3b8"},{l:"Hash New",v:preview.hash,c:"#2dd4bf"},{l:"Size",v:`${preview.w}×${preview.h}`,c:"#22d3ee"},{l:"Diff",v:preview.similarity+"%",c:preview.similarity>50?"#f87171":"#2dd4bf"}].map((s,i)=><div key={i} style={{background:"rgba(255,255,255,.02)",padding:10,borderRadius:10}}><div style={{fontSize:9,color:"#475569",textTransform:"uppercase",letterSpacing:".5px"}}>{s.l}</div><div className="mono" style={{fontSize:13,fontWeight:700,color:s.c,marginTop:2}}>{s.v}</div></div>)}</div>
        <div style={{display:"flex",gap:8,justifyContent:"center"}}><button className="btn btn-p" style={{padding:"10px 22px"}} onClick={()=>{dl(preview);setPreview(null)}}>📥 Download</button><button className="btn btn-s" onClick={()=>setPreview(null)}>Fermer</button></div></div></div>)}
      {panel&&(<div className="ov" onClick={()=>setPanel(null)}><div onClick={e=>e.stopPropagation()} style={{maxWidth:460,width:"100%",maxHeight:"85vh",overflowY:"auto",background:"linear-gradient(180deg,#0a1014,#080c10)",border:"1px solid rgba(255,255,255,.08)",borderRadius:22,padding:"28px 24px"}}>
        {panel==="audit"&&<><h3 style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:14}}>🛡️ Privacy Audit</h3>{[{l:"EXIF",s:tf.metadata},{l:"GPS",s:tf.location},{l:"Device",s:tf.metaTemplate},{l:"Timeline",s:tf.fakeTimeline},{l:"Filename",s:tf.randomName},{l:"Pixels",s:tf.crop||tf.colors||tf.noise},{l:"Couleurs",s:tf.colors||tf.lut}].map((a,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,.02)",marginBottom:4}}><span style={{fontSize:13,color:"#94a3b8"}}>{a.l}</span><span style={{fontSize:12,fontWeight:600,color:a.s?"#2dd4bf":"#fbbf24"}}>{a.s?"✓":"⚠"}</span></div>)}
          <div style={{marginTop:12,padding:14,borderRadius:10,background:activeT>=10?"rgba(45,212,191,.04)":"rgba(251,191,36,.04)"}}><div style={{fontSize:14,fontWeight:700,color:activeT>=10?"#2dd4bf":"#fbbf24"}}>Protection: {Math.round(activeT/Object.keys(TF).length*100)}%</div></div></>}
        {panel==="webhook"&&<><h3 style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:14}}>🔗 Webhooks</h3>
          <div style={{display:"flex",gap:6,marginBottom:12}}>{["discord","telegram"].map(t=><button key={t} className="btn btn-s" onClick={()=>setWh(w=>({...w,type:t}))} style={{flex:1,padding:10,fontSize:12,background:wh.type===t?"rgba(13,148,136,.08)":"rgba(255,255,255,.02)",color:wh.type===t?"#2dd4bf":"#64748b"}}>{t}</button>)}</div>
          <input style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",color:"#e2e8f0",fontSize:"16px",outline:"none",fontFamily:"inherit",WebkitAppearance:"none",marginBottom:12}} placeholder={wh.type==="discord"?"URL webhook Discord":"Chat ID Telegram"} value={wh.type==="discord"?wh.discord:wh.telegram} onChange={e=>setWh(w=>({...w,[w.type]:e.target.value}))}/>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12}}>
            <div onClick={()=>setWh(w=>({...w,on:!w.on}))} style={{width:46,height:26,borderRadius:13,background:wh.on?"linear-gradient(135deg,#0d9488,#06b6d4)":"rgba(255,255,255,.1)",cursor:"pointer",position:"relative"}}>
              <div style={{width:22,height:22,borderRadius:11,background:"#fff",position:"absolute",top:2,left:wh.on?22:2,transition:"left .15s"}}/></div>
            <span style={{fontSize:13,color:wh.on?"#2dd4bf":"#64748b"}}>{wh.on?"Activé":"Désactivé"}</span></div>
          <button className="btn btn-p" style={{width:"100%",padding:12}}>Sauvegarder</button></>}
        {panel==="history"&&<><h3 style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:14}}>📋 Historique</h3>{!hist.length&&<div style={{color:"#475569",fontSize:13}}>Aucun traitement</div>}{hist.map((h,i)=><div key={i} style={{padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,.02)",marginBottom:4}}><div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{h.files} fichiers → {h.versions}v • {h.time}</div><div style={{fontSize:11,color:"#475569"}}>{h.date}</div></div>)}</>}
        <button className="btn btn-s" onClick={()=>setPanel(null)} style={{marginTop:12,width:"100%"}}>Fermer</button></div></div>)}

      <header className="app-header" style={{padding:"12px 18px",borderBottom:"1px solid rgba(255,255,255,.05)",flexShrink:0,position:"relative",zIndex:2}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",minWidth:0}} onClick={()=>setPg("landing")}>
            <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#0d9488,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}><img src="/logo.png" style={{width:"100%",height:"100%",objectFit:"contain"}} alt="V"/></div>
            <span style={{fontWeight:800,fontSize:15,color:"#f1f5f9",letterSpacing:"-.8px"}}>Veilora</span>
            {user&&(pro?<span className="badge bt" style={{fontSize:9}}>PRO</span>:<span className="badge ba" style={{fontSize:9}}>FREE {du}/{FREE_LIMIT}</span>)}</div>
          <div className="app-header-btns" style={{display:"flex",gap:4,alignItems:"center"}}>
            <button className="btn btn-s" style={{padding:"5px 8px",fontSize:10}} onClick={()=>setPanel("audit")}>🛡️</button>
            <button className="btn btn-s" style={{padding:"5px 8px",fontSize:10}} onClick={()=>setPanel("webhook")}>🔗</button>
            <button className="btn btn-s" style={{padding:"5px 8px",fontSize:10}} onClick={()=>setPanel("history")}>📋</button>
            {!pro&&user&&<button className="btn" style={{padding:"5px 10px",fontSize:10,borderRadius:8,background:"linear-gradient(135deg,#0d9488,#06b6d4)",color:"#fff",fontWeight:700,border:"none"}} onClick={()=>setPricing(true)}>⚡ Pro</button>}
            {user&&<button className="btn btn-s" style={{padding:"5px 8px",fontSize:10}} onClick={doLogout}>Déco</button>}
            {files.length>0&&<button className="btn btn-s" style={{padding:"5px 8px",fontSize:10,color:"#f87171"}} onClick={clr}>✕</button>}</div></div></header>

      <main style={{flex:1,overflow:"auto",padding:"16px 18px",position:"relative",zIndex:1}}>
        <div style={{display:"flex",gap:4,background:"rgba(255,255,255,.02)",padding:3,borderRadius:10,maxWidth:420,margin:"0 auto 14px",border:"1px solid rgba(255,255,255,.05)"}}>
          {[["photo","\ud83d\udcf8 Photos"],["video","\ud83c\udfac Vid\u00e9os"],["studio","\u270d\ufe0f Content Studio"]].map(([m,l])=><button key={m} className="btn" onClick={()=>{if(m==="studio"){if(!pro){setPricing(true);return}setMode(m)}else{setMode(m);clr()}}} style={{flex:1,padding:"8px 0",fontSize:11,fontWeight:700,borderRadius:8,background:mode===m?"linear-gradient(135deg,#0d9488,#06b6d4)":"transparent",color:mode===m?"#fff":"#64748b",opacity:m==="studio"&&!pro?.5:1}}>{l}{m==="studio"&&!pro&&" \ud83d\udd12"}</button>)}</div>

        {mode==="studio"&&pro&&(<div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{width:52,height:52,borderRadius:16,background:"linear-gradient(135deg,#0d9488,#06b6d4)",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:10}}>{"\u270d\ufe0f"}</div>
            <h2 style={{fontSize:22,fontWeight:800,color:"#f1f5f9",letterSpacing:"-.5px",marginBottom:4}}>Content Studio</h2>
            <p style={{fontSize:13,color:"#475569"}}>G\u00e9n\u00e8re des captions, titres, hashtags, scripts et bios avec l'IA</p></div>

          <div className="card" style={{padding:"24px 20px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Type de contenu</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
              {[{id:"caption",l:"\ud83d\udcdd Captions",d:"3 captions compl\u00e8tes"},{id:"title",l:"\ud83c\udfaf Titres",d:"10 hooks accrocheurs"},{id:"hashtag",l:"# Hashtags",d:"30 hashtags optimis\u00e9s"},{id:"script",l:"\ud83c\udfac Script",d:"Script Reel 30-60s"},{id:"bio",l:"\ud83d\udc64 Bio",d:"5 bios percutantes"}].map(t=>
                <div key={t.id} onClick={()=>setCs(p=>({...p,type:t.id,result:"",copied:false}))} className="pc" style={{padding:"14px 8px",borderColor:cs.type===t.id?"rgba(13,148,136,.4)":"transparent",background:cs.type===t.id?"rgba(13,148,136,.06)":"rgba(255,255,255,.02)"}}>
                  <div style={{fontSize:16,marginBottom:2}}>{t.l.split(" ")[0]}</div>
                  <div style={{fontSize:10,fontWeight:700,color:cs.type===t.id?"#2dd4bf":"#94a3b8"}}>{t.l.split(" ").slice(1).join(" ")}</div>
                  <div style={{fontSize:9,color:"#475569",marginTop:2}}>{t.d}</div></div>)}</div></div>

          <div className="card" style={{padding:"20px 20px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Ta niche / sujet</div>
            <input style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,.08)",background:"rgba(255,255,255,.03)",color:"#e2e8f0",fontSize:"16px",outline:"none",fontFamily:"inherit",WebkitAppearance:"none",boxSizing:"border-box"}} placeholder="Ex: fitness, crypto, cuisine, mode, voyage, immobilier..." value={cs.niche} onChange={e=>setCs(p=>({...p,niche:e.target.value}))}/>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
            <div className="card" style={{padding:"16px 14px"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Plateforme</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {[{id:"instagram",l:"\ud83d\udcf8 Instagram"},{id:"tiktok",l:"\ud83c\udfb5 TikTok"},{id:"youtube",l:"\u25b6 YT Shorts"},{id:"twitter",l:"\ud83d\udc26 X/Twitter"}].map(p=>
                  <button key={p.id} className={`lb ${cs.platform===p.id?"on":""}`} onClick={()=>setCs(pr=>({...pr,platform:p.id}))} style={{padding:"6px 10px",fontSize:11,textAlign:"left"}}>{p.l}</button>)}</div></div>

            <div className="card" style={{padding:"16px 14px"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Ton / Style</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {[{id:"pro",l:"\ud83d\udcbc Pro"},{id:"fun",l:"\ud83d\ude04 Fun"},{id:"storytelling",l:"\ud83d\udcd6 Story"},{id:"viral",l:"\ud83d\udd25 Viral"},{id:"edgy",l:"\u26a1 Edgy"}].map(t=>
                  <button key={t.id} className={`lb ${cs.tone===t.id?"on":""}`} onClick={()=>setCs(p=>({...p,tone:t.id}))} style={{padding:"6px 10px",fontSize:11,textAlign:"left"}}>{t.l}</button>)}</div></div>

            <div className="card" style={{padding:"16px 14px"}}>
              <div style={{fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Langue</div>
              <div style={{display:"flex",flexDirection:"column",gap:3}}>
                {[{id:"fr",l:"\ud83c\uddeb\ud83c\uddf7 Fran\u00e7ais"},{id:"en",l:"\ud83c\uddec\ud83c\udde7 English"}].map(l=>
                  <button key={l.id} className={`lb ${cs.lang===l.id?"on":""}`} onClick={()=>setCs(p=>({...p,lang:l.id}))} style={{padding:"6px 10px",fontSize:11,textAlign:"left"}}>{l.l}</button>)}</div></div></div>

          <button className="btn btn-p" onClick={generateContent} disabled={cs.loading||!cs.niche.trim()} style={{width:"100%",padding:16,fontSize:15,borderRadius:14,opacity:cs.loading||!cs.niche.trim()?.5:1}}>
            {cs.loading?"\u23f3 G\u00e9n\u00e9ration en cours...":"\u2728 G\u00e9n\u00e9rer"}</button>

          {cs.result&&<div className="card" style={{padding:"20px 20px",marginTop:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:15,fontWeight:700,color:"#e2e8f0"}}>{"\u2728"} R\u00e9sultat</span>
                <span className="badge bt">{cs.type==="caption"?"Captions":cs.type==="title"?"Titres":cs.type==="hashtag"?"Hashtags":cs.type==="script"?"Script":"Bios"}</span></div>
              <div style={{display:"flex",gap:4}}>
                <button className="btn btn-s" style={{padding:"6px 14px",fontSize:11}} onClick={()=>{navigator.clipboard.writeText(cs.result);setCs(p=>({...p,copied:true}))}}>{cs.copied?"\u2713 Copi\u00e9":"\ud83d\udccb Copier"}</button>
                <button className="btn btn-s" style={{padding:"6px 14px",fontSize:11}} onClick={()=>setCs(p=>({...p,result:"",copied:false}))}>{"\ud83d\udd04"}</button></div></div>
            <div style={{padding:"18px 20px",borderRadius:14,background:"rgba(255,255,255,.015)",border:"1px solid rgba(255,255,255,.04)",fontSize:13,color:"#cbd5e1",lineHeight:1.9,whiteSpace:"pre-wrap",maxHeight:400,overflowY:"auto"}}>{cs.result}</div></div>}
        </div>)}

        {mode!=="studio"&&<><div className="preset-grid" style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5,maxWidth:500,margin:"0 auto 14px"}}>
          {PRESETS.map(p=><div key={p.id} className={`pc ${preset?.id===p.id?"on":""}`} onClick={()=>applyP(p)}>
            <div style={{fontSize:18,marginBottom:1}}>{p.icon}</div>
            <div style={{fontSize:10,fontWeight:700,color:preset?.id===p.id?"#2dd4bf":"#64748b"}}>{p.name}</div></div>)}</div>

        {res.length>0&&<div style={{display:"flex",gap:6,marginBottom:12,justifyContent:"center"}}>
          <button className={`btn ${vw==="config"?"btn-p":"btn-s"}`} style={{padding:"7px 16px",fontSize:11}} onClick={()=>setVw("config")}>{"\u2699\ufe0f"} Config</button>
          <button className={`btn ${vw==="results"?"btn-p":"btn-s"}`} style={{padding:"7px 16px",fontSize:11}} onClick={()=>setVw("results")}>{"\u2713"} R\u00e9sultats ({totV})</button></div>}

        {vw==="config"&&(<div className="app-layout" style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:14}}>
          <aside className="app-side" style={{display:"flex",flexDirection:"column",gap:8}}>
            <div className="card" style={{padding:"14px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>🎚️ Humanizer</span><span style={{fontSize:12,fontWeight:700,color:iC}}>{iL}</span></div>
              <input type="range" className="slider" min="0" max="1" step=".01" value={inten} onChange={e=>setInten(+e.target.value)}/></div>
            <div className="card" style={{padding:"12px 16px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:700,color:"#e2e8f0"}}>Versions</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <button className="cnt" onClick={()=>setVer(v=>Math.max(1,v-1))}>−</button>
                  <div className="mono" style={{fontSize:22,fontWeight:700,color:"#2dd4bf",width:36,textAlign:"center"}}>{ver}</div>
                  <button className="cnt" onClick={()=>setVer(v=>Math.min(pro?100:5,v+1))}>+</button></div></div>
              <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{[1,5,10,20,50,100].map(n=><button key={n} className="btn btn-s" onClick={()=>{if(!pro&&n>5){setPricing(true);return}setVer(n)}} style={{padding:"4px 8px",fontSize:10,fontWeight:700,background:ver===n?"rgba(13,148,136,.1)":"rgba(255,255,255,.02)",color:ver===n?"#2dd4bf":"#64748b",opacity:!pro&&n>5?.3:1}}>{n}</button>)}</div></div>
            {tf.location&&<div className="card" style={{padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:6}}>📍 GPS Spoofing</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{LOCS.map((l,i)=><button key={i} className={`lb ${loc.city===l.city?"on":""}`} onClick={()=>{if(!pro&&i>3){setPricing(true);return}setLoc(l)}} style={{padding:"5px 10px",fontSize:10,opacity:!pro&&i>3?.3:1}}>{l.city}</button>)}</div></div>}
            {tf.metaTemplate&&<div className="card" style={{padding:"12px 14px"}}>
              <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",marginBottom:6}}>🧹 Fake Device</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3}}>{MTPL.map((m,i)=><button key={m.id} className={`lb ${mtpl.id===m.id?"on":""}`} onClick={()=>{if(!pro&&i>2){setPricing(true);return}setMtpl(m)}} style={{padding:"5px 10px",fontSize:10,opacity:!pro&&i>2?.3:1}}>{m.name}</button>)}</div></div>}
            <div className="card" style={{padding:"10px 10px",flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"0 6px",marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:"#e2e8f0"}}>Transformations</span>
                <span className="badge bt" style={{fontSize:10}}>{activeT}</span></div>
              <div style={{maxHeight:250,overflowY:"auto"}}>{Object.entries(TF).map(([k,m])=>{const on=tf[k];const lk=!pro&&m.p;return(
                <div key={k} className={`chk ${on&&!lk?"on":""}`} onClick={()=>{if(lk){setPricing(true);return}setTf2(t=>({...t,[k]:!t[k]}))}} style={{opacity:lk?.25:1,padding:"7px 10px"}}>
                  <div className={`dot ${on&&!lk?"on":""}`} style={{width:16,height:16,fontSize:9}}>{on&&!lk?"✓":lk?"🔒":""}</div>
                  <div style={{fontSize:12,fontWeight:600,color:on&&!lk?"#2dd4bf":"#64748b"}}>{m.i} {m.l}</div></div>)})}</div></div>
          </aside>

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);if(!ck())return;add(e.dataTransfer.files)}}
              onClick={()=>{if(!ck())return;ir.current?.click()}} className="card"
              style={{padding:files.length?"28px 16px":"52px 16px",textAlign:"center",cursor:"pointer",borderColor:drag?"rgba(13,148,136,.3)":undefined}}>
              <div style={{fontSize:files.length?24:42,marginBottom:8,animation:"float 3.5s ease infinite"}}>{drag?"📥":mode==="photo"?"📸":"🎬"}</div>
              <div style={{fontSize:15,fontWeight:700,color:"#f1f5f9",marginBottom:4}}>{drag?"Lâche ici":`Drop tes ${mode==="photo"?"photos":"vidéos"}`}</div>
              <div className="mono" style={{fontSize:12,color:"#334155"}}>{mode==="photo"?"JPG • PNG • WEBP":"MP4 • MOV • WEBM"}</div>
              <input ref={ir} type="file" multiple accept={mode==="photo"?"image/*":"video/*"} style={{display:"none"}} onChange={e=>{if(!ck())return;add(e.target.files)}}/></div>

            {files.length>0&&<div className="stat-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
              {[{l:"Fichiers",v:files.length,c:"#2dd4bf"},{l:"Versions",v:files.length*ver,c:"#a78bfa"},{l:"Taille",v:fb(files.reduce((a,f)=>a+f.size,0)),c:"#fbbf24"},{l:"Intensité",v:iL,c:iC}].map((s,i)=>(
                <div key={i} className="card" style={{padding:"10px 12px"}}><div style={{fontSize:9,color:"#334155",textTransform:"uppercase",letterSpacing:".5px"}}>{s.l}</div><div className="mono" style={{fontSize:16,fontWeight:700,color:s.c,marginTop:2}}>{s.v}</div></div>))}</div>}

            {files.length>0&&<div style={{flex:1,overflow:"auto"}}>{files.map(f=>(
              <div key={f.id} className="row" style={{padding:"10px 12px",gap:10}}>
                {thumbs[f.id]?<img src={thumbs[f.id]} className="thumb" style={{width:44,height:44}}/>:<div className="thumb" style={{width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎬</div>}
                <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.name}</div>
                  <div className="mono" style={{fontSize:11,color:"#475569"}}>{fb(f.size)} <span style={{color:"#2dd4bf"}}>→ ×{ver}</span></div></div>
                <button className="btn btn-s" style={{padding:"3px 8px",fontSize:10,color:"#f87171"}} onClick={()=>setFiles(p=>p.filter(x=>x.id!==f.id))}>✕</button></div>))}</div>}

            <button className="btn btn-p" onClick={run} disabled={proc||!files.length} style={{width:"100%",padding:14,fontSize:14,borderRadius:12}}>
              {proc?"⏳ Traitement...":`🔒 Traiter ${files.length||0} fichier${files.length>1?"s":""} → ${(files.length||0)*ver} versions`}</button>
          </div></div>)}

        {vw==="results"&&(<div>
          {proc&&<div className="card" style={{padding:"44px 20px",textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:28,marginBottom:10}}><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⚙️</span></div>
            <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:4}}>Randomisation en cours...</div>
            <div className="mono" style={{fontSize:12,color:"#475569",marginBottom:14}}>{prog.f} — v{prog.v}/{ver}</div>
            <div className="pbar" style={{maxWidth:400,margin:"0 auto"}}><div className="pfill" style={{width:`${prog.t?(prog.c/prog.t)*100:0}%`}}/></div></div>}
          {!proc&&totV>0&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,flexWrap:"wrap",gap:6}}>
            <span style={{fontSize:14,fontWeight:700,color:"#fff"}}>✓ {totV} versions uniques</span>
            <button className="btn btn-p" style={{padding:"8px 20px",fontSize:12}} onClick={dlAll}>📥 Tout télécharger</button></div>}
          {res.map((g,gi)=><div key={gi} className="card" style={{marginBottom:8}}>
            <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.04)",display:"flex",alignItems:"center",gap:10}}>
              {thumbs[g.orig.id]?<img src={thumbs[g.orig.id]} style={{width:38,height:38,borderRadius:8,objectFit:"cover"}}/>:null}
              <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600,color:"#e2e8f0",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{g.orig.name}</div><div className="mono" style={{fontSize:10,color:"#475569"}}>{fb(g.orig.size)} • {g.vers.length}v</div></div></div>
            <div className="ver-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:5,padding:"10px 12px"}}>{g.vers.map((v,vi)=>(
              <div key={vi} className="vc" onClick={()=>v.thumb?setPreview({...v,vi:vi+1,origId:g.orig.id}):dl(v)}>
                {v.thumb&&<img src={v.thumb} style={{width:"100%",height:60,objectFit:"cover",borderRadius:8,marginBottom:4,display:"block"}}/>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span className="badge bt" style={{fontSize:8}}>v{vi+1}</span>
                  {v.similarity!=null&&<span className="mono" style={{fontSize:8,color:v.similarity>50?"#f87171":"#2dd4bf"}}>{v.similarity}%</span>}</div></div>))}</div></div>)}
          {!proc&&totV>0&&<button className="btn btn-s" onClick={dlAll} style={{width:"100%",padding:12,fontSize:13,marginTop:6}}>📥 Télécharger les {totV} fichiers</button>}
        </div>)}</>}
      </main></div>);
}
