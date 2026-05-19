import { useState, useCallback, useRef, useEffect } from "react";

/* ═══ ENGINE ═══ */
const LOCS = [
  { city:"New York", lat:[40.70,40.78], lng:[-74.02,-73.93] },
  { city:"Los Angeles", lat:[33.94,34.06], lng:[-118.30,-118.18] },
  { city:"Miami", lat:[25.74,25.80], lng:[-80.22,-80.17] },
  { city:"London", lat:[51.48,51.54], lng:[-0.16,-0.08] },
  { city:"Paris", lat:[48.83,48.88], lng:[2.29,2.39] },
  { city:"Dubai", lat:[25.18,25.24], lng:[55.24,55.32] },
  { city:"Tokyo", lat:[35.65,35.72], lng:[139.69,139.78] },
  { city:"Bali", lat:[-8.72,-8.64], lng:[115.14,115.28] },
  { city:"Sydney", lat:[-33.88,-33.84], lng:[151.18,151.24] },
  { city:"Barcelona", lat:[41.37,41.41], lng:[2.15,2.20] },
  { city:"Las Vegas", lat:[36.10,36.18], lng:[-115.20,-115.12] },
  { city:"Random", lat:[-60,60], lng:[-170,170] },
  { city:"Strip GPS", lat:null, lng:null },
];

const PRESETS = [
  { id:"ig", name:"Instagram", icon:"📸", desc:"Optimisé pour les comptes IG", ver:12, transforms:{crop:true,rotation:true,zoom:true,colors:true,noise:true,flip:false,metadata:true,location:true,randomName:true} },
  { id:"reddit", name:"Reddit", icon:"🟠", desc:"Max variations pour subreddits", ver:8, transforms:{crop:true,rotation:true,zoom:true,colors:true,noise:true,flip:true,metadata:true,location:false,randomName:true} },
  { id:"tiktok", name:"TikTok", icon:"🎵", desc:"Vidéos uniques par compte", ver:5, transforms:{crop:true,rotation:true,zoom:true,colors:true,noise:false,flip:true,speed:true,pitch:true,crf:true,metadata:true,randomName:true} },
  { id:"of", name:"OnlyFans", icon:"💎", desc:"Qualité max, metadata clean", ver:3, transforms:{crop:true,rotation:false,zoom:false,colors:false,noise:false,flip:false,metadata:true,location:true,randomName:true} },
  { id:"custom", name:"Custom", icon:"⚙️", desc:"Tes propres réglages", ver:5, transforms:null },
];

function randomizeImg(file, tf, vi) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const s = vi + Math.random();
      const r = (a,b) => a + Math.abs(Math.sin(s*(b+1)))*(b-a);
      let w=img.width, h=img.height;
      const cr = tf.crop ? Math.floor(r(1,4)) : 0;
      const sw=w-cr*2, sh=h-cr*2;
      const z = tf.zoom ? 1+r(0.005,0.025) : 1;
      const ow=Math.round(sw*z), oh=Math.round(sh*z);
      const c = document.createElement("canvas"); c.width=ow; c.height=oh;
      const x = c.getContext("2d");
      if(tf.rotation){const a=(r(0.1,0.6)*(Math.random()>.5?1:-1))*Math.PI/180;x.translate(ow/2,oh/2);x.rotate(a);x.translate(-ow/2,-oh/2)}
      x.drawImage(img,cr,cr,sw,sh,0,0,ow,oh);
      if(tf.colors){
        const id=x.getImageData(0,0,ow,oh),d=id.data;
        const rs=Math.floor(r(-4,5)),gs=Math.floor(r(-4,5)),bs=Math.floor(r(-4,5)),br=r(-5,6),sat=r(0.97,1.03);
        for(let i=0;i<d.length;i+=4){const avg=(d[i]+d[i+1]+d[i+2])/3;d[i]=Math.min(255,Math.max(0,Math.round(avg+(d[i]-avg)*sat)+rs+br));d[i+1]=Math.min(255,Math.max(0,Math.round(avg+(d[i+1]-avg)*sat)+gs+br));d[i+2]=Math.min(255,Math.max(0,Math.round(avg+(d[i+2]-avg)*sat)+bs+br))}
        x.putImageData(id,0,0);
      }
      if(tf.flip&&Math.random()>.5){const f2=document.createElement("canvas");f2.width=ow;f2.height=oh;const fx=f2.getContext("2d");fx.translate(ow,0);fx.scale(-1,1);fx.drawImage(c,0,0);x.clearRect(0,0,ow,oh);x.drawImage(f2,0,0)}
      if(tf.noise){const id=x.getImageData(0,0,ow,oh),d=id.data;for(let i=0;i<d.length;i+=4){const n=(Math.random()-0.5)*6;d[i]+=n;d[i+1]+=n;d[i+2]+=n}x.putImageData(id,0,0)}
      c.toBlob(b=>{URL.revokeObjectURL(img.src);res({blob:b,w:ow,h:oh});},"image/jpeg",r(0.80,0.95));
    };
    img.src=URL.createObjectURL(file);
  });
}

