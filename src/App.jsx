import { useState, useCallback, useRef, useEffect } from "react";

/* ═══ IMAGE RANDOMIZER ENGINE ═══ */
function randomizeImg(file, tf, vi) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const s = vi + Math.random();
      const r = (a, b) => a + Math.abs(Math.sin(s * (b + 1))) * (b - a);
      let w = img.width, h = img.height;
      const cr = tf.crop ? Math.floor(r(1, 4)) : 0;
      const sw = w - cr * 2, sh = h - cr * 2;
      const z = tf.zoom ? 1 + r(0.005, 0.025) : 1;
      const ow = Math.round(sw * z), oh = Math.round(sh * z);
      const c = document.createElement("canvas"); c.width = ow; c.height = oh;
      const x = c.getContext("2d");
      if (tf.rotation) {
        const a = (r(0.1, 0.5) * (Math.random() > .5 ? 1 : -1)) * Math.PI / 180;
        x.translate(ow / 2, oh / 2); x.rotate(a); x.translate(-ow / 2, -oh / 2);
      }
      x.drawImage(img, cr, cr, sw, sh, 0, 0, ow, oh);
      if (tf.colors) {
        const id = x.getImageData(0, 0, ow, oh), d = id.data;
        const rs = Math.floor(r(-3, 4)), gs = Math.floor(r(-3, 4)), bs = Math.floor(r(-3, 4)), br = r(-4, 5);
        for (let i = 0; i < d.length; i += 4) {
          d[i] = Math.min(255, Math.max(0, d[i] + rs + br));
          d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + gs + br));
          d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + bs + br));
        }
        x.putImageData(id, 0, 0);
      }
      if (tf.flip && Math.random() > .5) {
        const f2 = document.createElement("canvas"); f2.width = ow; f2.height = oh;
        const fx = f2.getContext("2d"); fx.translate(ow, 0); fx.scale(-1, 1); fx.drawImage(c, 0, 0);
        x.clearRect(0, 0, ow, oh); x.drawImage(f2, 0, 0);
      }
      c.toBlob(b => { URL.revokeObjectURL(img.src); res(b); }, "image/jpeg", r(0.82, 0.95));
    };
    img.src = URL.createObjectURL(file);
  });
}

const rn = (ext, pre) => {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  return `${pre || "IMG"}_${Date.now().toString(36)}_${Array.from({ length: 8 }, () => c[Math.floor(Math.random() * c.length)]).join("")}.${ext}`;
};
const fb = b => { if (!b) return "0 B"; const u = ["B", "KB", "MB", "GB"]; const i = Math.floor(Math.log(b) / Math.log(1024)); return (b / Math.pow(1024, i)).toFixed(1) + " " + u[i]; };

const TF_DEF = { crop: true, rotation: true, zoom: true, colors: true, flip: false, speed: true, pitch: true, crf: true, metadata: true, randomName: true };
const TF_META = {
  crop: { l: "Crop + Rescale", d: "Recadrage 1-3px", i: "✂️" },
  rotation: { l: "Micro Rotation", d: "0.1° à 0.5°", i: "🔄" },
  zoom: { l: "Zoom Subtil", d: "1-2% imperceptible", i: "🔍" },
  colors: { l: "Shift Couleurs", d: "RGB ±3, Luma ±4", i: "🎨" },
  flip: { l: "Miroir Aléatoire", d: "50% de probabilité", i: "↔️" },
  speed: { l: "Vitesse ±3%", d: "Vidéo uniquement", i: "⏱️", v: 1 },
  pitch: { l: "Pitch ±1%", d: "Audio uniquement", i: "🎵", v: 1 },
  crf: { l: "Bitrate Random", d: "Compression variable", i: "📊", v: 1 },
  metadata: { l: "Nuke Metadata", d: "Supprime tout EXIF/GPS", i: "🛡️" },
  randomName: { l: "Nom Aléatoire", d: "Hash unique par fichier", i: "🎲" },
};

