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

  const signIn = async (provider) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const providers = [
    { id: "google",  label: "Continue with Google", icon: "G" },
    { id: "github",  label: "Continue with GitHub", icon: "⌥" },
    { id: "twitter", label: "Continue with X",      icon: "𝕏" },
  ];

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", padding: 24,
    }}>
      <div style={{
        width: "100%", maxWidth: 360,
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: 32,
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, margin: "0 auto 14px",
            boxShadow: "0 0 0 1px rgba(124,58,237,0.4), 0 4px 20px rgba(124,58,237,0.3)",
          }}>▲</div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800,
            color: "#fff", letterSpacing: "-0.04em", margin: "0 0 6px",
          }}>Monad CT Co-Pilot</h1>
          <p style={{
            color: T.textDim, fontSize: 11, margin: 0,
            letterSpacing: "0.08em", fontFamily: "'IBM Plex Mono', monospace",
          }}>ECOSYSTEM INTELLIGENCE</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {providers.map(p => (
            <button
              key={p.id}
              onClick={() => signIn(p.id)}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", borderRadius: 9,
                background: "transparent", border: `1px solid ${T.border}`,
                color: T.text, cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500,
                transition: "border-color 0.15s, background 0.15s",
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#7c3aed"; e.currentTarget.style.background = "rgba(124,58,237,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: 12, textAlign: "center", marginTop: 16 }}>{error}</p>
        )}

        <p style={{ color: T.textDim, fontSize: 11, textAlign: "center", marginTop: 20, lineHeight: 1.5 }}>
          By signing in you agree to use this tool responsibly for Monad ecosystem content.
        </p>
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
    <div style={{ minHeight: "100vh", background: "#0B0B0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#888899", fontFamily: "monospace", fontSize: 12 }}>Loading…</span>
    </div>
  );

  return session ? <App session={session} /> : <LoginScreen />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode><Root /></StrictMode>
);
