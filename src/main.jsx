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
    twitter: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.243 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
      </svg>
    ),
  };

  const providers = [
    { id: "google",  label: "Continue with Google" },
    { id: "github",  label: "Continue with GitHub" },
  ];

  return (
    <div style={{
      minHeight: "100dvh", background: T.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", padding: "16px",
    }}>
      <div style={{
        width: "100%", maxWidth: 300,
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 12, padding: "20px 18px",
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
              <span style={{ width: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>{icons[p.id]}</span>
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
    <div style={{ minHeight: "100dvh", background: "#0B0B0F", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#888899", fontFamily: "monospace", fontSize: 12 }}>Loading…</span>
    </div>
  );

  return session ? <App session={session} /> : <LoginScreen />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode><Root /></StrictMode>
);
