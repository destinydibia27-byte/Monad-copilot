import { useState, useEffect } from "react";
import { supabase } from "./main";
import { T, CATEGORIES, SOURCES, MOBILE } from "./constants/theme";
import { GITHUB_SOURCES } from "./constants/github";
import { useIsMobile } from "./hooks/useWindowWidth";
import { useDrafts } from "./hooks/useDrafts";
import { useGitHubUpdates } from "./hooks/useGitHubUpdates";
import { StatCard } from "./components/StatCard";
import { DraftCard } from "./components/DraftCard";
import { UpdateRow } from "./components/UpdateRow";
import { EditModal } from "./components/EditModal";
import { GenPanel } from "./components/GenPanel";
import { Toast, Dot, PillBtn, GeneratingBar, SrcChip } from "./components/UI";

export default function MonadCoPilot({ session }) {
  const isMobile = useIsMobile();
  const user = session?.user;
  const signOut = () => supabase.auth.signOut();

  // ── UI State ─────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState("drafts");
  const [filterCat,    setFilterCat]    = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [editingDraft, setEditingDraft] = useState(null);
  const [generating,   setGenerating]   = useState(false);
  const [showGenPanel, setShowGenPanel] = useState(false);
  const [newDraftIds, setNewDraftIds] = useState([]);
  const [toast,        setToast]        = useState(null);
  const [selectedIds,  setSelectedIds]  = useState([]);
  const [time,         setTime]         = useState(new Date());

  // ── Clock ─────────────────────────────────────────────────
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ── Toast helper ──────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // ── Data hooks ────────────────────────────────────────────
  const { drafts, loading: draftsLoading, updateStatus, saveEdit, generate } = useDrafts(showToast);
  const { updates: allUpdates, loading: githubLoading, error: githubError } = useGitHubUpdates();

  // ── Helpers ───────────────────────────────────────────────
  const toggleSelect = id =>
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const handleGenerate = async (customInput) => {
    setGenerating(true);
    setShowGenPanel(false);
    const selected = allUpdates.filter(u => selectedIds.includes(u.id));
    const context = selected.length > 0
      ? selected.map(u => `[${u.source} · ${u.category}] ${u.text}`).join("\n")
      : customInput;

    const ok = await generate({ context, selectedIds, allUpdates });
    if (ok) {
      setSelectedIds([]);
      setActiveTab("drafts");
      if (ok) { setNewDraftIds(ok.map(d => d.id)); setTimeout(() => setNewDraftIds([]), 3000); }
    }
    setGenerating(false);
  };

  const filteredDrafts = drafts.filter(d => {
    if (filterCat    !== "All" && d.category !== filterCat)    return false;
    if (filterStatus !== "All" && d.status   !== filterStatus) return false;
    return true;
  });

  const counts = {
    pending:  drafts.filter(d => d.status === "pending").length,
    approved: drafts.filter(d => d.status === "approved").length,
    edited:   drafts.filter(d => d.status === "edited").length,
    rejected: drafts.filter(d => d.status === "rejected").length,
  };

  const highSignal = allUpdates.filter(u => u.weight >= 8).length;
  const dateStr = time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeStr = time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, position: "relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:ital,wght@0,400;0,450;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${T.bg}; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        button { font-feature-settings: "cv11","ss01"; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border2}; border-radius: 2px; }
        textarea { resize: vertical; }
        textarea::placeholder { color: ${T.textDim}; font-family: 'Inter', sans-serif; font-size: 13.5px; }
        @media (max-width: 430px) { button { -webkit-tap-highlight-color: transparent; } }
        @keyframes cardSlideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes toastIn     { from { opacity: 0; transform: translateX(12px);  } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulseRing   { 0%,100% { box-shadow: 0 0 0 0px rgba(74,222,128,0.4); } 50% { box-shadow: 0 0 0 5px rgba(74,222,128,0); } }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: `
          radial-gradient(ellipse 55% 35% at 75% 8%, ${T.purple}0D 0%, transparent 65%),
          radial-gradient(ellipse 35% 25% at 15% 85%, ${T.blue}09 0%, transparent 55%)
        `,
      }} />

      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {editingDraft && (
        <EditModal
          draft={editingDraft}
          onSave={text => { saveEdit(editingDraft.id, text); setEditingDraft(null); }}
          onCancel={() => setEditingDraft(null)}
        />
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px" }}>

        {/* ── HEADER ── */}
        <header style={{
          padding: isMobile ? "18px 0 16px" : "22px 0 20px",
          borderBottom: `1px solid ${T.border}`,
          marginBottom: isMobile ? 20 : 28,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          gap: isMobile ? 14 : 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, width: isMobile ? "100%" : "auto" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: `linear-gradient(135deg, ${T.purple} 0%, ${T.purpleD} 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, flexShrink: 0,
              boxShadow: `0 0 0 1px ${T.purple}40, 0 4px 16px ${T.purple}30`,
            }}>▲</div>

            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <h1 style={{
                fontFamily: "'Syne',sans-serif", fontSize: isMobile ? 18 : 21, fontWeight: 800,
                color: "#fff", letterSpacing: "-0.04em", lineHeight: 1,
              }}>Monad CT Co-Pilot</h1>
              <div style={{
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5,
                color: T.textDim, letterSpacing: "0.06em", marginTop: 5,
                display: "flex", alignItems: "center", gap: 6,
                width: isMobile ? "100%" : "auto",
              }}>
                {isMobile ? (
                  <>
                    <span>ECOSYSTEM</span>
                    <span style={{ color: T.border2 }}>·</span>
                    <span>{dateStr}</span>
                    <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", color: T.textSub, fontSize: 10 }}>{timeStr}</span>
                  </>
                ) : (
                  <>
                    <span>ECOSYSTEM INTELLIGENCE</span>
                    <span style={{ color: T.border2 }}>·</span>
                    <span>{dateStr}</span>
                    <span style={{ color: T.border2 }}>·</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>{timeStr}</span>
                  </>
                )}
              </div>
            </div>

            <span style={{
              fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, fontWeight: 500,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: T.purple, border: `1px solid ${T.purple}40`,
              padding: "3px 7px", borderRadius: 4, flexShrink: 0,
            }}>v1 MVP</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, width: isMobile ? "100%" : "auto" }}>
            {/* User avatar + sign out */}
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!isMobile && (
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.textDim, letterSpacing: "0.02em" }}>
                    {user.user_metadata?.full_name || user.email}
                  </span>
                )}
                {user.user_metadata?.avatar_url && (
                  <img src={user.user_metadata.avatar_url} alt="avatar" style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${T.border2}` }} />
                )}
                <button
                  onClick={() => signOut()}
                  style={{
                    background: "none", border: `1px solid ${T.border2}`, color: T.textDim,
                    padding: "5px 10px", borderRadius: 6, fontFamily: "'IBM Plex Mono',monospace",
                    fontSize: 9.5, letterSpacing: "0.06em", cursor: "pointer", transition: "color 0.15s, border-color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.textDim; }}
                  onMouseLeave={e => { e.currentTarget.style.color = T.textDim; e.currentTarget.style.borderColor = T.border2; }}
                >SIGN OUT</button>
              </div>
            )}
            {generating && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "'Inter',sans-serif", fontSize: 12, fontWeight: 450, color: T.purpleL, letterSpacing: "-0.01em" }}>
                <Dot color={T.purple} pulse />
                Generating
              </div>
            )}
            <button
              onClick={() => setShowGenPanel(true)}
              style={{
                background: T.purple, color: "#fff", border: "none",
                padding: isMobile ? "11px 0" : "10px 18px",
                width: isMobile ? "100%" : "auto",
                borderRadius: 8, fontFamily: "'Inter',sans-serif", fontSize: 13,
                fontWeight: 500, letterSpacing: "-0.01em", cursor: "pointer",
                transition: "opacity 0.15s", boxShadow: `0 4px 16px ${T.purple}35`,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >+ Generate Drafts</button>
          </div>
        </header>

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 28 }}>
          {[
            { label: "Pending Review", val: counts.pending,          color: T.purple, sub: "awaiting action",      filter: "pending"  },
            { label: "Approved",       val: counts.approved,         color: T.green,  sub: "ready to post",        filter: "approved" },
            { label: "Edited",         val: counts.edited,           color: T.yellow, sub: "modified",             filter: "edited"   },
            { label: "Rejected",       val: counts.rejected,         color: T.red,    sub: "archived",             filter: "rejected" },
            { label: "High Signal",    val: highSignal,              color: T.orange, sub: "≥8/10 score",          filter: null       },
            { label: "Repos Watched",  val: GITHUB_SOURCES.length,  color: T.blue,   sub: "monad-labs · kuru · apriori · lumiterra", filter: null },
          ].map(({ label, val, color, sub, filter }) => (
            <StatCard
              key={label}
              label={label} val={val} color={color} sub={sub}
              active={filter ? filterStatus === filter : false}
              onClick={filter ? () => {
                setFilterStatus(prev => prev === filter ? "All" : filter);
                setActiveTab("drafts");
              } : undefined}
            />
          ))}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `1px solid ${T.border}` }}>
          {[
            { key: "drafts",  label: "Drafts",            count: drafts.length     },
            { key: "updates", label: "Ecosystem Signals", count: allUpdates.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'Inter',sans-serif", fontSize: 13,
                fontWeight: activeTab === tab.key ? 500 : 400,
                letterSpacing: "-0.01em",
                padding: "10px 20px 11px", marginBottom: -1,
                color: activeTab === tab.key ? "#fff" : T.textDim,
                borderBottom: activeTab === tab.key ? `2px solid ${T.purple}` : "2px solid transparent",
                transition: "color 0.15s, border-color 0.15s",
                display: "flex", alignItems: "center", gap: 8,
              }}
              onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.color = T.textSub; }}
              onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.color = T.textDim; }}
            >
              {tab.label}
              <span style={{
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 9,
                fontVariantNumeric: "tabular-nums",
                padding: "2px 6px", borderRadius: 3,
                background: activeTab === tab.key ? `${T.purple}20` : T.border,
                color: activeTab === tab.key ? T.purple : T.textDim,
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── DRAFTS TAB ── */}
        {activeTab === "drafts" && (
          <div>
            {showGenPanel && (
              <GenPanel
                selectedCount={selectedIds.length}
                onGenerate={handleGenerate}
                onCancel={() => setShowGenPanel(false)}
                generating={generating}
              />
            )}
            {generating && <GeneratingBar />}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredDrafts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "56px 0", fontFamily: "'Inter',sans-serif", fontSize: 13, color: T.textDim, letterSpacing: "-0.01em" }}>
                  {draftsLoading ? "Loading drafts…" : "No drafts match current filters"}
                </div>
              ) : filteredDrafts.map(d => (
                <DraftCard
                  key={d.id}
                  draft={d}
		  isNew={newDraftIds.includes(d.id)}
                  updates={allUpdates}
                  onApprove={() => updateStatus(d.id, "approved")}
                  onReject={()  => updateStatus(d.id, "rejected")}
                  onReset={()   => updateStatus(d.id, "pending")}
                  onEdit={()    => setEditingDraft(d)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── UPDATES TAB ── */}
        {activeTab === "updates" && (
          <div>
            {showGenPanel && (
              <GenPanel
                selectedCount={selectedIds.length}
                onGenerate={handleGenerate}
                onCancel={() => { setShowGenPanel(false); setSelectedIds([]); }}
                generating={generating}
              />
            )}

            {/* Source summary */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              {SOURCES.map(s => (
                <div key={s} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", background: T.card, border: `1px solid ${T.border}`, borderRadius: 6,
                }}>
                  <SrcChip source={s} />
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: T.border2 }}>·</span>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.01em" }}>
                    {allUpdates.filter(u => u.source === s).length} updates
                  </span>
                </div>
              ))}
              {selectedIds.length > 0 && (
                <button
                  onClick={() => setShowGenPanel(true)}
                  style={{
                    marginLeft: isMobile ? 0 : "auto",
                    width: isMobile ? "100%" : "auto",
                    background: T.purple, border: "none", color: "#fff",
                    borderRadius: 7, padding: "9px 16px",
                    fontFamily: "'Inter',sans-serif", fontSize: 13,
                    fontWeight: 500, cursor: "pointer", letterSpacing: "-0.01em",
                    boxShadow: `0 4px 16px ${T.purple}30`, transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Generate from {selectedIds.length} selected →
                </button>
              )}
            </div>

            {/* GitHub status */}
            {githubLoading && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px", marginBottom: 12,
                background: T.card, border: `1px solid ${T.border}`, borderRadius: 8,
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: T.textDim, letterSpacing: "0.04em",
              }}>
                <Dot color={T.purple} pulse />
                Fetching live GitHub commits…
              </div>
            )}
            {githubError && (
              <div style={{
                padding: "12px 16px", marginBottom: 12,
                background: `${T.red}10`, border: `1px solid ${T.red}30`, borderRadius: 8,
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 10.5, color: T.red, letterSpacing: "0.04em",
              }}>
                ⚠ {githubError}
              </div>
            )}
            {!githubLoading && !githubError && allUpdates.length > 0 && (
              <div style={{
                padding: "10px 14px", marginBottom: 12,
                background: `${T.green}0C`, border: `1px solid ${T.green}25`, borderRadius: 8,
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: T.green,
                letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
              }}>
                <Dot color={T.green} pulse />
                {allUpdates.length} live commits from {[...new Set(GITHUB_SOURCES.map(s => s.label))].join(", ")}
                <span style={{ color: T.textDim, marginLeft: "auto" }}>refreshes every 5 min</span>
              </div>
            )}

            {/* Update list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {allUpdates.map(u => (
                <UpdateRow
                  key={u.id}
                  update={u}
                  selected={selectedIds.includes(u.id)}
                  onToggle={() => toggleSelect(u.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: `1px solid ${T.border}`, marginTop: isMobile ? 40 : 56,
          padding: "20px 0",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center",
          gap: 12,
        }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.07em" }}>
            MONAD CT CO-PILOT · ECOSYSTEM INTELLIGENCE TERMINAL
          </span>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {SOURCES.map(s => (
              <span key={s} style={{
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: "'IBM Plex Mono',monospace", fontSize: 9.5, color: T.textDim, letterSpacing: "0.02em",
              }}>
                <SrcChip source={s} />
                <Dot color={T.green} pulse />
              </span>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