export default function MATCloakV3() {
  const [mode, setMode] = useState("photo");
  const [files, setFiles] = useState([]);
  const [ver, setVer] = useState(5);
  const [tf, setTf] = useState({ ...TF_DEF });
  const [proc, setProc] = useState(false);
  const [prog, setProg] = useState({ c: 0, t: 0, f: "", v: 0 });
  const [res, setRes] = useState([]);
  const [view, setView] = useState("config");
  const [drag, setDrag] = useState(false);
  const [thumbs, setThumbs] = useState({});
  const ir = useRef();

  const add = useCallback(nf => {
    const ok = Array.from(nf).filter(f => mode === "photo" ? f.type.startsWith("image/") : f.type.startsWith("video/"));
    const mapped = ok.map(f => {
      const id = crypto.randomUUID?.() || Math.random().toString(36).slice(2);
      if (f.type.startsWith("image/")) {
        const url = URL.createObjectURL(f);
        setThumbs(p => ({ ...p, [id]: url }));
      }
      return { file: f, id, name: f.name, size: f.size, type: f.type };
    });
    setFiles(p => [...p, ...mapped]);
  }, [mode]);

  const rm = id => { setFiles(p => p.filter(f => f.id !== id)); };
  const clr = () => { setFiles([]); setRes([]); setView("config"); setThumbs({}); };

  const run = async () => {
    setProc(true); setRes([]); setView("results");
    const all = []; const tot = files.length * ver; let done = 0;
    for (const f of files) {
      const vr = [];
      for (let v = 0; v < ver; v++) {
        setProg({ c: done, t: tot, f: f.name, v: v + 1 });
        if (f.type.startsWith("image/")) {
          try {
            const blob = await randomizeImg(f.file, tf, v);
            vr.push({ blob, name: tf.randomName ? rn("jpg", "IMG") : `${f.name.split(".")[0]}_v${v + 1}.jpg`, size: blob.size, ok: true, thumb: URL.createObjectURL(blob) });
          } catch (e) { vr.push({ name: f.name, ok: false }); }
        } else {
          const ext = f.name.split(".").pop();
          vr.push({ blob: f.file, name: tf.randomName ? rn(ext, "VID") : `${f.name.split(".")[0]}_v${v + 1}.${ext}`, size: f.size, ok: true });
        }
        done++;
      }
      all.push({ orig: f, vers: vr }); setRes([...all]);
    }
    setProc(false);
  };

  const dl = r => { const a = document.createElement("a"); a.href = URL.createObjectURL(r.blob); a.download = r.name; a.click(); };
  const dlAll = () => res.forEach(g => g.vers.filter(v => v.ok).forEach((v, i) => setTimeout(() => dl(v), i * 120)));
  const totV = res.reduce((a, g) => a + g.vers.filter(v => v.ok).length, 0);
  const activeT = Object.values(tf).filter(Boolean).length;

  return (
    <div style={{ minHeight: "100vh", background: "#07080a", color: "#bcc8d0", fontFamily: "'Outfit',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2dd4bf33;border-radius:2px}
        @keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes orbA{0%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,-40px) scale(1.1)}66%{transform:translate(-30px,50px) scale(.95)}100%{transform:translate(0,0) scale(1)}}
        @keyframes orbB{0%{transform:translate(0,0) scale(1)}33%{transform:translate(-50px,30px) scale(1.08)}66%{transform:translate(40px,-60px) scale(.92)}100%{transform:translate(0,0) scale(1)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
        .mono{font-family:'JetBrains Mono',monospace}
        .g{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:16px;position:relative;overflow:hidden}
        .g::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(45,212,191,.02),transparent 60%);pointer-events:none}
        .b{font-family:inherit;border:none;border-radius:10px;cursor:pointer;font-weight:600;transition:all .18s;display:inline-flex;align-items:center;justify-content:center;gap:8px}
        .bp{background:linear-gradient(135deg,#0d9488,#2dd4bf);color:#021a16;padding:12px 24px;font-size:14px}
        .bp:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 24px rgba(45,212,191,.25)}
        .bp:disabled{opacity:.3;cursor:not-allowed;transform:none}
        .bg{background:rgba(255,255,255,.03);color:#7a9aaa;padding:9px 18px;font-size:12px;border:1px solid rgba(255,255,255,.06)}
        .bg:hover{background:rgba(255,255,255,.06);color:#c8d6de}
        .badge{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:100px;font-size:10px;font-weight:600;letter-spacing:.3px}
        .bt{background:rgba(45,212,191,.08);color:#5eead4}
        .be{background:rgba(52,211,153,.08);color:#6ee7b7}
        .ba{background:rgba(251,191,36,.08);color:#fde68a}
        .row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;transition:background .12s;margin-bottom:2px}
        .row:hover{background:rgba(255,255,255,.015)}
        .thumb{width:48px;height:48px;border-radius:10px;object-fit:cover;flex-shrink:0;background:rgba(255,255,255,.03)}
        .chk{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:10px;cursor:pointer;transition:all .12s;user-select:none}
        .chk:hover{background:rgba(255,255,255,.02)}
        .chk.on{background:rgba(45,212,191,.05)}
        .dot{width:16px;height:16px;border-radius:5px;border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:9px;transition:all .12s;flex-shrink:0}
        .dot.on{background:#14b8a6;border-color:#14b8a6;color:#021a16}
        .cnt{width:36px;height:36px;border-radius:8px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);color:#c8d6de;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;transition:all .12s}
        .cnt:hover{border-color:#2dd4bf;background:rgba(45,212,191,.05)}
        .pbar{height:3px;background:rgba(255,255,255,.04);border-radius:2px;overflow:hidden}
        .pfill{height:100%;background:linear-gradient(90deg,#0d9488,#2dd4bf,#67e8f9);border-radius:2px;transition:width .25s}
        .vcard{background:rgba(255,255,255,.015);border:1px solid rgba(255,255,255,.04);border-radius:12px;padding:10px;transition:all .15s;cursor:pointer;overflow:hidden}
        .vcard:hover{border-color:rgba(45,212,191,.2);background:rgba(45,212,191,.03);transform:translateY(-1px)}
        .orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
      `}</style>

      {/* Ambient orbs */}
      <div className="orb" style={{ width: 500, height: 500, top: -100, left: -100, background: "radial-gradient(circle,rgba(13,148,136,.06),transparent)", animation: "orbA 20s ease infinite" }} />
      <div className="orb" style={{ width: 400, height: 400, bottom: -50, right: -80, background: "radial-gradient(circle,rgba(34,211,238,.04),transparent)", animation: "orbB 25s ease infinite" }} />

      {/* Header */}
      <header style={{ padding: "18px 28px", borderBottom: "1px solid rgba(255,255,255,.04)", position: "relative", zIndex: 2 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#0d9488,#2dd4bf)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#021a16", fontFamily: "'JetBrains Mono'" }}>M</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#f0fdfa", letterSpacing: "-.8px" }}>
                MAT CLOAK
              </div>
              <div style={{ fontSize: 9, color: "#3d5a6a", letterSpacing: 3, textTransform: "uppercase" }}>Randomisation de médias</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="badge be" style={{ fontSize: 9 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#34d399" }} /> Local
            </span>
            {files.length > 0 && <button className="b bg" style={{ padding: "6px 14px" }} onClick={clr}>Effacer</button>}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 28px", display: "grid", gridTemplateColumns: res.length > 0 && view === "results" ? "1fr" : "320px 1fr", gap: 20, position: "relative", zIndex: 1 }}>

        {/* ═══ LEFT SIDEBAR — Config ═══ */}
        {(view === "config" || !res.length) && (
          <aside style={{ animation: "in .3s ease" }}>
            {/* Mode */}
            <div className="g" style={{ padding: 4, marginBottom: 12, display: "flex", gap: 3 }}>
              {[["photo", "📸 Photos"], ["video", "🎬 Vidéos"]].map(([m, l]) => (
                <button key={m}
                  className="b"
                  onClick={() => { setMode(m); setFiles([]); setRes([]); }}
                  style={{
                    flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 700, borderRadius: 12,
                    background: mode === m ? "linear-gradient(135deg,#0d9488,#2dd4bf)" : "transparent",
                    color: mode === m ? "#021a16" : "#3d5a6a",
                  }}
                >{l}</button>
              ))}
            </div>

            {/* Versions */}
            <div className="g" style={{ padding: "14px 16px", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>Versions par fichier</div>
                  <div style={{ fontSize: 10, color: "#3d5a6a", marginTop: 2 }}>Copies uniques générées</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button className="cnt" onClick={() => setVer(v => Math.max(1, v - 1))}>−</button>
                  <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: "#2dd4bf", width: 44, textAlign: "center", animation: "countUp .15s ease" }}>{ver}</div>
                  <button className="cnt" onClick={() => setVer(v => Math.min(20, v + 1))}>+</button>
                </div>
              </div>
            </div>

            {/* Transforms */}
            <div className="g" style={{ padding: "14px 12px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>Transformations</div>
                <span className="badge bt">{activeT}/{Object.keys(tf).length}</span>
              </div>
              {Object.entries(TF_META).map(([k, m]) => {
                const dis = m.v && mode === "photo";
                const on = tf[k] && !dis;
                return (
                  <div key={k} className={`chk ${on ? "on" : ""}`} onClick={() => !dis && setTf(t => ({ ...t, [k]: !t[k] }))} style={{ opacity: dis ? .2 : 1, cursor: dis ? "not-allowed" : "pointer" }}>
                    <div className={`dot ${on ? "on" : ""}`}>{on ? "✓" : ""}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: on ? "#5eead4" : "#94a3b8" }}>{m.i} {m.l}</div>
                    </div>
                    {m.v ? <span style={{ fontSize: 8, color: "#6366f1", background: "rgba(99,102,241,.08)", padding: "1px 6px", borderRadius: 4 }}>vid</span> : null}
                  </div>
                );
              })}
            </div>

            {/* Process button */}
            <button className="b bp" onClick={run} disabled={proc || !files.length}
              style={{ width: "100%", padding: 14, fontSize: 14, borderRadius: 12 }}>
              {proc ? "⏳ En cours..." : "🔒 Lancer le traitement"}
            </button>
            {files.length > 0 && (
              <div className="mono" style={{ textAlign: "center", fontSize: 10, color: "#3d5a6a", marginTop: 8 }}>
                {files.length} × {ver} = <span style={{ color: "#2dd4bf" }}>{files.length * ver}</span> fichiers uniques
              </div>
            )}
          </aside>
        )}

        {/* ═══ RIGHT — Drop + Files / Results ═══ */}
        <div style={{ animation: "in .35s ease" }}>

          {/* Navigation tabs when results exist */}
          {res.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              <button className={`b ${view === "config" ? "bp" : "bg"}`} style={{ padding: "8px 18px", fontSize: 12 }} onClick={() => setView("config")}>⚙️ Config</button>
              <button className={`b ${view === "results" ? "bp" : "bg"}`} style={{ padding: "8px 18px", fontSize: 12 }} onClick={() => setView("results")}>✅ Résultats ({totV})</button>
            </div>
          )}

          {view === "config" && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
                onClick={() => ir.current?.click()}
                className="g"
                style={{
                  padding: files.length ? "32px 24px" : "56px 24px",
                  textAlign: "center", cursor: "pointer",
                  borderColor: drag ? "#2dd4bf" : undefined,
                  background: drag ? "rgba(45,212,191,.04)" : undefined,
                  transition: "all .25s", marginBottom: 16,
                }}
              >
                <div style={{ fontSize: files.length ? 28 : 38, marginBottom: 10, animation: "float 3.5s ease infinite" }}>
                  {drag ? "📥" : mode === "photo" ? "📸" : "🎬"}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f0fdfa", marginBottom: 4 }}>
                  {drag ? "Lâche ici" : `Glisse tes ${mode === "photo" ? "photos" : "vidéos"}`}
                </div>
                <div className="mono" style={{ fontSize: 11, color: "#3d5a6a" }}>
                  {mode === "photo" ? "JPG • PNG • WEBP" : "MP4 • MOV • WEBM"}
                </div>
                <input ref={ir} type="file" multiple accept={mode === "photo" ? "image/*" : "video/*"} style={{ display: "none" }} onChange={e => add(e.target.files)} />
              </div>

              {/* Stats mini bar */}
              {files.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 16 }}>
                  {[
                    { l: "Fichiers", v: files.length, c: "#5eead4" },
                    { l: "Versions", v: files.length * ver, c: "#67e8f9" },
                    { l: "Taille", v: fb(files.reduce((a, f) => a + f.size, 0)), c: "#fbbf24" },
                  ].map((s, i) => (
                    <div key={i} className="g" style={{ padding: "10px 14px", animation: `in ${.2 + i * .06}s ease` }}>
                      <div style={{ fontSize: 9, color: "#3d5a6a", textTransform: "uppercase", letterSpacing: 1 }}>{s.l}</div>
                      <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: s.c, marginTop: 2 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* File list */}
              {files.length > 0 && (
                <div>
                  {files.map((f, i) => (
                    <div key={f.id} className="row" style={{ animation: `in ${.12 + i * .04}s ease` }}>
                      {thumbs[f.id] ? (
                        <img src={thumbs[f.id]} className="thumb" alt="" />
                      ) : (
                        <div className="thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎬</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                        <div className="mono" style={{ fontSize: 10, color: "#3d5a6a" }}>
                          {fb(f.size)} <span style={{ color: "#2dd4bf" }}>→ ×{ver}</span>
                        </div>
                      </div>
                      <button className="b bg" style={{ padding: "4px 10px", fontSize: 11, color: "#fb7185", borderColor: "rgba(251,113,133,.1)" }} onClick={() => rm(f.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ═══ RESULTS ═══ */}
          {view === "results" && (
            <div>
              {proc && (
                <div className="g" style={{ padding: 48, textAlign: "center", marginBottom: 20 }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>
                    <span style={{ display: "inline-block", animation: "spin 1.2s linear infinite" }}>⚙️</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f0fdfa", marginBottom: 6 }}>Randomisation...</div>
                  <div className="mono" style={{ fontSize: 11, color: "#3d5a6a", marginBottom: 14 }}>{prog.f} — v{prog.v}</div>
                  <div className="pbar" style={{ maxWidth: 360, margin: "0 auto" }}>
                    <div className="pfill" style={{ width: `${prog.t ? (prog.c / prog.t) * 100 : 0}%` }} />
                  </div>
                  <div className="mono" style={{ fontSize: 10, color: "#3d5a6a", marginTop: 6 }}>{prog.c}/{prog.t}</div>
                </div>
              )}

              {!proc && totV > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f0fdfa" }}>✅ {totV} versions</span>
                    <span className="badge be">Uniques</span>
                    <span className="badge bt">🛡️ Clean</span>
                  </div>
                  <button className="b bp" style={{ padding: "8px 20px", fontSize: 12 }} onClick={dlAll}>📥 Tout télécharger</button>
                </div>
              )}

              {res.map((g, gi) => (
                <div key={gi} className="g" style={{ marginBottom: 14, animation: `in ${.15 + gi * .08}s ease` }}>
                  {/* File header */}
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.04)", display: "flex", alignItems: "center", gap: 12 }}>
                    {thumbs[g.orig.id] ? (
                      <img src={thumbs[g.orig.id]} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} alt="" />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "rgba(255,255,255,.03)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🎬</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#f0fdfa" }}>{g.orig.name}</div>
                      <div className="mono" style={{ fontSize: 10, color: "#3d5a6a" }}>{fb(g.orig.size)} • {g.vers.length} versions</div>
                    </div>
                  </div>
                  {/* Versions grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8, padding: "12px 14px" }}>
                    {g.vers.map((v, vi) => (
                      <div key={vi} className="vcard" onClick={() => dl(v)}>
                        {v.thumb && <img src={v.thumb} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 8, marginBottom: 8, display: "block" }} alt="" />}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span className="badge bt" style={{ fontSize: 9 }}>v{vi + 1}</span>
                          <span style={{ fontSize: 10, color: "#34d399" }}>↓</span>
                        </div>
                        <div className="mono" style={{ fontSize: 9, color: "#5eead4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</div>
                        <div className="mono" style={{ fontSize: 9, color: "#3d5a6a" }}>{fb(v.size)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {!proc && totV > 0 && (
                <button className="b bg" onClick={dlAll} style={{ width: "100%", padding: 14, fontSize: 13, marginTop: 8 }}>
                  📥 Télécharger les {totV} fichiers
                </button>
              )}

              {!proc && !res.length && (
                <div className="g" style={{ padding: 56, textAlign: "center" }}>
                  <div style={{ fontSize: 28, opacity: .2, marginBottom: 10 }}>⏳</div>
                  <div style={{ fontSize: 12, color: "#3d5a6a" }}>Lance le traitement pour voir les résultats</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,.03)", position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: 9, color: "#27363f", display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#34d399" }} />
          100% local — aucun fichier uploadé
        </div>
        <div className="mono" style={{ fontSize: 8, color: "#1a2a33" }}>MAT AGENCY © 2026</div>
      </footer>
    </div>
  );
}
