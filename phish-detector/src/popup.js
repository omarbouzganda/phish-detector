// offensive.bloom — popup.js v2.0
// Smart model fallback: working → empty response → rate limited → give up

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Priority 1 — CONFIRMED WORKING right now
const WORKING_MODELS = [
  "arcee-ai/trinity-large-preview:free",
  "google/gemma-3n-e2b-it:free",
  "google/gemma-3n-e4b-it:free",
  "google/gemma-3-4b-it:free",
  "google/gemma-3-12b-it:free"
];

// Priority 2 — respond but sometimes empty, worth trying
const EMPTY_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "stepfun/step-3.5-flash:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "arcee-ai/trinity-mini:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "z-ai/glm-4.5-air:free"
];

// Priority 3 — rate limited, try anyway in case limit reset
const RATELIMITED_MODELS = [
  "qwen/qwen3-4b:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "google/gemma-3-27b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free"
];

document.addEventListener("DOMContentLoaded", () => {
  loadSavedKey();
  checkGmailTab();
  document.getElementById("saveBtn").addEventListener("click", saveKey);
  document.getElementById("apiKey").addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveKey();
  });
  document.getElementById("analyzeBtn").addEventListener("click", analyze);
  document.getElementById("helpBtn").addEventListener("click", () => {
    document.getElementById("guideOverlay").classList.add("open");
  });
  document.getElementById("guideClose").addEventListener("click", () => {
    document.getElementById("guideOverlay").classList.remove("open");
  });
  document.getElementById("guideOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("guideOverlay")) {
      document.getElementById("guideOverlay").classList.remove("open");
    }
  });
});

// ── Save API key ──────────────────────────────────────────────
function saveKey() {
  const keyInput = document.getElementById("apiKey");
  const btn = document.getElementById("saveBtn");
  const key = keyInput.value.trim();
  if (!key || key.length < 10) {
    keyInput.style.borderColor = "var(--danger)";
    setTimeout(() => { keyInput.style.borderColor = ""; }, 2000);
    return;
  }
  btn.textContent = "...";
  btn.disabled = true;
  chrome.storage.local.set({ openrouter_key: key }, () => {
    if (chrome.runtime.lastError) {
      btn.textContent = "ERR"; btn.style.background = "var(--danger)";
      setTimeout(() => { btn.textContent = "SAVE"; btn.disabled = false; btn.style.background = ""; }, 3000);
      return;
    }
    chrome.storage.local.get("openrouter_key", (data) => {
      if (data.openrouter_key === key) {
        btn.textContent = "OK"; btn.style.background = "#00ff88"; btn.style.color = "#000";
        setKeyStatus(true);
        setTimeout(() => { btn.textContent = "SAVE"; btn.disabled = false; btn.style.background = ""; btn.style.color = ""; }, 2000);
      } else { btn.textContent = "FAIL"; btn.disabled = false; }
    });
  });
}

function loadSavedKey() {
  chrome.storage.local.get("openrouter_key", (data) => {
    if (data && data.openrouter_key) {
      document.getElementById("apiKey").value = data.openrouter_key;
      setKeyStatus(true);
    } else { setKeyStatus(false); }
  });
}

function setKeyStatus(ok) {
  const dot = document.getElementById("keyDot");
  const status = document.getElementById("keyStatus");
  if (ok) {
    dot.className = "dot ok";
    status.textContent = "API key saved OK";
    status.style.color = "#00ff88";
  } else {
    dot.className = "dot err";
    status.textContent = "No key — paste key and click SAVE";
    status.style.color = "#666680";
  }
}

function checkGmailTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const gmailDot = document.getElementById("gmailDot");
    const gmailStatus = document.getElementById("gmailStatus");
    if (tab && tab.url && tab.url.includes("mail.google.com")) {
      gmailDot.className = "dot ok";
      gmailStatus.textContent = "Gmail detected";
      gmailStatus.style.color = "#00ff88";
    } else {
      gmailDot.className = "dot err";
      gmailStatus.textContent = "Open Gmail first";
      gmailStatus.style.color = "#ff2d2d";
      document.getElementById("analyzeBtn").disabled = true;
    }
  });
}

