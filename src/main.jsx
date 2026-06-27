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

  const features = [
    { icon: "⚡", text: "Live GitHub signals from Monad ecosystem repos" },
    { icon: "✦",  text: "AI-generated tweet drafts in your voice" },
    { icon: "✓",  text: "Approve, edit, and post directly to X" },
  ];

  const providers = [
    { id: "google", label: "Continue with Google" },
    { id: "github", label: "Continue with GitHub" },
  ];

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0B0B0F",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      padding: "16px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;450;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        .login-card { animation: fadeUp 0.5s ease forwards; }
        .logo-wrap  { animation: float 4s ease-in-out infinite; }
      `}</style>

      {/* Background glows */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "20%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)",
          filter: "blur(30px)",
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "15%",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(74,222,128,0.05) 0%, transparent 70%)",
          filter: "blur(20px)",
        }} />
      </div>

      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      {/* Card */}
      <div className="login-card" style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 380,
        background: "rgba(19,19,26,0.85)",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: 20,
        padding: "36px 32px 28px",
        boxShadow: "0 0 0 1px rgba(124,58,237,0.1), 0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
      }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="logo-wrap" style={{ display: "inline-block", marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "linear-gradient(135deg, #836EF9 0%, #5b21b6 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, margin: "0 auto",
              boxShadow: "0 0 0 1px rgba(131,110,249,0.5), 0 0 32px rgba(131,110,249,0.4), 0 8px 24px rgba(0,0,0,0.4)",
            }}>▲</div>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800,
            color: "#fff", letterSpacing: "-0.04em", margin: "0 0 6px", lineHeight: 1.1,
          }}>Monad CT Co-Pilot</h1>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 6 }}>
            <div style={{ height: 1, width: 32, background: "rgba(124,58,237,0.3)" }} />
            <span style={{
              color: "#836EF9", fontSize: 10, letterSpacing: "0.12em",
              fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500,
            }}>ECOSYSTEM INTELLIGENCE</span>
            <div style={{ height: 1, width: 32, background: "rgba(124,58,237,0.3)" }} />
          </div>
        </div>

        {/* Feature highlights */}
        <div style={{
          background: "rgba(131,110,249,0.06)",
          border: "1px solid rgba(131,110,249,0.12)",
          borderRadius: 12, padding: "14px 16px", marginBottom: 24,
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {features.map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: "rgba(131,110,249,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#836EF9",
              }}>{icon}</span>
              <span style={{
                fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 450,
                color: "#9896B8", letterSpacing: "-0.01em", lineHeight: 1.4,
              }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {providers.map(p => (
            <button
              key={p.id}
              onClick={() => signIn(p.id)}
              disabled={loading}
              onMouseEnter={() => setHoveredBtn(p.id)}
              onMouseLeave={() => setHoveredBtn(null)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "13px 16px", borderRadius: 10,
                background: hoveredBtn === p.id ? "rgba(131,110,249,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${hoveredBtn === p.id ? "rgba(131,110,249,0.5)" : "rgba(255,255,255,0.08)"}`,
                color: "#E4E2FF", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
                transition: "all 0.2s", opacity: loading ? 0.6 : 1,
                letterSpacing: "-0.01em",
              }}
            >
              <span style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {loading ? (
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(131,110,249,0.3)", borderTopColor: "#836EF9", animation: "spin 0.8s linear infinite" }} />
                ) : icons[p.id]}
              </span>
              {loading ? "Signing in..." : p.label}
              {!loading && (
                <span style={{ marginLeft: "auto", color: "#5C5A7A", fontSize: 12 }}>→</span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div style={{
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 8, padding: "10px 14px", marginBottom: 16,
            color: "#f87171", fontSize: 12, textAlign: "center",
            fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.02em",
          }}>{error}</div>
        )}

        {/* Footer */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 16, textAlign: "center" }}>
          <p style={{ color: "#5C5A7A", fontSize: 11, margin: "0 0 10px", lineHeight: 1.6, letterSpacing: "0.01em" }}>
            By signing in you agree to use this tool responsibly<br />for Monad ecosystem content.
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9,
              color: "#836EF9", letterSpacing: "0.08em",
              background: "rgba(131,110,249,0.1)", border: "1px solid rgba(131,110,249,0.2)",
              padding: "2px 8px", borderRadius: 4,
            }}>v1 MVP</span>
            <span style={{ color: "#5C5A7A", fontSize: 9, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.06em" }}>
              · BUILT FOR MONAD
            </span>
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
