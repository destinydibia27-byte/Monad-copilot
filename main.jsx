import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider, SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import App from "./App";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

const clerkAppearance = {
  variables: {
    colorBackground: "#0B0B0F",
    colorInputBackground: "#13131a",
    colorText: "#e8e8f0",
    colorTextSecondary: "#888899",
    colorPrimary: "#7c3aed",
    colorInputText: "#e8e8f0",
    borderRadius: "10px",
    fontFamily: "'Inter', sans-serif",
  },
  elements: {
    card: { border: "1px solid #1e1e2e", boxShadow: "0 8px 40px rgba(0,0,0,0.6)" },
    headerTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: "-0.04em" },
    socialButtonsBlockButton: { border: "1px solid #1e1e2e", background: "#13131a" },
    footerActionLink: { color: "#7c3aed" },
  },
};

function LoginScreen() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0B0B0F",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 32,
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, margin: "0 auto 16px",
          boxShadow: "0 0 0 1px rgba(124,58,237,0.4), 0 4px 20px rgba(124,58,237,0.3)",
        }}>▲</div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800,
          color: "#fff", letterSpacing: "-0.04em", margin: 0,
        }}>Monad CT Co-Pilot</h1>
        <p style={{ color: "#888899", fontSize: 13, marginTop: 6, letterSpacing: "0.06em", fontFamily: "'IBM Plex Mono', monospace" }}>
          ECOSYSTEM INTELLIGENCE
        </p>
      </div>
      <SignIn routing="hash" />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={clerkAppearance}>
      <SignedOut>
        <LoginScreen />
      </SignedOut>
      <SignedIn>
        <App />
      </SignedIn>
    </ClerkProvider>
  </StrictMode>
);
