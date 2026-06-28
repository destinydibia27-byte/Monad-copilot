import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import App from "./App";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const T = {
  bg: "#0B0B0F", card: "#13131a", border: "#1e1e2e",
  purple: "#7c3aed", text: "#e8e8f0", textDim: "#888899",
};

function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const signIn = async (provider) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: "https://monad-copilot.vercel.app" },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const icons = {
    google: (
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    github: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  };

  const slides = [
    { icon: "⚡", title: "Live GitHub Signals", desc: "Real-time commits from Monad ecosystem repos — Kuru, aPriori, Lumiterra and more." },
    { icon: "✦",  title: "AI Tweet Drafts",     desc: "Groq-powered drafts written in your voice. Two options generated per signal." },
    { icon: "✓",  title: "One-Click to X",      desc: "Approve, edit, or reject drafts. Post approved tweets directly to X instantly." },
  ];
  const [slideIdx, setSlideIdx] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => { setSlideIdx(i => (i + 1) % 3); setFadeIn(true); }, 250);
    }, 2800);
    return () => clearInterval(t);
  }, []);

  const providers = [
    { id: "google", label: "Continue with Google" },
    { id: "github", label: "Continue with GitHub" },
  ];

  return (
    <div style={{
      minHeight: "100dvh", background: "#07070D",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", padding: "16px",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;450;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes floatOrb1 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(30px,-20px) scale(1.05);} 66%{transform:translate(-20px,15px) scale(0.97);} }
        @keyframes floatOrb2 { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(-25px,20px) scale(1.03);} 66%{transform:translate(20px,-15px) scale(0.98);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes shimmer { 0%{opacity:0.04;} 50%{opacity:0.09;} 100%{opacity:0.04;} }
        .login-card { animation: fadeUp 0.5s ease forwards; }
        .orb1 { animation: floatOrb1 8s ease-in-out infinite; }
        .orb2 { animation: floatOrb2 10s ease-in-out infinite; }
        .monad-bg { animation: shimmer 4s ease-in-out infinite; }
        .login-title { font-family: Syne, sans-serif; font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.04em; margin: 0 0 8px; line-height: 1.1; white-space: nowrap; }
        @media (max-width: 440px) { .login-title { font-size: 22px; white-space: normal; } }
        .login-inner { padding: 36px 32px 28px; }
        @media (max-width: 440px) { .login-inner { padding: 28px 20px 22px; } }
      `}</style>

      <div className="orb1" style={{ position:"absolute", top:"8%", left:"12%", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle, rgba(131,110,249,0.35) 0%, rgba(91,33,182,0.15) 50%, transparent 75%)", filter:"blur(48px)", pointerEvents:"none" }} />
      <div className="orb2" style={{ position:"absolute", bottom:"10%", right:"8%", width:280, height:280, borderRadius:"50%", background:"radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(124,58,237,0.1) 50%, transparent 75%)", filter:"blur(40px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"30%", left:"5%", width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle, rgba(96,165,250,0.15) 0%, transparent 70%)", filter:"blur(30px)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"60%", right:"20%", width:100, height:100, borderRadius:"50%", background:"radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 70%)", filter:"blur(20px)", pointerEvents:"none" }} />

      <div className="login-card" style={{ position:"relative", zIndex:1, width:"100%", maxWidth:"min(400px, calc(100vw - 32px))", borderRadius:24, overflow:"hidden", boxShadow:"0 0 0 1px rgba(131,110,249,0.15), 0 32px 80px rgba(0,0,0,0.8)" }}>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg, rgba(30,20,60,0.96) 0%, rgba(13,10,25,0.99) 60%, rgba(20,10,40,0.96) 100%)", backdropFilter:"blur(24px)" }} />

        <div className="monad-bg" style={{ position:"absolute", bottom:-40, right:-40, width:280, height:280, pointerEvents:"none", zIndex:0 }}>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%" }}>
            <defs>
              <linearGradient id="monadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#836EF9" stopOpacity="0.18"/>
                <stop offset="100%" stopColor="#C084FC" stopOpacity="0.06"/>
              </linearGradient>
            </defs>
            {/* Monad logo: rounded diamond with rounded square cutout */}
            <path d="M50 8 C65 8, 92 35, 92 50 C92 65, 65 92, 50 92 C35 92, 8 65, 8 50 C8 35, 35 8, 50 8 Z" fill="url(#monadGrad)" stroke="rgba(131,110,249,0.25)" strokeWidth="0.8"/>
            <path d="M50 28 C58 28, 72 42, 72 50 C72 58, 58 72, 50 72 C42 72, 28 58, 28 50 C28 42, 42 28, 50 28 Z" fill="rgba(7,7,13,0.9)" stroke="rgba(131,110,249,0.1)" strokeWidth="0.5"/>
          </svg>
        </div>

        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg, transparent 0%, rgba(131,110,249,0.6) 30%, rgba(192,132,252,0.4) 70%, transparent 100%)", zIndex:2 }} />

        <div className="login-inner" style={{ position:"relative", zIndex:2 }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ margin:"0 auto 18px", width:64, height:64, display:"flex", alignItems:"center", justifyContent:"center", filter:"drop-shadow(0 0 20px rgba(131,110,249,0.6))" }}>
              <svg width="64" height="64" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="9" fill="#13123A"/>
                <path d="M16 6L27 25H5L16 6Z" stroke="#836EF9" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
                <path d="M16 11L23 22H9L16 11Z" fill="white"/>
                <line x1="12" y1="27" x2="20" y2="27" stroke="#836EF9" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="login-title">Monad CT Co-Pilot</h1>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <div style={{ height:1, width:28, background:"linear-gradient(90deg, transparent, rgba(131,110,249,0.5))" }} />
              <span style={{ color:"#836EF9", fontSize:9.5, letterSpacing:"0.14em", fontFamily:"'IBM Plex Mono', monospace", fontWeight:500 }}>ECOSYSTEM INTELLIGENCE</span>
              <div style={{ height:1, width:28, background:"linear-gradient(90deg, rgba(131,110,249,0.5), transparent)" }} />
            </div>
          </div>

          <div style={{ background:"rgba(131,110,249,0.06)", border:"1px solid rgba(131,110,249,0.14)", borderRadius:14, padding:"20px 16px", marginBottom:20, minHeight:130, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", gap:12, transition:"opacity 0.25s", opacity:fadeIn?1:0 }}>
            <span style={{ width:46, height:46, borderRadius:13, background:"rgba(131,110,249,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:"#836EF9" }}>{slides[slideIdx].icon}</span>
            <div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:600, color:"#E4E2FF", marginBottom:6 }}>{slides[slideIdx].title}</div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:12.5, color:"#9896B8", lineHeight:1.5, letterSpacing:"-0.01em" }}>{slides[slideIdx].desc}</div>
            </div>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:20 }}>
            {slides.map((_, i) => (
              <div key={i} onClick={() => setSlideIdx(i)} style={{ width:i===slideIdx?20:6, height:6, borderRadius:3, background:i===slideIdx?"#836EF9":"rgba(131,110,249,0.25)", transition:"all 0.3s", cursor:"pointer" }} />
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#5C5A7A", letterSpacing:"0.08em" }}>SIGN IN WITH</span>
            <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.06)" }} />
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {providers.map(p => (
              <button key={p.id} onClick={() => signIn(p.id)} disabled={loading}
                onMouseEnter={() => setHoveredBtn(p.id)} onMouseLeave={() => setHoveredBtn(null)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderRadius:10, background:hoveredBtn===p.id?"rgba(131,110,249,0.1)":"rgba(255,255,255,0.04)", border:hoveredBtn===p.id?"1px solid rgba(131,110,249,0.45)":"1px solid rgba(255,255,255,0.08)", color:"#E4E2FF", cursor:loading?"not-allowed":"pointer", fontFamily:"'Inter', sans-serif", fontSize:14, fontWeight:500, transition:"all 0.2s", opacity:loading?0.6:1, letterSpacing:"-0.01em", boxShadow:hoveredBtn===p.id?"0 0 20px rgba(131,110,249,0.1)":"none" }}
              >
                <span style={{ width:20, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {loading ? <div style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(131,110,249,0.3)", borderTopColor:"#836EF9", animation:"spin 0.8s linear infinite" }} /> : icons[p.id]}
                </span>
                {loading ? "Signing in..." : p.label}
                {!loading && <span style={{ marginLeft:"auto", color:"#5C5A7A", fontSize:13 }}>&#8594;</span>}
              </button>
            ))}
          </div>

          {error && <div style={{ background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#f87171", fontSize:12, textAlign:"center", fontFamily:"'IBM Plex Mono', monospace" }}>{error}</div>}

          <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:16, textAlign:"center" }}>
            <p style={{ color:"#5C5A7A", fontSize:11, margin:"0 0 10px", lineHeight:1.6 }}>By signing in you agree to use this tool responsibly<br/>for Monad ecosystem content.</p>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:9, color:"#836EF9", background:"rgba(131,110,249,0.1)", border:"1px solid rgba(131,110,249,0.2)", padding:"2px 8px", borderRadius:4, letterSpacing:"0.08em" }}>v1 MVP</span>
              <span style={{ color:"#5C5A7A", fontSize:9, fontFamily:"'IBM Plex Mono', monospace", letterSpacing:"0.06em" }}>· BUILT FOR MONAD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Root() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return (
    <div style={{ minHeight: "100dvh", background: "#0B0B0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#888899", fontFamily: "monospace", fontSize: 12 }}>Loading…</span>
    </div>
  );

  return session ? <App session={session} /> : <LoginScreen />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode><Root /></StrictMode>
);