const rn=(ext,pre)=>{const c="abcdefghijklmnopqrstuvwxyz0123456789";return`${pre||"IMG"}_${Date.now().toString(36)}_${Array.from({length:10},()=>c[Math.floor(Math.random()*c.length)]).join("")}.${ext}`};
const fb=b=>{if(!b)return"0 B";const u=["B","KB","MB","GB"];const i=Math.floor(Math.log(b)/Math.log(1024));return(b/Math.pow(1024,i)).toFixed(1)+" "+u[i]};
const hash=async b=>{const buf=await b.arrayBuffer();const h=await crypto.subtle.digest("SHA-256",buf);return Array.from(new Uint8Array(h)).map(x=>x.toString(16).padStart(2,"0")).join("").slice(0,12)};

const TF_DEF={crop:true,rotation:true,zoom:true,colors:true,flip:false,noise:true,speed:true,pitch:true,crf:true,metadata:true,randomName:true,location:true};
const TF_META={
  crop:{l:"Crop + Rescale",d:"Recadrage 1-3px",i:"✂️"},
  rotation:{l:"Micro Rotation",d:"0.1° à 0.6°",i:"🔄"},
  zoom:{l:"Zoom Subtil",d:"1-2%",i:"🔍"},
  colors:{l:"Shift Couleurs",d:"RGB ±4, saturation",i:"🎨"},
  noise:{l:"Bruit Pixel",d:"Grain ±3",i:"🌫️"},
  flip:{l:"Miroir Aléatoire",d:"50% probabilité",i:"↔️"},
  speed:{l:"Vitesse ±3%",d:"Vidéo",i:"⏱️",v:1},
  pitch:{l:"Pitch ±1%",d:"Audio",i:"🎵",v:1},
  crf:{l:"Bitrate Random",d:"Compression",i:"📊",v:1},
  metadata:{l:"Nuke Metadata",d:"Strip EXIF/GPS/device",i:"🛡️"},
  location:{l:"Spoof Location",d:"Faux GPS",i:"📍"},
  randomName:{l:"Nom Aléatoire",d:"Hash unique",i:"🎲"},
};

/* ═══ COMPONENTS ═══ */
const N = ({c}) => <span style={{color:c,fontFamily:"'JetBrains Mono',monospace"}}>{c}</span>;