// ── Main analyze ──────────────────────────────────────────────
function analyze() {
  chrome.storage.local.get("openrouter_key", (data) => {
    const key = data.openrouter_key;
    if (!key) { showError("Save your API key first."); return; }
    showLoading("reading email...");
    hideResult();
    setLogoState("scanning");

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractEmailFromGmail,
        });
        const emailData = results[0]?.result;
        if (!emailData || !emailData.body) {
          hideLoading();
          showError("No email detected. Click on an email in Gmail first.");
          setLogoState("safe");
          return;
        }
        const analysis = await analyzeWithSmartFallback(emailData, key);
        hideLoading();
        showResult(analysis);
      } catch (err) {
        hideLoading();
        setLogoState("safe");
        // Check if it's a "daily limit exhausted" situation
        if (err.message && err.message.includes("ALL_EXHAUSTED")) {
          showDailyLimitMessage();
        } else {
          showError(err.message);
        }
      }
    });
  });
}

// ── Smart fallback: working → empty → rate limited ────────────
async function analyzeWithSmartFallback(emailData, apiKey) {
  // Phase 1: Try confirmed working models
  setLoadingText("🟢 trying working models...");
  for (let i = 0; i < WORKING_MODELS.length; i++) {
    const model = WORKING_MODELS[i];
    const name = model.split("/")[1].replace(":free","");
    setLoadingText(`🟢 ${i+1}/${WORKING_MODELS.length}: ${name}`);
    try {
      const result = await callModel(emailData, apiKey, model);
      if (result) return result;
    } catch(e) {
      await sleep(200);
    }
  }

  // Phase 2: Try empty-response models
  setLoadingText("🟡 trying backup models...");
  for (let i = 0; i < EMPTY_MODELS.length; i++) {
    const model = EMPTY_MODELS[i];
    const name = model.split("/")[1].replace(":free","");
    setLoadingText(`🟡 backup ${i+1}/${EMPTY_MODELS.length}: ${name}`);
    try {
      const result = await callModel(emailData, apiKey, model);
      if (result) return result;
    } catch(e) {
      await sleep(200);
    }
  }

  // Phase 3: Try rate-limited models (maybe reset)
  setLoadingText("🔴 trying rate-limited models...");
  for (let i = 0; i < RATELIMITED_MODELS.length; i++) {
    const model = RATELIMITED_MODELS[i];
    const name = model.split("/")[1].replace(":free","");
    setLoadingText(`🔴 last chance ${i+1}/${RATELIMITED_MODELS.length}: ${name}`);
    try {
      const result = await callModel(emailData, apiKey, model);
      if (result) return result;
    } catch(e) {
      await sleep(200);
    }
  }

  // All exhausted
  throw new Error("ALL_EXHAUSTED");
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Call a model ──────────────────────────────────────────────
async function callModel(emailData, apiKey, model) {
  const prompt = `You are a cybersecurity expert. Analyze this email for phishing and threats.
Return ONLY valid JSON, no markdown, no explanation outside the JSON.

Subject: ${emailData.subject}
From: ${emailData.senderName} <${emailData.sender}>
Body: ${emailData.body}
Links: ${emailData.links.length ? emailData.links.join(", ") : "none"}

Return exactly:
{"verdict":"SAFE|WARNING|PHISHING","risk_score":0-100,"summary":"2-3 sentences","red_flags":["..."],"safe_signals":["..."],"recommendation":"one action"}`;

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://linktr.ee/offensive.bloom",
      "X-Title": "offensive.bloom"
    },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Provider error");

  const content = data.choices?.[0]?.message?.content;
  if (!content || content.trim() === "") throw new Error("Empty response");

  const jsonMatch = content.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");

  return JSON.parse(jsonMatch[0]);
}

// ── Runs inside Gmail tab ─────────────────────────────────────
function extractEmailFromGmail() {
  const emailBody = document.querySelector(".a3s.aiL") || document.querySelector(".ii.gt div");
  const subject = document.querySelector("h2.hP")?.innerText || document.title?.replace(" - Gmail","") || "";
  const sender = document.querySelector(".gD")?.getAttribute("email") || "";
  const senderName = document.querySelector(".gD")?.getAttribute("name") || "";
  const body = emailBody?.innerText || emailBody?.textContent || "";
  const links = [];
  document.querySelectorAll(".a3s a, .ii a").forEach(a => {
    if (a.href && !a.href.startsWith("mailto:")) links.push(a.href);
  });
  return { subject: subject.trim(), sender, senderName, body: body.slice(0, 3000), links: links.slice(0, 10) };
}

