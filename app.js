/* ============================================================
   CompeteIQ – Frontend Application Logic
   Communicates with the Flask Python backend at /api/
   ============================================================ */

const API_BASE = "http://127.0.0.1:5000";

// ── Store last result for copy ────────────────────────────────────────────────
let lastResult = null;

// ── On page load: check server health ────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  checkHealth();
  document.getElementById("companyA").addEventListener("keydown", handleEnter);
  document.getElementById("companyB").addEventListener("keydown", handleEnter);
});

function handleEnter(e) {
  if (e.key === "Enter") analyzeCompanies();
}

async function checkHealth() {
  const dot  = document.getElementById("statusDot");
  const text = document.getElementById("statusText");
  try {
    const res  = await fetch(`${API_BASE}/api/health`);
    const data = await res.json();
    if (data.key_configured) {
      dot.style.background  = "#22c55e";
      text.textContent      = "Groq AI Ready";
    } else {
      dot.style.background  = "#f59e0b";
      text.textContent      = "Key not set in .env";
    }
  } catch {
    dot.style.background = "#ef4444";
    text.textContent     = "Server offline";
  }
}

// ── Fill suggestion chips ─────────────────────────────────────────────────────
function fillSuggestion(a, b) {
  document.getElementById("companyA").value = a;
  document.getElementById("companyB").value = b;
  document.getElementById("companyA").focus();
}

// ── Main analysis function ────────────────────────────────────────────────────
async function analyzeCompanies() {
  const companyA = document.getElementById("companyA").value.trim();
  const companyB = document.getElementById("companyB").value.trim();

  // Validate
  if (!companyA || !companyB) {
    showError("Please enter both company names before analyzing.");
    return;
  }
  if (companyA.toLowerCase() === companyB.toLowerCase()) {
    showError("Please enter two different companies.");
    return;
  }

  hideError();
  setLoading(true);
  hideResults();

  try {
    const res = await fetch(`${API_BASE}/api/analyze`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ company_a: companyA, company_b: companyB }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || `Server error ${res.status}. Please try again.`);
      return;
    }

    lastResult = data;
    renderResults(data);

  } catch (err) {
    if (err.message.includes("fetch")) {
      showError("Cannot reach the Flask server. Make sure app.py is running on port 5000.");
    } else {
      showError(`Unexpected error: ${err.message}`);
    }
  } finally {
    setLoading(false);
  }
}

// ── Render SWOT results ───────────────────────────────────────────────────────
function renderResults(data) {
  // Summary banner
  document.getElementById("summaryCompanyA").textContent = data.company_a;
  document.getElementById("summaryCompanyB").textContent = data.company_b;
  document.getElementById("analysisTime").textContent    =
    data.elapsed_seconds ? `⚡ ${data.elapsed_seconds}s` : "⚡ Done";

  // Column headers
  const sections = ["strengths", "weaknesses", "opportunities", "threats"];
  sections.forEach((s) => {
    document.getElementById(`${s}AHeader`).textContent = data.company_a;
    document.getElementById(`${s}BHeader`).textContent = data.company_b;
  });

  // Fill lists with staggered animation
  renderList("strengthsAList",     data.strengths?.company_a,     0);
  renderList("strengthsBList",     data.strengths?.company_b,     50);
  renderList("weaknessesAList",    data.weaknesses?.company_a,    100);
  renderList("weaknessesBList",    data.weaknesses?.company_b,    150);
  renderList("opportunitiesAList", data.opportunities?.company_a, 200);
  renderList("opportunitiesBList", data.opportunities?.company_b, 250);
  renderList("threatsAList",       data.threats?.company_a,       300);
  renderList("threatsBList",       data.threats?.company_b,       350);

  // Verdict
  document.getElementById("verdictBody").textContent = data.verdict || "No verdict provided.";

  showResults();
}

function renderList(elementId, items, baseDelayMs) {
  const ul = document.getElementById(elementId);
  ul.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    ul.innerHTML = `<li style="color:var(--text-muted); font-style:italic;">No data</li>`;
    return;
  }

  items.forEach((item, i) => {
    const li = document.createElement("li");
    li.textContent = item;
    li.style.animationDelay = `${baseDelayMs + i * 60}ms`;
    ul.appendChild(li);
  });
}

// ── Copy analysis to clipboard ────────────────────────────────────────────────
async function copyResults() {
  if (!lastResult) return;

  const d   = lastResult;
  const fmt = (label, items) =>
    `  ${label}:\n${(items || []).map((x) => `    • ${x}`).join("\n")}`;

  const text = `
═══════════════════════════════════════════════════════
  CompeteIQ — SWOT Analysis: ${d.company_a} vs ${d.company_b}
═══════════════════════════════════════════════════════

💪 STRENGTHS
${fmt(d.company_a, d.strengths?.company_a)}
${fmt(d.company_b, d.strengths?.company_b)}

⚠️ WEAKNESSES
${fmt(d.company_a, d.weaknesses?.company_a)}
${fmt(d.company_b, d.weaknesses?.company_b)}

🚀 OPPORTUNITIES
${fmt(d.company_a, d.opportunities?.company_a)}
${fmt(d.company_b, d.opportunities?.company_b)}

🔥 THREATS
${fmt(d.company_a, d.threats?.company_a)}
${fmt(d.company_b, d.threats?.company_b)}

🏆 STRATEGIC VERDICT
${d.verdict}

═══════════════════════════════════════════════════════
  Powered by CompeteIQ × Groq AI (${d.model || "llama-3.3-70b"})
═══════════════════════════════════════════════════════
`.trim();

  try {
    await navigator.clipboard.writeText(text);
    const btn = document.getElementById("copyBtn");
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Copied!`;
    btn.style.background    = "rgba(34,197,94,0.15)";
    btn.style.borderColor   = "rgba(34,197,94,0.4)";
    btn.style.color         = "#22c55e";
    setTimeout(() => {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
        Copy Analysis`;
      btn.style.background  = "";
      btn.style.borderColor = "";
      btn.style.color       = "";
    }, 2500);
  } catch {
    showError("Clipboard access denied by browser.");
  }
}

// ── Reset for a new analysis ──────────────────────────────────────────────────
function resetAnalysis() {
  hideResults();
  hideError();
  document.getElementById("companyA").value = "";
  document.getElementById("companyB").value = "";
  lastResult = null;
  document.getElementById("companyA").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function setLoading(loading) {
  const btn        = document.getElementById("analyzeBtn");
  const content    = document.getElementById("btnContent");
  const loadingEl  = document.getElementById("btnLoading");
  btn.disabled     = loading;
  content.classList.toggle("hidden", loading);
  loadingEl.classList.toggle("hidden", !loading);
}

function showError(msg) {
  const banner = document.getElementById("errorBanner");
  document.getElementById("errorMsg").textContent = msg;
  banner.classList.remove("hidden");
  banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideError() {
  document.getElementById("errorBanner").classList.add("hidden");
}

function showResults() {
  const section = document.getElementById("resultsSection");
  section.classList.remove("hidden");
  setTimeout(() => section.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
}

function hideResults() {
  document.getElementById("resultsSection").classList.add("hidden");
}