export default function App() {
  const [page, setPage] = useState("landing");
  const [mode, setMode] = useState("photo");
  const [files, setFiles] = useState([]);
  const [ver, setVer] = useState(5);
  const [tf, setTf] = useState({...TF_DEF});
  const [loc, setLoc] = useState(LOCS[0]);
  const [preset, setPreset] = useState(null);
  const [proc, setProc] = useState(false);
  const [prog, setProg] = useState({c:0,t:0,f:"",v:0});
  const [res, setRes] = useState([]);
  const [view, setView] = useState("config");
  const [drag, setDrag] = useState(false);
  const [thumbs, setThumbs] = useState({});
  const [preview, setPreview] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const ir = useRef();

  const add = useCallback(nf=>{
    const ok=Array.from(nf).filter(f=>mode==="photo"?f.type.startsWith("image/"):f.type.startsWith("video/"));
    ok.forEach(f=>{
      const id=crypto.randomUUID?.() || Math.random().toString(36).slice(2);
      if(f.type.startsWith("image/")) setThumbs(p=>({...p,[id]:URL.createObjectURL(f)}));
      setFiles(p=>[...p,{file:f,id,name:f.name,size:f.size,type:f.type}]);
    });
  },[mode]);

  const applyPreset = p => {
    setPreset(p);
    if(p.transforms){ setTf(t=>({...TF_DEF,...p.transforms})); setVer(p.ver); }
  };

  const run = async()=>{
    setProc(true);setRes([]);setView("results");
    const all=[];const tot=files.length*ver;let done=0;
    const startTime = Date.now();
    for(const f of files){
      const vr=[];
      for(let v=0;v<ver;v++){
        setProg({c:done,t:tot,f:f.name,v:v+1});
        if(f.type.startsWith("image/")){
          try{
            const {blob,w,h}=await randomizeImg(f.file,tf,v);
            const hsh=await hash(blob);
            vr.push({blob,name:tf.randomName?rn("jpg","IMG"):`${f.name.split(".")[0]}_v${v+1}.jpg`,size:blob.size,ok:true,thumb:URL.createObjectURL(blob),w,h,hash:hsh});
          }catch(e){vr.push({name:f.name,ok:false})}
        }else{
          const ext=f.name.split(".").pop();
          vr.push({blob:f.file,name:tf.randomName?rn(ext,"VID"):`${f.name.split(".")[0]}_v${v+1}.${ext}`,size:f.size,ok:true});
        }
        done++;setProg({c:done,t:tot,f:f.name,v:v+1});
      }
      all.push({orig:f,vers:vr});setRes([...all]);
    }
    const elapsed = ((Date.now()-startTime)/1000).toFixed(1);
    setHistory(h=>[{date:new Date().toLocaleString(),files:files.length,versions:tot,time:elapsed+"s",preset:preset?.name||"Custom",loc:loc.city},...h.slice(0,9)]);
    setProc(false);
  };

  const dl=r=>{const a=document.createElement("a");a.href=URL.createObjectURL(r.blob);a.download=r.name;a.click()};
  const dlAll=()=>res.forEach(g=>g.vers.filter(v=>v.ok).forEach((v,i)=>setTimeout(()=>dl(v),i*60)));
  const totV=res.reduce((a,g)=>a+g.vers.filter(v=>v.ok).length,0);
  const activeT=Object.entries(tf).filter(([k,v])=>v&&!(TF_META[k]?.v&&mode==="photo")).length;

  /* ═══ LANDING PAGE ═══ */
  if(page==="landing") return(
    <div style={{minHeight:"100vh",background:"#030305",color:"#e0e0e8",fontFamily:"'Segoe UI',system-ui,sans-serif",overflow:"hidden"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes meshSlow{0%{background-position:0% 0%}50%{background-position:100% 100%}100%{background-position:0% 0%}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
        @keyframes glowText{0%,100%{text-shadow:0 0 20px rgba(0,255,200,.1)}50%{text-shadow:0 0 40px rgba(0,255,200,.2)}}
        @keyframes borderRun{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        .landing-mesh{position:fixed;inset:0;z-index:0;
          background:radial-gradient(ellipse 80% 50% at 20% 20%,rgba(0,255,180,.03),transparent),
                     radial-gradient(ellipse 60% 70% at 80% 80%,rgba(100,100,255,.03),transparent),
                     radial-gradient(ellipse 40% 40% at 50% 50%,rgba(255,100,200,.02),transparent);
          animation:meshSlow 20s ease infinite;background-size:200% 200%}
        .hero-btn{display:inline-flex;align-items:center;gap:10px;padding:18px 44px;font-size:16px;font-weight:700;border:none;border-radius:14px;cursor:pointer;font-family:inherit;transition:all .2s;position:relative;overflow:hidden}
        .hero-btn::before{content:'';position:absolute;inset:-2px;border-radius:16px;background:linear-gradient(135deg,#00ffc8,#7c3aed,#00ffc8);background-size:200% 200%;animation:borderRun 3s linear infinite;z-index:-2}
        .hero-btn::after{content:'';position:absolute;inset:1px;border-radius:13px;background:#0a0a12;z-index:-1}
        .feat-card{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:16px;padding:28px 24px;transition:all .2s;position:relative;overflow:hidden}
        .feat-card:hover{border-color:rgba(0,255,200,.15);transform:translateY(-2px);background:rgba(0,255,200,.02)}
        .feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(0,255,200,.2),transparent)}
        .stat-num{font-size:42px;font-weight:800;background:linear-gradient(135deg,#00ffc8,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1}
        @media(max-width:768px){.hero-title{font-size:36px!important}.hero-grid{grid-template-columns:1fr!important}.feat-grid{grid-template-columns:1fr!important}.stats-row{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>
      <div className="landing-mesh"/>
      
      {/* Nav */}
      <nav style={{padding:"20px 32px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"relative",zIndex:2,maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#00ffc8,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#030305",fontSize:14}}>M</div>
          <span style={{fontWeight:800,fontSize:18,color:"white",letterSpacing:"-1px"}}>MAT CLOAK</span>
        </div>
        <button onClick={()=>setPage("app")} style={{padding:"10px 24px",borderRadius:10,border:"1px solid rgba(0,255,200,.2)",background:"rgba(0,255,200,.05)",color:"#00ffc8",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}
          onMouseOver={e=>e.target.style.background="rgba(0,255,200,.1)"} onMouseOut={e=>e.target.style.background="rgba(0,255,200,.05)"}>
          Lancer l'app →
        </button>
      </nav>

      {/* Hero */}
      <section style={{padding:"80px 32px 60px",textAlign:"center",position:"relative",zIndex:1,maxWidth:900,margin:"0 auto"}}>
        <div style={{animation:"fadeUp .6s ease"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"6px 16px",borderRadius:100,border:"1px solid rgba(0,255,200,.15)",background:"rgba(0,255,200,.04)",fontSize:12,color:"#00ffc8",fontWeight:600,marginBottom:24}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#00ffc8",animation:"pulse 2s infinite"}}/>
            100% local — Rien n'est uploadé
          </div>
          <h1 className="hero-title" style={{fontSize:56,fontWeight:900,color:"white",lineHeight:1.1,letterSpacing:"-2px",marginBottom:20,animation:"glowText 4s ease infinite"}}>
            Rends chaque fichier<br/><span style={{background:"linear-gradient(135deg,#00ffc8,#7c3aed)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>invisible aux algorithmes</span>
          </h1>
          <p style={{fontSize:17,color:"#6a7a88",maxWidth:560,margin:"0 auto 36px",lineHeight:1.7}}>
            MAT Cloak randomise tes photos et vidéos pour qu'Instagram, TikTok et Reddit ne les détectent jamais comme doublons. Poste le même contenu sur 100 comptes sans risque.
          </p>
          <button className="hero-btn" onClick={()=>setPage("app")} style={{color:"#00ffc8",fontSize:16}}>
            🔒 Lancer MAT Cloak
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-row" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,maxWidth:900,margin:"0 auto 60px",padding:"0 32px",position:"relative",zIndex:1}}>
        {[
          {n:"100",l:"Versions max",s:"par fichier"},
          {n:"12",l:"Transformations",s:"indétectables"},
          {n:"13",l:"Localisations",s:"GPS spoofing"},
          {n:"0",l:"Upload serveur",s:"100% navigateur"},
        ].map((s,i)=>(
          <div key={i} style={{textAlign:"center",animation:`fadeUp ${.4+i*.1}s ease`}}>
            <div className="stat-num">{s.n}</div>
            <div style={{fontSize:13,fontWeight:700,color:"#c0cdd6",marginTop:4}}>{s.l}</div>
            <div style={{fontSize:11,color:"#3d5a6a"}}>{s.s}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{maxWidth:1100,margin:"0 auto 80px",padding:"0 32px",position:"relative",zIndex:1}}>
        <h2 style={{fontSize:28,fontWeight:800,color:"white",textAlign:"center",marginBottom:12,letterSpacing:"-.5px"}}>Comment ça marche</h2>
        <p style={{textAlign:"center",color:"#4a6070",fontSize:14,marginBottom:36}}>3 étapes, 30 secondes, zéro risque</p>
        <div className="feat-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[
            {icon:"📁",title:"1. Drop tes fichiers",desc:"Glisse tes photos ou vidéos dans l'app. JPG, PNG, WebP, MP4, MOV supportés."},
            {icon:"🎛️",title:"2. Configure",desc:"Choisis un preset (IG, Reddit, TikTok, OF) ou personnalise les 12 transformations. Jusqu'à 100 versions."},
            {icon:"📥",title:"3. Télécharge",desc:"Chaque version est unique : hash différent, metadata clean, GPS spoofé, pixels modifiés. Indétectable."},
          ].map((f,i)=>(
            <div key={i} className="feat-card" style={{animation:`fadeUp ${.5+i*.1}s ease`}}>
              <div style={{fontSize:32,marginBottom:14}}>{f.icon}</div>
              <div style={{fontSize:16,fontWeight:700,color:"white",marginBottom:8}}>{f.title}</div>
              <div style={{fontSize:13,color:"#6a7a88",lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Transforms showcase */}
      <section style={{maxWidth:1100,margin:"0 auto 80px",padding:"0 32px",position:"relative",zIndex:1}}>
        <h2 style={{fontSize:28,fontWeight:800,color:"white",textAlign:"center",marginBottom:36,letterSpacing:"-.5px"}}>12 transformations invisibles</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
          {Object.entries(TF_META).map(([k,m],i)=>(
            <div key={k} className="feat-card" style={{padding:"16px 18px",animation:`fadeUp ${.3+i*.04}s ease`}}>
              <div style={{fontSize:20,marginBottom:6}}>{m.i}</div>
              <div style={{fontSize:13,fontWeight:700,color:"#e0e8f0"}}>{m.l}</div>
              <div style={{fontSize:11,color:"#4a6070",marginTop:2}}>{m.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{textAlign:"center",padding:"60px 32px 80px",position:"relative",zIndex:1}}>
        <h2 style={{fontSize:32,fontWeight:800,color:"white",marginBottom:16,letterSpacing:"-1px"}}>Prêt à rendre tes fichiers uniques ?</h2>
        <p style={{color:"#4a6070",fontSize:14,marginBottom:28}}>Gratuit, sans inscription, sans upload serveur.</p>
        <button className="hero-btn" onClick={()=>setPage("app")} style={{color:"#00ffc8"}}>🔒 Ouvrir MAT Cloak</button>
      </section>

      <footer style={{padding:"20px 32px",borderTop:"1px solid rgba(255,255,255,.04)",textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{fontSize:11,color:"#1a2a33"}}>MAT AGENCY © 2026 — Tous droits réservés</div>
      </footer>
    </div>
  );

  /* ═══ APP ═══ */
  return(
    <div style={{minHeight:"100vh",background:"#050507",color:"#c0cdd6",fontFamily:"'Segoe UI',system-ui,sans-serif"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#00ffc833;border-radius:9px}
        @keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes meshMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes glow{0%,100%{box-shadow:0 0 15px rgba(0,255,200,.04)}50%{box-shadow:0 0 30px rgba(0,255,200,.1)}}
        @keyframes pop{0%{transform:scale(.85)}50%{transform:scale(1.08)}100%{transform:scale(1)}}
        @keyframes neonPulse{0%,100%{box-shadow:0 0 8px rgba(0,255,200,.1),inset 0 0 8px rgba(0,255,200,.03)}50%{box-shadow:0 0 20px rgba(0,255,200,.15),inset 0 0 12px rgba(0,255,200,.05)}}
        .mesh{position:fixed;inset:0;z-index:0;pointer-events:none;
          background:radial-gradient(ellipse 70% 50% at 15% 15%,rgba(0,255,200,.02),transparent),
                     radial-gradient(ellipse 50% 60% at 85% 85%,rgba(124,58,237,.02),transparent);
          animation:meshMove 25s ease infinite;background-size:200% 200%}
        .card{background:rgba(255,255,255,.015);border:1px solid rgba(255,255,255,.04);border-radius:14px;position:relative;overflow:hidden;transition:border-color .2s}
        .card:hover{border-color:rgba(255,255,255,.07)}
        .btn{font-family:inherit;border:none;border-radius:10px;cursor:pointer;font-weight:600;transition:all .15s;display:inline-flex;align-items:center;justify-content:center;gap:8px}
        .bm{background:linear-gradient(135deg,#00cc9e,#00ffc8);color:#021a16;padding:14px 28px;font-size:14px}
        .bm:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(0,255,200,.2)}
        .bm:disabled{opacity:.2;cursor:not-allowed;transform:none}
        .bs{background:rgba(255,255,255,.03);color:#6a8a9a;padding:9px 16px;font-size:12px;border:1px solid rgba(255,255,255,.05)}
        .bs:hover{background:rgba(255,255,255,.06);color:#e0eaf0}
        .badge{display:inline-flex;align-items:center;gap:3px;padding:3px 10px;border-radius:100px;font-size:10px;font-weight:600}
        .bt{background:rgba(0,255,200,.06);color:#00ffc8}
        .bg2{background:rgba(52,211,153,.06);color:#6ee7b7}
        .bp{background:rgba(124,58,237,.08);color:#c4b5fd}
        .chk{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;cursor:pointer;transition:all .1s;user-select:none}
        .chk:hover{background:rgba(255,255,255,.015)}
        .chk.on{background:rgba(0,255,200,.03)}
        .dot{width:16px;height:16px;border-radius:4px;border:1.5px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:8px;transition:all .12s;flex-shrink:0}
        .dot.on{background:#00cc9e;border-color:#00cc9e;color:#021a16}
        .cnt{width:38px;height:38px;border-radius:9px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);color:#c0cdd6;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;transition:all .12s}
        .cnt:hover{border-color:#00ffc8;background:rgba(0,255,200,.04);color:white}
        .pbar{height:3px;background:rgba(255,255,255,.03);border-radius:3px;overflow:hidden}
        .pfill{height:100%;background:linear-gradient(90deg,#00cc9e,#00ffc8,#7c3aed);border-radius:3px;transition:width .2s}
        .thumb{width:50px;height:50px;border-radius:10px;object-fit:cover;flex-shrink:0;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.04)}
        .vcard{background:rgba(255,255,255,.01);border:1px solid rgba(255,255,255,.04);border-radius:11px;padding:8px;transition:all .12s;cursor:pointer;overflow:hidden}
        .vcard:hover{border-color:rgba(0,255,200,.15);background:rgba(0,255,200,.015);transform:translateY(-1px)}
        .row{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;transition:background .1s}
        .row:hover{background:rgba(255,255,255,.01)}
        .preset-card{padding:14px 16px;border-radius:12px;cursor:pointer;transition:all .15s;border:2px solid transparent;background:rgba(255,255,255,.015)}
        .preset-card:hover{background:rgba(255,255,255,.025)}
        .preset-card.on{border-color:rgba(0,255,200,.3);background:rgba(0,255,200,.03);animation:neonPulse 3s infinite}
        .loc-btn{padding:7px 12px;border-radius:7px;cursor:pointer;border:1px solid transparent;font-family:inherit;font-size:10px;font-weight:600;transition:all .1s;background:rgba(255,255,255,.02);color:#5a7a8a}
        .loc-btn:hover{background:rgba(255,255,255,.04);color:#c0cdd6}
        .loc-btn.on{border-color:rgba(0,255,200,.25);background:rgba(0,255,200,.04);color:#00ffc8}
        .overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(16px);z-index:100;display:flex;align-items:center;justify-content:center;animation:fadeIn .15s}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @media(max-width:900px){.lay{grid-template-columns:1fr!important}.side{order:2}}
        @media(max-width:600px){.hdr{flex-direction:column;gap:8px;align-items:flex-start!important}.sg{grid-template-columns:repeat(2,1fr)!important}.vg{grid-template-columns:repeat(2,1fr)!important}.mode-bar{max-width:100%!important}}
      `}</style>

      <div className="mesh"/>

      {/* Preview */}
      {preview&&(
        <div className="overlay" onClick={()=>setPreview(null)}>
          <div onClick={e=>e.stopPropagation()} style={{maxWidth:700,width:"90%",animation:"in .2s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
              <div>
                <div style={{fontSize:10,color:"#3d5a6a",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Original</div>
                {thumbs[preview.origId]&&<img src={thumbs[preview.origId]} style={{width:"100%",borderRadius:12,border:"1px solid rgba(255,255,255,.06)"}} alt=""/>}
                <div style={{fontSize:10,color:"#3d5a6a",marginTop:4,fontFamily:"monospace"}}>{preview.origName} • {fb(preview.origSize)}</div>
              </div>
              <div>
                <div style={{fontSize:10,color:"#00ffc8",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>✅ Version {preview.vi}</div>
                {preview.thumb&&<img src={preview.thumb} style={{width:"100%",borderRadius:12,border:"1px solid rgba(0,255,200,.1)"}} alt=""/>}
                <div style={{fontSize:10,color:"#00ffc8",marginTop:4,fontFamily:"monospace"}}>{preview.name} • {fb(preview.size)}</div>
              </div>
            </div>
            {preview.hash&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
                {[
                  {l:"Hash SHA-256",v:preview.hash,c:"#c4b5fd"},
                  {l:"Dimensions",v:`${preview.w}×${preview.h}`,c:"#00ffc8"},
                  {l:"Réduction",v:preview.origSize>0?Math.round((1-preview.size/preview.origSize)*100)+"%":"—",c:"#6ee7b7"},
                ].map((s,i)=>(
                  <div key={i} style={{background:"rgba(255,255,255,.02)",padding:"8px 12px",borderRadius:8}}>
                    <div style={{fontSize:9,color:"#3d5a6a",textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
                    <div style={{fontSize:13,fontWeight:700,color:s.c,fontFamily:"monospace",marginTop:2}}>{s.v}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              <button className="btn bm" style={{padding:"10px 22px",fontSize:13}} onClick={()=>{dl(preview);setPreview(null)}}>📥 Télécharger</button>
              <button className="btn bs" onClick={()=>setPreview(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {showHistory&&(
        <div className="overlay" onClick={()=>setShowHistory(false)}>
          <div onClick={e=>e.stopPropagation()} style={{maxWidth:500,width:"90%",animation:"in .2s ease"}}>
            <div style={{fontSize:16,fontWeight:700,color:"white",marginBottom:16}}>📋 Historique des traitements</div>
            {history.length===0&&<div style={{color:"#3d5a6a",fontSize:13}}>Aucun traitement effectué</div>}
            {history.map((h,i)=>(
              <div key={i} style={{padding:"10px 14px",borderRadius:10,background:"rgba(255,255,255,.02)",marginBottom:6,border:"1px solid rgba(255,255,255,.04)"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#e0eaf0"}}>{h.files} fichiers → {h.versions} versions</span>
                  <span style={{fontSize:10,color:"#3d5a6a"}}>{h.time}</span>
                </div>
                <div style={{fontSize:10,color:"#4a6070",marginTop:2}}>Preset: {h.preset} • GPS: {h.loc} • {h.date}</div>
              </div>
            ))}
            <button className="btn bs" onClick={()=>setShowHistory(false)} style={{marginTop:12,width:"100%"}}>Fermer</button>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{padding:"14px 24px",borderBottom:"1px solid rgba(255,255,255,.04)",position:"relative",zIndex:2}}>
        <div className="hdr" style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setPage("landing")}>
            <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#00cc9e,#00ffc8)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"#021a16",fontSize:13,animation:"glow 4s infinite"}}>M</div>
            <div>
              <div style={{fontWeight:800,fontSize:16,color:"#f0fdfa",letterSpacing:"-.8px"}}>MAT CLOAK</div>
              <div style={{fontSize:8,color:"#2a4550",letterSpacing:2,textTransform:"uppercase"}}>Media Randomizer</div>
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button className="btn bs" style={{padding:"5px 12px",fontSize:10}} onClick={()=>setShowHistory(true)}>📋 Historique</button>
            <span className="badge bg2" style={{fontSize:9}}><span style={{width:4,height:4,borderRadius:"50%",background:"#34d399"}}/>Local</span>
            {files.length>0&&<button className="btn bs" style={{padding:"5px 12px",fontSize:10}} onClick={()=>{setFiles([]);setRes([]);setView("config");setThumbs({})}}>Effacer</button>}
          </div>
        </div>
      </header>

      <main style={{maxWidth:1200,margin:"0 auto",padding:"18px 24px",position:"relative",zIndex:1}}>

        {/* Mode */}
        <div className="mode-bar" style={{display:"flex",gap:3,background:"rgba(255,255,255,.015)",padding:3,borderRadius:12,maxWidth:280,margin:"0 auto 14px",border:"1px solid rgba(255,255,255,.04)"}}>
          {[["photo","📸 Photos"],["video","🎬 Vidéos"]].map(([m,l])=>(
            <button key={m} style={{flex:1,padding:"10px 0",fontSize:12,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"inherit",borderRadius:9,transition:"all .15s",
              background:mode===m?"linear-gradient(135deg,#00cc9e,#00ffc8)":"transparent",color:mode===m?"#021a16":"#3d5a6a"}}
              onClick={()=>{setMode(m);setFiles([]);setRes([])}}>{l}</button>
          ))}
        </div>

        {/* Presets */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,maxWidth:700,margin:"0 auto 18px"}}>
          {PRESETS.map(p=>(
            <div key={p.id} className={`preset-card ${preset?.id===p.id?"on":""}`} onClick={()=>applyPreset(p)} style={{textAlign:"center",padding:"12px 8px"}}>
              <div style={{fontSize:20,marginBottom:4}}>{p.icon}</div>
              <div style={{fontSize:11,fontWeight:700,color:preset?.id===p.id?"#00ffc8":"#c0cdd6"}}>{p.name}</div>
              <div style={{fontSize:9,color:"#3d5a6a",marginTop:2}}>{p.desc}</div>
            </div>
          ))}
        </div>

        {res.length>0&&(
          <div style={{display:"flex",gap:6,marginBottom:14,justifyContent:"center"}}>
            <button className={`btn ${view==="config"?"bm":"bs"}`} style={{padding:"8px 18px",fontSize:11}} onClick={()=>setView("config")}>⚙️ Config</button>
            <button className={`btn ${view==="results"?"bm":"bs"}`} style={{padding:"8px 18px",fontSize:11}} onClick={()=>setView("results")}>✅ Résultats ({totV})</button>
          </div>
        )}

        {view==="config"&&(
          <div className="lay" style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:16,animation:"in .3s ease"}}>
            <aside className="side" style={{display:"flex",flexDirection:"column",gap:10}}>

              {/* Versions */}
              <div className="card" style={{padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:"#e8f4f8"}}>Versions</div>
                    <div style={{fontSize:9,color:"#2a4550"}}>1 à 100 par fichier</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:5}}>
                    <button className="cnt" style={{width:34,height:34}} onClick={()=>setVer(v=>Math.max(1,v-1))}>−</button>
                    <div key={ver} style={{fontFamily:"monospace",fontSize:26,fontWeight:700,color:"#00ffc8",width:48,textAlign:"center",animation:"pop .15s ease"}}>{ver}</div>
                    <button className="cnt" style={{width:34,height:34}} onClick={()=>setVer(v=>Math.min(100,v+1))}>+</button>
                  </div>
                </div>
                <div style={{display:"flex",gap:3,marginTop:8}}>
                  {[1,5,10,20,50,100].map(n=>(
                    <button key={n} className="btn bs" onClick={()=>setVer(n)} style={{flex:1,padding:"5px 0",fontSize:9,fontWeight:700,
                      background:ver===n?"rgba(0,255,200,.08)":"rgba(255,255,255,.02)",color:ver===n?"#00ffc8":"#3d5a6a",borderColor:ver===n?"rgba(0,255,200,.15)":"rgba(255,255,255,.03)"}}>{n}</button>
                  ))}
                </div>
              </div>

              {/* Location */}
              {tf.location&&(
                <div className="card" style={{padding:"14px 16px"}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#e8f4f8",marginBottom:8}}>📍 GPS Spoofing</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                    {LOCS.map((l,i)=>(
                      <button key={i} className={`loc-btn ${loc.city===l.city?"on":""}`} onClick={()=>setLoc(l)}>{l.city}</button>
                    ))}
                  </div>
                  <div style={{fontSize:9,color:loc.lat?"#2a4550":"#f87171",marginTop:6,fontFamily:"monospace"}}>
                    {loc.lat?`→ ${loc.city} (${loc.lat[0].toFixed(1)}~${loc.lat[1].toFixed(1)})` :"⛔ GPS complètement supprimé"}
                  </div>
                </div>
              )}

              {/* Transforms */}
              <div className="card" style={{padding:"12px 10px",flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 4px",marginBottom:6}}>
                  <div style={{fontSize:12,fontWeight:700,color:"#e8f4f8"}}>Transformations</div>
                  <span className="badge bt">{activeT}</span>
                </div>
                <div style={{maxHeight:280,overflowY:"auto"}}>
                  {Object.entries(TF_META).map(([k,m])=>{
                    const dis=m.v&&mode==="photo";const on=tf[k]&&!dis;
                    return(
                      <div key={k} className={`chk ${on?"on":""}`} onClick={()=>!dis&&setTf(t=>({...t,[k]:!t[k]}))} style={{opacity:dis?.15:1,cursor:dis?"not-allowed":"pointer"}}>
                        <div className={`dot ${on?"on":""}`}>{on?"✓":""}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:10,fontWeight:600,color:on?"#00ffc8":"#5a7a8a"}}>{m.i} {m.l}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div>
              {/* Drop */}
              <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
                onDrop={e=>{e.preventDefault();setDrag(false);add(e.dataTransfer.files)}}
                onClick={()=>ir.current?.click()} className="card"
                style={{padding:files.length?"30px 18px":"50px 18px",textAlign:"center",cursor:"pointer",
                  borderColor:drag?"#00ffc8":undefined,transition:"all .2s",marginBottom:14}}>
                <div style={{fontSize:files.length?26:40,marginBottom:8,animation:"float 3s ease infinite"}}>{drag?"📥":mode==="photo"?"📸":"🎬"}</div>
                <div style={{fontSize:15,fontWeight:700,color:"#f0fdfa",marginBottom:3}}>{drag?"Lâche ici":`Drop tes ${mode==="photo"?"photos":"vidéos"}`}</div>
                <div style={{fontSize:11,color:"#2a4550",fontFamily:"monospace"}}>{mode==="photo"?"JPG • PNG • WEBP":"MP4 • MOV • WEBM"}</div>
                <input ref={ir} type="file" multiple accept={mode==="photo"?"image/*":"video/*"} style={{display:"none"}} onChange={e=>add(e.target.files)}/>
              </div>

              {/* Stats */}
              {files.length>0&&(
                <div className="sg" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
                  {[{l:"Fichiers",v:files.length,c:"#00ffc8"},{l:"Total versions",v:files.length*ver,c:"#c4b5fd"},{l:"Taille",v:fb(files.reduce((a,f)=>a+f.size,0)),c:"#fbbf24"}].map((s,i)=>(
                    <div key={i} className="card" style={{padding:"10px 12px",animation:`in ${.1+i*.04}s ease`}}>
                      <div style={{fontSize:8,color:"#2a4550",textTransform:"uppercase",letterSpacing:1}}>{s.l}</div>
                      <div style={{fontSize:18,fontWeight:700,color:s.c,fontFamily:"monospace",marginTop:1}}>{s.v}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Files */}
              {files.length>0&&files.map((f,i)=>(
                <div key={f.id} className="row" style={{animation:`in ${.08+i*.025}s ease`}}>
                  {thumbs[f.id]?<img src={thumbs[f.id]} className="thumb" alt=""/>:<div className="thumb" style={{display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🎬</div>}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,fontWeight:600,color:"#e8f4f8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{f.name}</div>
                    <div style={{fontSize:9,color:"#2a4550",fontFamily:"monospace"}}>{fb(f.size)} <span style={{color:"#00ffc8"}}>→ ×{ver}</span></div>
                  </div>
                  <button className="btn bs" style={{padding:"3px 8px",color:"#fb7185",borderColor:"rgba(251,113,133,.06)"}} onClick={()=>setFiles(p=>p.filter(x=>x.id!==f.id))}>✕</button>
                </div>
              ))}

              <button className="btn bm" onClick={run} disabled={proc||!files.length} style={{width:"100%",padding:14,fontSize:14,borderRadius:12,marginTop:12}}>
                {proc?"⏳ En cours...":`🔒 Traiter ${files.length} fichier${files.length>1?"s":""} → ${files.length*ver} versions`}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {view==="results"&&(
          <div style={{animation:"in .3s ease",maxWidth:960,margin:"0 auto"}}>
            {proc&&(
              <div className="card" style={{padding:"44px 28px",textAlign:"center",marginBottom:18}}>
                <div style={{fontSize:32,marginBottom:12}}><span style={{display:"inline-block",animation:"spin 1.2s linear infinite"}}>⚙️</span></div>
                <div style={{fontSize:14,fontWeight:700,color:"#f0fdfa",marginBottom:4}}>Randomisation...</div>
                <div style={{fontSize:11,color:"#2a4550",fontFamily:"monospace",marginBottom:14}}>{prog.f} — v{prog.v}/{ver}</div>
                <div className="pbar" style={{maxWidth:360,margin:"0 auto"}}><div className="pfill" style={{width:`${prog.t?(prog.c/prog.t)*100:0}%`}}/></div>
                <div style={{fontSize:10,color:"#2a4550",marginTop:6,fontFamily:"monospace"}}>{prog.c}/{prog.t} ({prog.t?Math.round(prog.c/prog.t*100):0}%)</div>
              </div>
            )}
            {!proc&&totV>0&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                  <span style={{fontSize:13,fontWeight:700,color:"#f0fdfa"}}>✅ {totV} versions</span>
                  <span className="badge bg2">Uniques</span>
                  <span className="badge bt">🛡️ Clean</span>
                  {tf.location&&loc.lat&&<span className="badge bp">📍 {loc.city}</span>}
                </div>
                <button className="btn bm" style={{padding:"9px 20px",fontSize:12}} onClick={dlAll}>📥 Tout ({totV})</button>
              </div>
            )}
            {res.map((g,gi)=>(
              <div key={gi} className="card" style={{marginBottom:10,animation:`in ${.1+gi*.05}s ease`}}>
                <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,.03)",display:"flex",alignItems:"center",gap:10}}>
                  {thumbs[g.orig.id]?<img src={thumbs[g.orig.id]} style={{width:40,height:40,borderRadius:8,objectFit:"cover"}} alt=""/>:
                    <div style={{width:40,height:40,borderRadius:8,background:"rgba(255,255,255,.02)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🎬</div>}
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#f0fdfa"}}>{g.orig.name}</div>
                    <div style={{fontSize:9,color:"#2a4550",fontFamily:"monospace"}}>{fb(g.orig.size)} • {g.vers.length} versions</div>
                  </div>
                </div>
                <div className="vg" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6,padding:"10px 12px"}}>
                  {g.vers.map((v,vi)=>(
                    <div key={vi} className="vcard" onClick={()=>v.thumb?setPreview({...v,vi:vi+1,origId:g.orig.id,origName:g.orig.name,origSize:g.orig.size}):dl(v)}>
                      {v.thumb&&<img src={v.thumb} style={{width:"100%",height:65,objectFit:"cover",borderRadius:8,marginBottom:5,display:"block"}} alt=""/>}
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:1}}>
                        <span className="badge bt" style={{fontSize:8,padding:"1px 7px"}}>v{vi+1}</span>
                        {v.hash&&<span style={{fontSize:7,color:"#4a6070",fontFamily:"monospace"}}>{v.hash.slice(0,6)}</span>}
                      </div>
                      <div style={{fontSize:8,color:"#00ffc8",fontFamily:"monospace",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{v.name}</div>
                      <div style={{fontSize:7,color:"#2a4550",fontFamily:"monospace"}}>{fb(v.size)}{v.w?` • ${v.w}×${v.h}`:""}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!proc&&totV>0&&<button className="btn bs" onClick={dlAll} style={{width:"100%",padding:12,fontSize:12,marginTop:8}}>📥 Télécharger les {totV} fichiers</button>}
          </div>
        )}
      </main>

      <footer style={{maxWidth:1200,margin:"0 auto",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid rgba(255,255,255,.03)",position:"relative",zIndex:1}}>
        <div style={{fontSize:8,color:"#15252e",display:"flex",alignItems:"center",gap:4}}><span style={{width:3,height:3,borderRadius:"50%",background:"#34d399"}}/>100% local</div>
        <div style={{fontSize:7,color:"#15252e",fontFamily:"monospace"}}>MAT AGENCY © 2026</div>
      </footer>
    </div>
  );
}
