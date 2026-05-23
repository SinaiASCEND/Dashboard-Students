// ============================================================================
// Related Sessions
// ----------------------------------------------------------------------------
// Adds a "related sessions" surface to the ASCEND Navigator session detail.
// For a given target session, finds conceptually-related sessions both inside
// the same module ("Within this module") and across the rest of the
// curriculum ("Across the curriculum"). Clicking a related session opens a
// fixed-position compare drawer on the right.
//
// Relatedness is a blended score over several signals:
//   - shared MEPOs       (cross-module canonical; via window.MEPO_MAPPING)
//   - shared MLOs        (within-module only; numbers are module-scoped)
//   - shared AOC / AOC subdomain
//   - shared RCE thread
//   - shared keyword tags
//   - title + objective token overlap (small bonus, weak signal)
//
// Exposed on window.RelatedSessions = { Panel, Drawer, findRelatedSessions }.
// SessionObjectives renders <window.RelatedSessions.Panel> at its bottom; the
// drawer is rendered once at top level of the panel and toggled by row clicks.
// ============================================================================

(function () {
  const { useState, useMemo, useEffect } = React;

  // ---------------------------------------------------------------------------
  // Tokenization & normalization helpers
  // ---------------------------------------------------------------------------

  const STOP = new Set((
    "a an and are as at be by for from has have how in into is it its of on or " +
    "that the their them these this those to was were will with you your into " +
    "via using used use also one two when where which while can may such "
  ).split(/\s+/).filter(Boolean));

  function tokenize(text) {
    return (text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 3 && !STOP.has(t));
  }
  function splitTags(text) {
    return (text || "").split(/[;,]/).map(s => s.trim()).filter(Boolean);
  }
  function norm(s) {
    return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  // ---------------------------------------------------------------------------
  // Per-session feature extraction (memoized in a WeakMap by session ref)
  // ---------------------------------------------------------------------------

  const featureCache = new WeakMap();
  function features(session) {
    if (!session) return null;
    const hit = featureCache.get(session);
    if (hit) return hit;
    const stringMap = (window.MEPO_MAPPING && window.MEPO_MAPPING.stringMap) || [];
    // Build a one-time lookup of normalized MLO text -> mepo numbers
    if (!features._mepoLookup) {
      const m = new Map();
      for (const e of stringMap) m.set(norm(e.s), e.mepos || []);
      features._mepoLookup = m;
    }
    const mepoLookup = features._mepoLookup;
    const mepos = new Set();
    for (const mloText of (session.mepos || [])) {
      const arr = mepoLookup.get(norm(mloText));
      if (arr) arr.forEach(n => mepos.add(n));
    }
    const mlos = new Set();
    (session.objectives || []).forEach(o => (o.mlos || []).forEach(n => mlos.add(n)));

    const aoc = new Set(splitTags(session.aoc).map(s => s.toLowerCase()));
    const aocSub = new Set(splitTags(session.aocSubdomain).map(s => s.toLowerCase()));
    const rce = new Set(splitTags(session.rce).map(s => s.toLowerCase()));
    const keywords = new Set(splitTags(session.keywords).map(s => s.toLowerCase()));
    const objText = (session.objectives || []).map(o => o.text).join(" ");
    const toks = new Set([...tokenize(session.title || ""), ...tokenize(objText)]);

    const out = { mepos, mlos, aoc, aocSub, rce, keywords, toks };
    featureCache.set(session, out);
    return out;
  }

  function intersect(a, b) {
    const out = [];
    for (const x of a) if (b.has(x)) out.push(x);
    return out;
  }

  // ---------------------------------------------------------------------------
  // Score: target session vs candidate session.
  // Returns { score:number, reasons:{ mepos, mlos, aoc, aocSub, rce, keywords, tokens } }
  // ---------------------------------------------------------------------------

  function scoreRelated(target, cand, sameModule, opts) {
    const keywordsOnly = !!(opts && opts.keywordsOnly);
    const t = features(target);
    const c = features(cand);
    const reasons = {};
    let score = 0;

    if (!keywordsOnly) {
      const mepShared = intersect(t.mepos, c.mepos);
      if (mepShared.length) { score += mepShared.length * 3.0; reasons.mepos = mepShared.sort((a,b)=>a-b); }

      if (sameModule) {
        const mloShared = intersect(t.mlos, c.mlos);
        if (mloShared.length) { score += mloShared.length * 2.0; reasons.mlos = mloShared.sort((a,b)=>a-b); }
      }

      const aocShared = intersect(t.aoc, c.aoc);
      if (aocShared.length) { score += aocShared.length * 3.5; reasons.aoc = aocShared; }
      const aocSubShared = intersect(t.aocSub, c.aocSub);
      if (aocSubShared.length) { score += aocSubShared.length * 2.0; reasons.aocSub = aocSubShared; }

      const rceShared = intersect(t.rce, c.rce);
      if (rceShared.length) { score += rceShared.length * 3.0; reasons.rce = rceShared; }
    }

    const kwShared = intersect(t.keywords, c.keywords);
    if (kwShared.length) {
      // In keywords-only mode each shared keyword is worth more (since it's
      // the sole signal), and we keep diminishing returns so generic tags
      // like "anatomy" / "communication skills" don't dominate.
      const base = keywordsOnly ? 1.4 : 0.9;
      const step = keywordsOnly ? 0.8 : 0.55;
      const kwScore = kwShared.length === 1 ? base : base + (kwShared.length - 1) * step;
      score += kwScore;
      reasons.keywords = kwShared;
    }

    // SLO + title token overlap. In the default mode this is a small bonus on
    // top of the structured (MEPO/MLO/AOC/RCE) signals; in keywordsOnly mode
    // it is the second pillar alongside keyword overlap (per spec: "match by
    // keyword and also SLOs"). Tokens come from session.title + every SLO's
    // text, so this surfaces sessions whose objectives share concrete content
    // words even when no canonical tag links them.
    const tokShared = intersect(t.toks, c.toks);
    if (keywordsOnly) {
      // Lower threshold + higher weight when this is one of only two signals.
      if (tokShared.length >= 2) {
        score += Math.min(tokShared.length, 8) * 0.6;
        reasons.tokens = tokShared.slice(0, 5);
      }
    } else if (tokShared.length >= 3) {
      score += Math.min(tokShared.length, 8) * 0.3;
      reasons.tokens = tokShared.slice(0, 5);
    }

    return { score, reasons };
  }

  // ---------------------------------------------------------------------------
  // findRelatedSessions(target, targetModId, opts)
  // ---------------------------------------------------------------------------

  function findRelatedSessions(target, targetModId, opts) {
    const { maxWithin = 4, maxAcross = 6, minScore = 1.0, keywordsOnly = false } = opts || {};
    const SESSIONS = window.SESSIONS || {};
    const MODULES = (window.CURRICULUM && window.CURRICULUM.MODULES) || [];

    const within = [];
    const across = [];

    for (const m of MODULES) {
      const pack = SESSIONS[m.id];
      if (!pack || !pack.sessions) continue;
      const sameModule = m.id === targetModId;
      for (const cand of pack.sessions) {
        if (sameModule && cand.id === target.id) continue;
        const r = scoreRelated(target, cand, sameModule, { keywordsOnly });
        if (r.score < minScore) continue;
        const entry = { session: cand, mod: m, score: r.score, reasons: r.reasons };
        (sameModule ? within : across).push(entry);
      }
    }
    within.sort((a, b) => b.score - a.score);
    across.sort((a, b) => b.score - a.score);
    return { within: within.slice(0, maxWithin), across: across.slice(0, maxAcross) };
  }

  // ---------------------------------------------------------------------------
  // Why-it-relates summary builder (one short sentence per row)
  // ---------------------------------------------------------------------------

  function reasonChips(reasons) {
    const out = [];
    if (reasons.mepos && reasons.mepos.length) {
      reasons.mepos.slice(0, 3).forEach(n => out.push({ kind: "mepo", label: `MEPO ${n}` }));
      if (reasons.mepos.length > 3) out.push({ kind: "more", label: `+${reasons.mepos.length - 3}` });
    }
    if (reasons.mlos && reasons.mlos.length) {
      reasons.mlos.slice(0, 2).forEach(n => out.push({ kind: "mlo", label: `MLO ${n}` }));
    }
    if (reasons.aoc && reasons.aoc.length) {
      reasons.aoc.forEach(a => out.push({ kind: "aoc", label: a.toUpperCase() }));
    }
    if (reasons.aocSub && reasons.aocSub.length && !(reasons.aoc && reasons.aoc.length)) {
      reasons.aocSub.slice(0, 1).forEach(a => out.push({ kind: "aocSub", label: cap(a) }));
    }
    if (reasons.rce && reasons.rce.length) {
      reasons.rce.slice(0, 1).forEach(r => out.push({ kind: "rce", label: cap(r) }));
    }
    if (out.length === 0 && reasons.keywords && reasons.keywords.length) {
      reasons.keywords.slice(0, 2).forEach(k => out.push({ kind: "kw", label: cap(k) }));
    }
    if (out.length === 0 && reasons.tokens && reasons.tokens.length) {
      out.push({ kind: "topic", label: `topic: ${reasons.tokens.slice(0,2).join(", ")}` });
    }
    return out;
  }
  function cap(s) { return (s || "").replace(/\b\w/g, c => c.toUpperCase()); }

  const CHIP_STYLE = {
    mepo:   { bg: "var(--brand-cyan-tint)",   bd: "var(--brand-cyan)",       fg: "var(--brand-cyan-deep)" },
    mlo:    { bg: "var(--brand-cyan-tint)",   bd: "var(--brand-cyan)",       fg: "var(--brand-cyan-deep)" },
    aoc:    { bg: "rgba(139,92,246,0.10)",     bd: "rgba(139,92,246,0.45)",   fg: "rgb(94,53,177)" },
    aocSub: { bg: "rgba(139,92,246,0.06)",     bd: "rgba(139,92,246,0.30)",   fg: "rgb(94,53,177)" },
    rce:    { bg: "var(--grey-1)",             bd: "var(--grey-3)",           fg: "var(--ink-2)" },
    kw:     { bg: "var(--grey-1)",             bd: "var(--grey-3)",           fg: "var(--grey-11)" },
    topic:  { bg: "var(--grey-1)",             bd: "var(--grey-3)",           fg: "var(--grey-11)" },
    more:   { bg: "transparent",               bd: "var(--grey-3)",           fg: "var(--grey-11)" },
  };

  function ReasonChip({ chip }) {
    const s = CHIP_STYLE[chip.kind] || CHIP_STYLE.kw;
    return (
      <span style={{
        display: "inline-flex", alignItems: "center",
        fontSize: 10, fontWeight: 600, letterSpacing: "0.01em",
        padding: "1px 6px", borderRadius: 3,
        background: s.bg, color: s.fg, border: `1px solid ${s.bd}`,
        whiteSpace: "nowrap",
      }}>{chip.label}</span>
    );
  }

  // ---------------------------------------------------------------------------
  // RelatedSessionsPanel — rendered inline at bottom of session detail
  // ---------------------------------------------------------------------------

  function RelatedSessionsPanel({ session, mod, keywordsOnly = false }) {
    const [compare, setCompare] = useState(null); // { session, mod, reasons }
    const related = useMemo(() => {
      if (!session) return { within: [], across: [] };
      try {
        return findRelatedSessions(session, mod ? mod.id : null, { keywordsOnly });
      } catch (e) {
        console.warn("[related-sessions] scoring failed", e);
        return { within: [], across: [] };
      }
    }, [session && session.id, mod && mod.id, keywordsOnly]);

    if (!session) return null;
    const total = related.within.length + related.across.length;
    if (total === 0) {
      return (
        <div style={{ marginTop: 18, padding: "10px 12px", border: "1px dashed var(--grey-3)", borderRadius: 6, fontSize: 11.5, color: "var(--grey-11)" }}>
          No conceptually-related sessions found for this session yet.
        </div>
      );
    }

    return (
      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
          <div className="t-eyebrow">Related sessions</div>
          <div style={{ fontSize: 10.5, color: "var(--grey-11)" }}>
            {keywordsOnly
              ? "scored by shared keywords + SLO terms"
              : "scored by shared MEPOs · MLOs · AOC · RCE · keywords"}
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: related.within.length && related.across.length ? "1fr 1fr" : "1fr",
          gap: 12,
        }}>
          {related.within.length > 0 && (
            <RelatedColumn
              title={`Within ${mod ? (mod.short || mod.name || "this unit") : "this unit"}`}
              subtitle={mod && mod.short && mod.name && mod.short !== mod.name ? mod.name : ""}
              items={related.within}
              showModuleBadge={false}
              onOpen={(e) => setCompare(e)}
              activeId={compare && compare.session && compare.session.id}
            />
          )}
          {related.across.length > 0 && (
            <RelatedColumn
              title="Across ASCEND"
              subtitle={`${related.across.length} from ${new Set(related.across.map(e => e.mod.id)).size} modules`}
              items={related.across}
              showModuleBadge={true}
              onOpen={(e) => setCompare(e)}
              activeId={compare && compare.session && compare.session.id}
            />
          )}
        </div>

        {compare && (
          <CompareSessionDrawer
            entry={compare}
            target={session}
            targetMod={mod}
            keywordsOnly={keywordsOnly}
            onClose={() => setCompare(null)}
          />
        )}
      </div>
    );
  }

  function RelatedColumn({ title, subtitle, items, showModuleBadge, onOpen, activeId }) {
    return (
      <div style={{ border: "1px solid var(--grey-3)", borderRadius: 6, background: "var(--paper)", overflow: "hidden" }}>
        <div style={{
          padding: "7px 10px",
          background: "var(--grey-1)",
          borderBottom: "1px solid var(--grey-2)",
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-2)" }}>
            {title}
          </div>
          {subtitle ? <div style={{ fontSize: 10, color: "var(--grey-11)" }}>{subtitle}</div> : null}
        </div>
        <div>
          {items.map((e, i) => (
            <RelatedRow key={e.mod.id + "/" + e.session.id} entry={e}
                        showModuleBadge={showModuleBadge}
                        active={activeId === e.session.id}
                        first={i === 0}
                        onClick={() => onOpen(e)} />
          ))}
        </div>
      </div>
    );
  }

  function RelatedRow({ entry, showModuleBadge, active, first, onClick }) {
    const { session: s, mod, reasons, score } = entry;
    const chips = reasonChips(reasons);
    return (
      <button
        onClick={onClick}
        style={{
          width: "100%", textAlign: "left",
          padding: "9px 10px",
          borderTop: first ? "none" : "1px solid var(--grey-2)",
          borderLeft: "none", borderRight: "none", borderBottom: "none",
          background: active ? "var(--brand-cyan-tint)" : "transparent",
          cursor: "pointer",
          display: "flex", flexDirection: "column", gap: 5,
          fontFamily: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          {showModuleBadge && (
            <span style={{
              flex: "0 0 auto",
              fontSize: 9.5, fontWeight: 700, letterSpacing: "0.04em",
              padding: "1px 5px", borderRadius: 3,
              background: "var(--grey-2)", color: "var(--ink-2)",
              whiteSpace: "nowrap",
            }}>{mod.short}</span>
          )}
          <div style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)", lineHeight: 1.35 }}>
            {s.title}
          </div>
          <div style={{ flex: "0 0 auto", fontSize: 9.5, fontWeight: 600, color: "var(--grey-11)", fontVariantNumeric: "tabular-nums", paddingTop: 1 }}>
            {score.toFixed(1)}
          </div>
        </div>
        {chips.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {chips.map((c, i) => <ReasonChip key={i} chip={c} />)}
          </div>
        )}
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // CompareSessionDrawer — fixed slide-in on the right edge of the viewport
  // ---------------------------------------------------------------------------

  function CompareSessionDrawer({ entry, target, targetMod, keywordsOnly = false, onClose }) {
    const { session: s, mod, reasons } = entry;

    // Esc closes
    useEffect(() => {
      function onKey(e) { if (e.key === "Escape") onClose(); }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const allChips = reasonChips(reasons);
    const sameModule = mod && targetMod && mod.id === targetMod.id;

    function jump() {
      const fn = window.__navigateToSession;
      if (typeof fn === "function") {
        fn(mod.id, s.id);
        onClose();
      } else {
        console.warn("[related-sessions] no navigate fn registered");
      }
    }

    return (
      <>
        {/* backdrop (subtle, click closes) */}
        <div onClick={onClose} style={{
          position: "fixed", inset: 0, background: "rgba(15,23,42,0.18)",
          zIndex: 90, animation: "rs-fade 140ms ease-out",
        }}/>
        <div role="dialog" aria-label="Compare related session"
          style={{
            position: "fixed", top: 0, right: 0, height: "100vh",
            width: 460, maxWidth: "92vw",
            background: "var(--paper)", borderLeft: "1px solid var(--grey-3)",
            boxShadow: "-12px 0 32px rgba(15,23,42,0.12)",
            zIndex: 91, display: "flex", flexDirection: "column",
            animation: "rs-slidein 200ms cubic-bezier(.2,.7,.2,1)",
            fontFamily: "var(--font-sans, inherit)",
          }}>
          {/* Header */}
          <div style={{ padding: "14px 18px 12px", borderBottom: "1px solid var(--grey-2)", background: "var(--grey-1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="t-eyebrow" style={{ color: "var(--grey-11)" }}>Compare session</div>
              <button onClick={onClose} aria-label="Close"
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "var(--grey-11)", lineHeight: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 11, color: "var(--grey-11)" }}>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
                padding: "1px 6px", borderRadius: 3,
                background: sameModule ? "var(--brand-cyan-tint)" : "var(--grey-2)",
                color: sameModule ? "var(--brand-cyan-deep)" : "var(--ink-2)",
              }}>{mod.short}</span>
              <span>{mod.name}</span>
              {sameModule ? <span style={{ fontSize: 10, color: "var(--brand-cyan-deep)", fontWeight: 600 }}>· same curricular unit as current</span> : null}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--ink-1)", lineHeight: 1.25, marginBottom: 8 }}>
              {s.title}
            </div>
            {allChips.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                <span style={{ fontSize: 10, color: "var(--grey-11)", marginRight: 4 }}>Related by:</span>
                {allChips.map((c, i) => <ReasonChip key={i} chip={c} />)}
              </div>
            )}
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px 18px" }}>
            <DrawerMetaGrid s={s} mod={mod} target={target}/>
            <DrawerObjectives s={s} target={target} reasons={reasons} sameModule={sameModule} keywordsOnly={keywordsOnly}/>
            <DrawerKeywords s={s} target={target}/>
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 14px", borderTop: "1px solid var(--grey-2)", display: "flex", gap: 8, justifyContent: "flex-end", background: "var(--grey-1)" }}>
            <button onClick={onClose}
              style={{ padding: "7px 12px", border: "1px solid var(--grey-3)", background: "var(--paper)", borderRadius: 5, fontSize: 12, cursor: "pointer", color: "var(--ink-2)", fontFamily: "inherit" }}>
              Close
            </button>
            <button onClick={jump}
              style={{ padding: "7px 14px", border: "none", background: "var(--brand-cyan)", color: "white", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
              Jump to this session
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
        <style>{`
          @keyframes rs-fade  { from { opacity: 0 } to { opacity: 1 } }
          @keyframes rs-slidein { from { transform: translateX(20px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
        `}</style>
      </>
    );
  }

  function DrawerMetaGrid({ s, mod, target }) {
    const typeCode = (window.shortTypeCode ? window.shortTypeCode(s.type, mod.id, mod.phase) : s.type) || "—";
    const tgtTypeCode = (window.shortTypeCode ? window.shortTypeCode(target.type, mod && mod.id, mod && mod.phase) : target.type) || "—";
    const sameType = typeCode === tgtTypeCode;
    const fmtAoc = (val) => splitTags(val).join(", ") || "—";
    const fmtRce = (val) => splitTags(val).join(", ") || "—";
    return (
      <div style={{
        display: "grid", gridTemplateColumns: "auto 1fr", rowGap: 7, columnGap: 12,
        fontSize: 11.5, color: "var(--ink-2)",
        padding: "10px 12px", background: "var(--grey-1)",
        border: "1px solid var(--grey-2)", borderRadius: 5,
        marginBottom: 14,
      }}>
        <span className="t-eyebrow" style={{ alignSelf: "center" }}>Type</span>
        <span>{typeCode}{sameType ? <span style={{ color: "var(--brand-cyan-deep)", marginLeft: 6, fontSize: 10.5 }}>· same as current</span> : null}</span>
        <span className="t-eyebrow" style={{ alignSelf: "center" }}>Duration</span>
        <span>{s.duration} min</span>
        {s.aoc ? (<>
          <span className="t-eyebrow" style={{ alignSelf: "center" }}>AOC</span>
          <span>{fmtAoc(s.aoc)}{s.aocSubdomain ? ` · ${fmtAoc(s.aocSubdomain)}` : ""}</span>
        </>) : null}
        {s.rce ? (<>
          <span className="t-eyebrow" style={{ alignSelf: "center" }}>RCE</span>
          <span>{fmtRce(s.rce)}</span>
        </>) : null}
        {s.methods ? (<>
          <span className="t-eyebrow" style={{ alignSelf: "start", paddingTop: 1 }}>Methods</span>
          <span style={{ fontStyle: "italic", color: "var(--grey-11)" }}>{s.methods}</span>
        </>) : null}
      </div>
    );
  }

  function DrawerObjectives({ s, target, reasons, sameModule, keywordsOnly = false }) {
    const objectives = (s.objectives || []).filter(o => o.text && !/^session objectives pending/i.test(o.text));
    const sharedMlo = new Set(sameModule ? (reasons.mlos || []) : []);
    const targetMepos = features(target).mepos;
    const candMepos = features(s).mepos;
    const sharedMepo = new Set([...candMepos].filter(n => targetMepos.has(n)));

    return (
      <div style={{ marginBottom: 14 }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>Session objectives</div>
        {objectives.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--grey-11)", fontStyle: "italic", padding: "8px 10px", background: "var(--grey-1)", border: "1px solid var(--grey-2)", borderRadius: 5 }}>
            Session objectives pending — not yet uploaded by the module director.
          </div>
        ) : (
          <ol style={{ margin: 0, padding: "10px 12px 10px 28px", display: "flex", flexDirection: "column", gap: 7, background: "var(--paper)", border: "1px solid var(--grey-3)", borderLeft: "3px solid var(--brand-cyan)", borderRadius: 5 }}>
            {objectives.map((o, i) => (
              <li key={i} style={{ fontSize: 12.5, lineHeight: 1.4, color: "var(--ink-2)" }}>
                <span>{o.text}</span>
                {!keywordsOnly && (o.mlos || []).length > 0 && (
                  <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 4, marginLeft: 6, verticalAlign: "middle" }}>
                    {(o.mlos || []).map(n => (
                      <span key={"mlo"+n} className="pill cyan" style={{
                        opacity: sharedMlo.has(n) ? 1 : 0.55,
                        boxShadow: sharedMlo.has(n) ? "0 0 0 1.5px var(--brand-cyan)" : "none",
                      }}>MLO {n}</span>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
        {!keywordsOnly && candMepos.size > 0 && (
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
            <span className="t-eyebrow" style={{ marginRight: 4 }}>MEPOs</span>
            {[...candMepos].sort((a,b)=>a-b).map(n => (
              <span key={n} style={{
                fontSize: 10, fontWeight: 600,
                padding: "1px 6px", borderRadius: 3,
                background: sharedMepo.has(n) ? "var(--brand-cyan-tint)" : "var(--grey-1)",
                border: `1px solid ${sharedMepo.has(n) ? "var(--brand-cyan)" : "var(--grey-3)"}`,
                color: sharedMepo.has(n) ? "var(--brand-cyan-deep)" : "var(--grey-11)",
              }}>MEPO {n}{sharedMepo.has(n) ? " ✓" : ""}</span>
            ))}
          </div>
        )}
      </div>
    );
  }

  function DrawerKeywords({ s, target }) {
    const sKw = splitTags(s.keywords);
    if (sKw.length === 0) return null;
    const tKw = new Set(splitTags(target.keywords).map(k => k.toLowerCase()));
    return (
      <div style={{ marginBottom: 8 }}>
        <div className="t-eyebrow" style={{ marginBottom: 6 }}>Keywords</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {sKw.map((k, i) => {
            const shared = tKw.has(k.toLowerCase());
            return (
              <span key={i} style={{
                fontSize: 10.5, padding: "1px 6px", borderRadius: 3,
                background: shared ? "var(--brand-cyan-tint)" : "var(--grey-1)",
                border: `1px solid ${shared ? "var(--brand-cyan)" : "var(--grey-3)"}`,
                color: shared ? "var(--brand-cyan-deep)" : "var(--grey-11)",
                fontWeight: shared ? 600 : 500,
              }}>{k}</span>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RelatedSessionsMobilePanel — single-column variant used by the mobile
  // SessionDetailBody. Tapping a row calls onOpen({ session, mod, reasons })
  // so the host can push it onto its own detail stack.
  // ---------------------------------------------------------------------------

  function RelatedSessionsMobilePanel({ session, mod, onOpen, palette, max = 8 }) {
    const P = palette || {
      paper: "#ffffff", grey1: "#f4f6f9", grey2: "#e8ecf1", grey3: "#d4dae1",
      grey8: "#8a9099", grey11: "#58595B", ink: "#0e1a2a", ink2: "#36404a",
      cyan: "#00AEEF", cyanDeep: "#0086B5", cyanTint: "#E5F6FE",
    };
    const [outerOpen, setOuterOpen] = useState(true);
    const [withinOpen, setWithinOpen] = useState(true);
    const [acrossOpen, setAcrossOpen] = useState(false);

    const related = useMemo(() => {
      if (!session) return { within: [], across: [] };
      try {
        return findRelatedSessions(session, mod ? mod.id : null, {
          keywordsOnly: true,
          maxWithin: max,
          maxAcross: max,
        });
      } catch (e) {
        console.warn("[related-sessions/mobile] scoring failed", e);
        return { within: [], across: [] };
      }
    }, [session && session.id, mod && mod.id, max]);

    if (!session) return null;
    const totalCount = related.within.length + related.across.length;

    return (
      <div style={{
        background: P.paper, borderRadius: 12,
        padding: "0", marginBottom: 10, overflow: "hidden",
      }}>
        {/* Outer collapsible header */}
        <button onClick={() => setOuterOpen(o => !o)}
          style={{
            width: "100%", padding: "14px 16px 12px",
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: "inherit", textAlign: "left",
          }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 11, color: P.grey11, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600 }}>
              Related sessions
            </span>
            <span style={{ fontSize: 11, color: P.grey8, fontWeight: 500 }}>
              {totalCount} \u00b7 keyword + SLO match
            </span>
          </div>
          <Chevron open={outerOpen} color={P.grey8}/>
        </button>

        {outerOpen && (
          <div style={{ padding: "0 16px 8px" }}>
            {totalCount === 0 ? (
              <div style={{ fontSize: 12.5, color: P.grey11, fontStyle: "italic", padding: "6px 0 14px" }}>
                No conceptually-related sessions found yet.
              </div>
            ) : (
              <>
                <MobileSubsection
                  title={`Within ${mod ? (mod.short || mod.name || "this unit") : "this unit"}`}
                  count={related.within.length}
                  open={withinOpen}
                  setOpen={setWithinOpen}
                  palette={P}
                  items={related.within}
                  showModuleBadge={false}
                  emptyHint={mod ? `No other ${mod.short} sessions matched.` : null}
                  onOpen={onOpen}
                />
                <MobileSubsection
                  title="Across ASCEND"
                  count={related.across.length}
                  open={acrossOpen}
                  setOpen={setAcrossOpen}
                  palette={P}
                  items={related.across}
                  showModuleBadge={true}
                  emptyHint="No matches in other curricular units."
                  onOpen={onOpen}
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  function MobileSubsection({ title, count, open, setOpen, palette: P, items, showModuleBadge, emptyHint, onOpen }) {
    return (
      <div style={{ borderTop: `1px solid ${P.grey2}` }}>
        <button onClick={() => setOpen(o => !o)}
          style={{
            width: "100%", padding: "10px 0",
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: "inherit", textAlign: "left",
          }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 12.5, color: P.ink2, fontWeight: 600 }}>{title}</span>
            <span style={{
              fontSize: 10.5, color: P.grey11, fontWeight: 600,
              background: P.grey1, padding: "1px 6px", borderRadius: 999, border: `1px solid ${P.grey2}`,
            }}>{count}</span>
          </span>
          <Chevron open={open} color={P.grey8}/>
        </button>
        {open && (
          items.length === 0 ? (
            <div style={{ padding: "4px 0 12px", fontSize: 12.5, color: P.grey11, fontStyle: "italic" }}>
              {emptyHint || "No matches."}
            </div>
          ) : (
            <div style={{ paddingBottom: 6 }}>
              {items.map((entry, i) => (
                <MobileRelatedRow key={entry.mod.id + "/" + entry.session.id}
                                  entry={entry}
                                  isCurrentModule={!showModuleBadge}
                                  first={i === 0}
                                  palette={P}
                                  showBadge={showModuleBadge}
                                  onClick={() => onOpen && onOpen(entry)}/>
              ))}
            </div>
          )
        )}
      </div>
    );
  }

  function Chevron({ open, color }) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color}
           strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
           style={{ transition: "transform 160ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    );
  }

  function MobileRelatedRow({ entry, isCurrentModule, first, palette: P, onClick, showBadge = true }) {
    const { session: s, mod, reasons } = entry;
    const kws = (reasons && reasons.keywords) ? reasons.keywords.slice(0, 4) : [];
    return (
      <button onClick={onClick}
        style={{
          width: "100%", textAlign: "left",
          padding: "10px 0 11px",
          borderTop: first ? "none" : "1px solid " + P.grey2,
          background: "transparent", border: "none",
          cursor: "pointer", display: "flex", gap: 10, alignItems: "flex-start",
          fontFamily: "inherit",
        }}>
        {showBadge && (
          <span style={{
            flex: "0 0 auto", marginTop: 1,
            fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
            padding: "3px 7px", borderRadius: 999,
            background: P.grey1,
            color: P.ink2,
            border: `1px solid ${P.grey3}`,
            whiteSpace: "nowrap",
          }}>{mod.short}</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: P.ink, lineHeight: 1.35, marginBottom: kws.length ? 4 : 0 }}>
            {s.title}
          </div>
          {kws.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {kws.map((k, i) => (
                <span key={i} style={{
                  fontSize: 10.5, padding: "1px 6px", borderRadius: 4,
                  background: P.grey1, color: P.grey11,
                  border: `1px solid ${P.grey2}`,
                }}>{k}</span>
              ))}
            </div>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.grey8} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "0 0 16px", marginTop: 2 }}>
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    );
  }

  // ---------------------------------------------------------------------------
  // MobileRowList — just renders the row list, no header/card. Caller wraps
  // it in whatever collapsible chrome they want.
  // ---------------------------------------------------------------------------

  function MobileRowList({ items, showModuleBadge = true, onOpen, palette, emptyHint }) {
    const P = palette || {
      paper: "#ffffff", grey1: "#f4f6f9", grey2: "#e8ecf1", grey3: "#d4dae1",
      grey8: "#8a9099", grey11: "#58595B", ink: "#0e1a2a", ink2: "#36404a",
      cyan: "#00AEEF", cyanDeep: "#0086B5", cyanTint: "#E5F6FE",
    };
    if (!items || items.length === 0) {
      return (
        <div style={{ padding: "6px 0 4px", fontSize: 12.5, color: P.grey11, fontStyle: "italic" }}>
          {emptyHint || "No matches."}
        </div>
      );
    }
    return (
      <div>
        {items.map((entry, i) => (
          <MobileRelatedRow key={entry.mod.id + "/" + entry.session.id}
                            entry={entry}
                            isCurrentModule={!showModuleBadge}
                            first={i === 0}
                            palette={P}
                            showBadge={showModuleBadge}
                            onClick={() => onOpen && onOpen(entry)}/>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Expose
  // ---------------------------------------------------------------------------

  window.RelatedSessions = {
    Panel: RelatedSessionsPanel,
    MobilePanel: RelatedSessionsMobilePanel,
    MobileRowList,
    Drawer: CompareSessionDrawer,
    findRelatedSessions,
  };
})();