// ── Show daily limit exhausted message ───────────────────────
function showDailyLimitMessage() {
  const result = document.getElementById("result");
  result.className = "result warning";
  document.getElementById("threatIcon").textContent = "⏳";
  document.getElementById("threatLabel").textContent = "Daily limit reached";
  document.getElementById("threatScore").textContent = "";
  document.getElementById("resultBody").innerHTML = `
    <p style="margin-bottom:10px">All free AI models have used up today's quota. You have two options:</p>
    <p>🌙 <strong style="color:#ffaa00">Come back tomorrow</strong> and try again for free</p>
    <p style="margin-top:8px">🚀 <strong style="color:#4d9fff">Get Pro version</strong> — unlimited scans, faster models, priority support</p>
    <a href="https://linktr.ee/offensive.bloom" target="_blank" style="display:inline-block;margin-top:12px;background:#0066ff;color:white;padding:7px 16px;border-radius:20px;text-decoration:none;font-size:11px;font-weight:700;font-family:Space Mono,monospace">Contact us → Pro in 24h</a>
  `;
  document.getElementById("flags").innerHTML = "";
}

// ── Show result ───────────────────────────────────────────────
function showResult(analysis) {
  const result = document.getElementById("result");
  result.className = "result";
  const verdictMap = {
    SAFE: { cls:"safe", icon:"✅", label:"Safe" },
    WARNING: { cls:"warning", icon:"⚠️", label:"Suspicious" },
    PHISHING: { cls:"danger", icon:"🚨", label:"Phishing" }
  };
  const v = verdictMap[analysis.verdict] || verdictMap.WARNING;
  result.classList.add(v.cls);
  document.getElementById("threatIcon").textContent = v.icon;
  document.getElementById("threatLabel").textContent = v.label;
  document.getElementById("threatScore").textContent = `${analysis.risk_score}/100`;
  document.getElementById("resultBody").innerHTML = `
    <p>${analysis.summary}</p>
    <p style="margin-top:8px;font-size:10px;color:#4d9fff">→ ${analysis.recommendation}</p>
  `;
  const flagsEl = document.getElementById("flags");
  flagsEl.innerHTML = "";
  (analysis.red_flags||[]).forEach(f => {
    const s = document.createElement("span"); s.className = "flag red"; s.textContent = f; flagsEl.appendChild(s);
  });
  (analysis.safe_signals||[]).forEach(f => {
    const s = document.createElement("span"); s.className = "flag green"; s.textContent = f; flagsEl.appendChild(s);
  });

  // Switch logo color
  setLogoState(analysis.verdict === "PHISHING" ? "danger" : analysis.verdict === "SAFE" ? "safe" : "warning");
}

// ── Logo switcher ─────────────────────────────────────────────
function setLogoState(state) {
  const logo = document.getElementById("logoImg");
  if (!logo) return;
  if (state === "danger" || state === "phishing") {
    logo.src = "icons/logo_red.png";
    logo.className = "logo-img danger";
  } else if (state === "scanning") {
    logo.className = "logo-img";
  } else {
    logo.src = "icons/logo_green.png";
    logo.className = state === "safe" ? "logo-img safe-glow" : "logo-img";
  }
}

// ── UI helpers ────────────────────────────────────────────────
function showLoading(text) {
  document.getElementById("loading").classList.add("active");
  document.getElementById("analyzeBtn").disabled = true;
  document.getElementById("loadingText").textContent = text;
}
function setLoadingText(t) { document.getElementById("loadingText").textContent = t; }
function hideLoading() {
  document.getElementById("loading").classList.remove("active");
  document.getElementById("analyzeBtn").disabled = false;
}
function hideResult() { document.getElementById("result").className = "result"; }
function showError(msg) {
  const r = document.getElementById("result");
  r.className = "result warning";
  document.getElementById("threatIcon").textContent = "⚠️";
  document.getElementById("threatLabel").textContent = "Error";
  document.getElementById("threatScore").textContent = "";
  document.getElementById("resultBody").textContent = msg;
  document.getElementById("flags").innerHTML = "";
}
