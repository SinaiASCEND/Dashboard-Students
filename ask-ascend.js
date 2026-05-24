// ============================================================================
// Ask ASCEND — natural-language search over the ASCEND curriculum
// ----------------------------------------------------------------------------
// Wraps window.claude.complete (the built-in Haiku helper) with a curriculum-
// aware prompt and JSON output schema. Caller passes a free-text question; we
// pre-filter to a compact candidate set, ask the model to pick + explain,
// and return resolved index items the host UI can open.
//
// Exposed on window.AskAscend = { askAscend, buildSearchIndex } so both the
// desktop GlobalSearch overlay and the mobile CurriculumSearch tab can reuse
// the same logic.
// ============================================================================
;(function () {
  if (typeof window === "undefined") return;

  // --- 1. Curriculum digest ---------------------------------------------------
  // Build a compact, model-friendly digest of every searchable entity once
  // per page load. Each row is < 200 chars on average so we can ship 100+
  // candidates per query without busting Haiku's input budget.
  let __indexCache = null;
  function buildIndex() {
    if (__indexCache) return __indexCache;
    const C = window.CURRICULUM || {};
    const S = window.SESSIONS || {};
    const out = [];

    // Modules
    for (const m of (C.MODULES || [])) {
      out.push({
        kind: "Module", id: m.id,
        label: m.name, sub: `${m.short} \u00b7 ${m.phase} \u00b7 ${m.year || ""}`,
        digest: `${m.name} \u2014 ${m.phase} module (${m.short}). ${m.year || ""}.`,
        modId: m.id,
      });
    }

    // MEPOs
    for (const me of (C.MEPOS || [])) {
      out.push({
        kind: "MEPO", id: me.code,
        label: me.code, sub: me.title,
        digest: `${me.code} (${me.domain || ""}): ${me.title}`,
      });
    }

    // Sessions — keep digest tight
    for (const m of (C.MODULES || [])) {
      const pack = S[m.id]; if (!pack) continue;
      for (const s of (pack.sessions || [])) {
        const slos = (s.objectives || []).map(o => o.text || o.slo || "").filter(Boolean).join(" / ");
        const keywords = s.keywords || "";
        // JAMA Nutrition Competency tags — when this session is on the NUTR
        // canonical thread, surface its JAMA codes both in the model digest
        // (so the LLM knows it's nutrition-aligned) and on the hydrated pick
        // (so the UI can render the tag without an additional lookup).
        const jamas = (typeof window.jamaForSession === "function")
          ? window.jamaForSession(m.id, s.n) : [];
        const jamaCodes = jamas.map(c => `JAMA #${c.n}${c.priority ? "★" : ""}`);
        const jamaTheme = (typeof window.jamaThemeForSession === "function")
          ? window.jamaThemeForSession(m.id, s.n) : "";
        const digest = [
          `${m.short} \u00b7 ${s.title}`,
          `type=${s.type || "?"}`,
          slos ? `SLOs: ${slos.slice(0, 280)}` : "",
          keywords ? `keywords: ${keywords.slice(0, 120)}` : "",
          s.aoc ? `AOC: ${s.aoc}${s.aocSubdomain ? " / " + s.aocSubdomain : ""}` : "",
          (s.threads && s.threads.length) ? `threads: ${s.threads.join(", ")}` : "",
          jamaCodes.length ? `JAMA Nutrition Competencies: ${jamaCodes.join(", ")}${jamaTheme ? " (theme: " + jamaTheme + ")" : ""}` : "",
        ].filter(Boolean).join(". ");
        out.push({
          kind: "Session", id: s.id,
          label: s.title,
          sub: `${m.short}${s.week ? " \u00b7 Week " + s.week : ""}${s.type ? " \u00b7 " + s.type : ""}`,
          digest,
          modId: m.id, sessionN: s.n,
          slos: (s.objectives || []).map(o => o.text || o.slo || "").filter(Boolean),
          jamas,   // [{n, text, theme, priority, consensusPct}, ...]
          jamaTheme,
        });
      }
    }

    // Threads — canonical
    for (const t of (window.CANONICAL_THREADS || [])) {
      out.push({
        kind: "Thread", id: t.id,
        label: t.name, sub: `${(t.sessions || []).length} sessions`,
        digest: `Curricular thread: ${t.name} (${(t.sessions || []).length} tagged sessions).`,
      });
    }

    // AOCs
    const AOC_NAMES = {
      HDS: "Healthcare Delivery Science",
      SSD: "Scientific & Scholarly Discovery",
      LPI: "Leadership & Professional Identity Formation",
      PCA: "Patient-Centered Advocacy",
    };
    for (const code of Object.keys(AOC_NAMES)) {
      out.push({
        kind: "AOC", id: code,
        label: AOC_NAMES[code], sub: `Area of Concentration \u00b7 ${code}`,
        digest: `Area of Concentration: ${AOC_NAMES[code]} (${code}).`,
      });
    }

    __indexCache = out;
    return out;
  }

  // --- 2. Cheap keyword-narrow pass ------------------------------------------
  // Token-overlap score so we can pre-filter to ~80 candidates before sending
  // to Claude. Same stopword list as the rest of the dashboard.
  const STOP = new Set(("the and that with this from they have been will what your when which "
    + "then there their about would could should more most less than into using "
    + "used use upon between among across over under within without including "
    + "such these those some many much each every both either neither only also "
    + "etc them may not but for one two three or as is be by an of to a in on at it "
    + "do does where how why who").split(/\s+/));
  function tokenize(s) {
    return (s || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2 && !STOP.has(w));
  }
  function preFilter(index, query, max = 80) {
    const tokens = tokenize(query);
    if (!tokens.length) return index.slice(0, max);
    const scored = [];
    for (const it of index) {
      const hay = ((it.label || "") + " " + (it.sub || "") + " " + (it.digest || "")).toLowerCase();
      let s = 0;
      for (const t of tokens) {
        const idx = hay.indexOf(t);
        if (idx >= 0) s += 1 + (hay.startsWith(t) ? 0.5 : 0);
      }
      // Promote sessions slightly; they're the primary answer surface.
      if (it.kind === "Session") s += 0.2;
      if (s > 0) scored.push({ it, s });
    }
    scored.sort((a, b) => b.s - a.s);
    if (!scored.length) return index.slice(0, max);
    return scored.slice(0, max).map(x => x.it);
  }

  // --- 3. Prompt + call -------------------------------------------------------
  function audienceLine(audience) {
    if (audience === "student")  return "Audience: a medical student. Use plain, helpful language. Pick what's most useful for studying or finding course content.";
    if (audience === "director") return "Audience: a curriculum director or accreditor. Be precise about alignment, coverage, and gaps. Quote exact SLO/MLO/MEPO/AOC/thread codes when relevant.";
    return "Audience: both students and curriculum directors. Be clear and precise; quote codes (MEPO, MLO, JAMA) when relevant.";
  }

  function buildPrompt(query, candidates, audience) {
    const compact = candidates.map(c => ({
      kind: c.kind, id: c.id, label: c.label, sub: c.sub, digest: c.digest,
    }));
    return [
      "You are Ask ASCEND \u2014 a natural-language search assistant for the ASCEND undergraduate medical-school curriculum at Mount Sinai.",
      audienceLine(audience),
      "",
      "User question:",
      `"${(query || "").slice(0, 500)}"`,
      "",
      "Candidate entries from the curriculum index (pre-filtered by keyword):",
      JSON.stringify(compact),
      "",
      "Instructions:",
      "- Choose 3\u20138 of the candidates that best answer the question.",
      "- Always cite by the exact `id` shown in the candidate list. Never invent ids.",
      "- Prefer Sessions when the question is about content. Use MEPO/Thread/AOC/Module when the question is about coverage, alignment, or structure.",
      "- For nutrition-related questions, prioritise sessions tagged with JAMA Nutrition Competencies (visible in the digest), and mention the JAMA code(s) in your rationale.",
      "- For each pick, write a one-sentence rationale (max 20 words) grounded in the digest you were given.",
      "- Write a 1\u20132 sentence overall summary that directly answers the user's question.",
      "- If no candidate truly answers the question, return picks: [] and explain in summary.",
      "",
      "Return ONLY a JSON object, no prose, no markdown fences, matching this schema:",
      "{",
      '  "summary": string,',
      '  "picks": [{"kind": "Session"|"Module"|"MEPO"|"Thread"|"AOC", "id": string, "why": string}]',
      "}",
    ].join("\n");
  }

  function extractJSON(text) {
    if (!text || typeof text !== "string") return null;
    // Try direct parse first
    try { return JSON.parse(text.trim()); } catch (e) {}
    // Strip markdown fences and try again
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) { try { return JSON.parse(fence[1].trim()); } catch (e) {} }
    // Last resort: grab first { ... } block by brace balance
    const start = text.indexOf("{");
    if (start < 0) return null;
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) {
          try { return JSON.parse(text.slice(start, i + 1)); } catch (e) { return null; }
        }
      }
    }
    return null;
  }

  // --- 5. Electives natural-language search -----------------------------------
  // Scoped strictly to window.ELECTIVES — does NOT pull in modules, MEPOs,
  // threads, sessions, or any other ASCEND content. Used by the Electives
  // Catalog page on both desktop and mobile.
  function preFilterElectives(all, query, max = 60) {
    const tokens = tokenize(query);
    if (!tokens.length) return all.slice(0, max);
    const scored = [];
    for (const e of all) {
      const hay = [
        e.code, e.title, e.specialty, e.type, e.keywords,
        e.residencyTracks, e.sites, e.clinicalSetting, e.intensity,
        e.yearEligibility, e.erasCategory, e.description,
      ].filter(Boolean).join(" ").toLowerCase();
      let s = 0;
      for (const t of tokens) {
        if (hay.indexOf(t) >= 0) s += 1;
        if ((e.title || "").toLowerCase().includes(t)) s += 2;
        if ((e.specialty || "").toLowerCase().includes(t)) s += 1.5;
      }
      if (s > 0) scored.push({ e, s });
    }
    scored.sort((a, b) => b.s - a.s);
    if (!scored.length) return all.slice(0, max);
    return scored.slice(0, max).map(x => x.e);
  }

  function buildElectivesPrompt(query, candidates) {
    const compact = candidates.map(e => ({
      code: e.code, title: e.title,
      specialty: e.specialty || "",
      type: e.type || "",
      duration: e.durationOptions || "",
      yearEligibility: e.yearEligibility || "",
      setting: e.clinicalSetting || "",
      intensity: e.intensity || "",
      audition: e.audition || "",
      sites: (e.sites || "").slice(0, 200),
      keywords: (e.keywords || "").slice(0, 250),
      description: (e.description || "").slice(0, 400),
    }));
    return [
      "You are an Electives Catalog search assistant for the ASCEND program at Mount Sinai.",
      "Audience: a medical student exploring career-exploration electives.",
      "Scope: ONLY the elective candidates below. Do not invent codes. Do not reference Phase 1 sessions or MEPOs.",
      "",
      "User question:",
      `"${(query || "").slice(0, 500)}"`,
      "",
      "Candidate electives (pre-filtered by keyword):",
      JSON.stringify(compact),
      "",
      "Instructions:",
      "- Choose 3\u20138 electives that best answer the question.",
      "- Cite each pick by its exact `code` shown in the candidate list.",
      "- For each pick, write a one-sentence rationale (max 22 words) grounded in title / specialty / description / sites.",
      "- Write a 1\u20132 sentence overall summary that directly answers the user's question.",
      "- If no candidate truly fits, return picks: [] and explain in summary.",
      "",
      "Return ONLY a JSON object, no prose, no markdown fences:",
      "{",
      '  "summary": string,',
      '  "picks": [{"code": string, "why": string}]',
      "}",
    ].join("\n");
  }

  async function askElectives(query, opts = {}) {
    const max = Math.max(20, Math.min(120, opts.candidateCount || 60));
    const all = (window.ELECTIVES || []).slice();
    if (!query || !query.trim()) {
      return { summary: "Ask anything about the electives catalog.", picks: [] };
    }
    const candidates = preFilterElectives(all, query, max);
    if (!window.claude || typeof window.claude.complete !== "function") {
      const picks = candidates.slice(0, 8).map((e) => ({ ...e, why: "" }));
      return {
        summary: picks.length
          ? `Top ${picks.length} keyword matches for “${query}” (Ask ASCEND AI is unavailable in this environment).`
          : `No keyword matches for “${query}”.`,
        picks,
        _fallback: "keyword",
      };
    }
    const prompt = buildElectivesPrompt(query, candidates);
    const raw = await window.claude.complete(prompt);
    const json = extractJSON(raw);
    if (!json || !json.picks) {
      return { summary: (raw && raw.slice(0, 300)) || "No response.", picks: [], _rawOnFailure: raw };
    }
    const byCode = new Map(all.map(e => [e.code, e]));
    const hydrated = [];
    for (const p of json.picks) {
      const hit = byCode.get(p.code);
      if (!hit) continue;
      hydrated.push({ ...hit, why: p.why || "" });
    }
    return { summary: json.summary || "", picks: hydrated };
  }

  // --- 6. Public entry --------------------------------------------------------
  // askAscend(query, { audience, candidateCount }) → Promise<{ summary, picks: [...] }>
  // Each pick is hydrated with the original index entry so the host UI can
  // open it without another lookup.
  async function askAscend(query, opts = {}) {
    const audience = opts.audience || "both";
    const candidateCount = Math.max(20, Math.min(120, opts.candidateCount || 80));
    if (!query || !query.trim()) {
      return { summary: "Ask anything about the ASCEND curriculum.", picks: [] };
    }
    const index = buildIndex();
    const candidates = preFilter(index, query, candidateCount);
    // Fallback for environments without the Claude helper (e.g. GitHub Pages):
    // serve up the top keyword-scored picks so search still works.
    if (!window.claude || typeof window.claude.complete !== "function") {
      const picks = candidates.slice(0, 8).map((it) => ({ ...it, why: "" }));
      return {
        summary: picks.length
          ? `Top ${picks.length} keyword matches for “${query}” (Ask ASCEND AI is unavailable in this environment).`
          : `No keyword matches for “${query}”.`,
        picks,
        _fallback: "keyword",
      };
    }
    const prompt = buildPrompt(query, candidates, audience);
    const raw = await window.claude.complete(prompt);
    const json = extractJSON(raw);
    if (!json || !json.picks) {
      return {
        summary: (raw && raw.slice(0, 300)) || "No response.",
        picks: [],
        _rawOnFailure: raw,
      };
    }
    // Hydrate picks
    const byKey = new Map(index.map(it => [it.kind + ":" + it.id, it]));
    const hydrated = [];
    for (const p of json.picks) {
      const hit = byKey.get(p.kind + ":" + p.id);
      if (!hit) continue;
      hydrated.push({ ...hit, why: p.why || "" });
    }
    return { summary: json.summary || "", picks: hydrated };
  }

  window.AskAscend = { askAscend, askElectives, buildIndex };
})();
