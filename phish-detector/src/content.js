// offensive.bloom — content.js

const FREE_MODELS = [
  "arcee-ai/trinity-large-preview:free",
  "google/gemma-3-27b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "arcee-ai/trinity-mini:free",
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "qwen/qwen3-4b:free",
  "google/gemma-3-4b-it:free",
  "google/gemma-3n-4b:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "z-ai/glm-4.5-air:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "nvidia/nemotron-nano-12b-v2-vl:free"
];

let analyzeButton = null;
let resultBanner = null;
let lastEmailId = null;

const observer = new MutationObserver(() => { checkForOpenEmail(); });
observer.observe(document.body, { childList: true, subtree: true });
setTimeout(checkForOpenEmail, 2000);

function checkForOpenEmail() {
  const emailBody = document.querySelector(".a3s.aiL");
  if (!emailBody) { removeButton(); return; }
  const currentId = emailBody.textContent.slice(0, 50);
  if (currentId === lastEmailId && analyzeButton) return;
  lastEmailId = currentId;
  removeButton();
  injectButton();
}

function injectButton() {
  const toolbar = document.querySelector(".G-atb") || document.querySelector(".ade");
  if (!toolbar) return;
  analyzeButton = document.createElement("div");
  analyzeButton.id = "ob-analyze-btn";
  analyzeButton.innerHTML = `<span class="ob-icon">🌸</span><span class="ob-label">Analyze</span>`;
  analyzeButton.title = "Analyze with offensive.bloom";
  analyzeButton.addEventListener("click", runAnalysis);
  toolbar.appendChild(analyzeButton);
}

function removeButton() {
  if (analyzeButton) { analyzeButton.remove(); analyzeButton = null; }
  removeBanner();
}

function removeBanner() {
  if (resultBanner) { resultBanner.remove(); resultBanner = null; }
}

async function runAnalysis() {
  chrome.storage.local.get("openrouter_key", async (data) => {
    const apiKey = data.openrouter_key;
    if (!apiKey) {
      showBanner("warning", "⚠️ No API key", "Open offensive.bloom extension and save your OpenRouter key first.");
      return;
    }

    analyzeButton.innerHTML = `<span class="ob-icon ob-spin">🌸</span><span class="ob-label">Scanning...</span>`;
    analyzeButton.style.pointerEvents = "none";
    removeBanner();

    try {
      const emailData = extractEmail();
      const result = await analyzeWithFallback(emailData, apiKey);
      showBanner(result.verdict.toLowerCase(), getVerdictTitle(result.verdict), result.summary, result.risk_score, result.red_flags);
    } catch (err) {
      showBanner("warning", "⚠️ Error", err.message);
    } finally {
      analyzeButton.innerHTML = `<span class="ob-icon">🌸</span><span class="ob-label">Analyze</span>`;
      analyzeButton.style.pointerEvents = "auto";
    }
  });
}

async function analyzeWithFallback(emailData, apiKey) {
  let lastError = null;
  for (let i = 0; i < FREE_MODELS.length; i++) {
    const model = FREE_MODELS[i];
    const shortName = model.split("/")[1]?.replace(":free", "") || model;
    // Update button to show progress
    if (analyzeButton) {
      analyzeButton.innerHTML = `<span class="ob-icon ob-spin">🌸</span><span class="ob-label">${i+1}/${FREE_MODELS.length} ${shortName}</span>`;
    }
    try {
      return await callModel(emailData, apiKey, model);
    } catch (err) {
      lastError = err;
      await new Promise(r => setTimeout(r, 300));
    }
  }
  throw new Error(`All models failed: ${lastError?.message}`);
}

async function callModel(emailData, apiKey, model) {
  const prompt = `You are a cybersecurity expert. Analyze this email. Return ONLY valid JSON, no markdown.
Subject: ${emailData.subject}
From: ${emailData.sender}
Body: ${emailData.body}
Links: ${emailData.links.join(", ") || "none"}
JSON: {"verdict":"SAFE|WARNING|PHISHING","risk_score":0-100,"summary":"2-3 sentences","red_flags":["..."]}`;

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/offensive-bloom",
      "X-Title": "offensive.bloom"
    },
    body: JSON.stringify({ model, max_tokens: 600, messages: [{ role: "user", content: prompt }] })
  });

  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || `HTTP ${res.status}`); }
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Provider error");
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response");
  const jsonMatch = content.replace(/```json|```/g, "").match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON");
  return JSON.parse(jsonMatch[0]);
}

function extractEmail() {
  const body = document.querySelector(".a3s.aiL")?.innerText || "";
  const subject = document.querySelector("h2.hP")?.innerText || "";
  const sender = document.querySelector(".gD")?.getAttribute("email") || "";
  const links = [];
  document.querySelectorAll(".a3s a").forEach(a => { if (a.href && !a.href.startsWith("mailto:")) links.push(a.href); });
  return { subject, sender, body: body.slice(0, 3000), links: links.slice(0, 10) };
}

function getVerdictTitle(v) {
  return v === "SAFE" ? "✅ Safe Email" : v === "WARNING" ? "⚠️ Suspicious" : "🚨 Phishing Detected";
}

function showBanner(type, title, message, score, flags) {
  removeBanner();
  const colors = {
    safe: { border: "rgba(0,255,136,0.3)", text: "#00ff88" },
    warning: { border: "rgba(255,170,0,0.3)", text: "#ffaa00" },
    phishing: { border: "rgba(255,45,45,0.4)", text: "#ff2d2d" }
  };
  const c = colors[type] || colors.warning;

  if (!document.getElementById("ob-styles")) {
    const style = document.createElement("style");
    style.id = "ob-styles";
    style.textContent = `@keyframes obSlideIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(style);
  }

  const flagsHTML = (flags||[]).map(f =>
    `<span style="font-size:10px;padding:2px 8px;border-radius:20px;background:rgba(255,45,45,0.15);color:#ff2d2d;border:1px solid rgba(255,45,45,0.3)">${f}</span>`
  ).join("");

  resultBanner = document.createElement("div");
  resultBanner.id = "ob-result-banner";
  resultBanner.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <span style="font-size:14px;font-weight:700;color:${c.text};font-family:monospace">${title}</span>
      ${score !== undefined ? `<span style="margin-left:auto;font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;background:rgba(0,0,0,0.3);color:${c.text}">${score}/100</span>` : ""}
      <button id="ob-close" style="margin-left:4px;background:none;border:none;color:#666;cursor:pointer;font-size:18px;line-height:1">×</button>
    </div>
    <p style="font-size:12px;line-height:1.6;color:#ccc;font-family:monospace">${message}</p>
    ${flagsHTML ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:4px">${flagsHTML}</div>` : ""}
    <div style="margin-top:8px;font-size:9px;color:#444;font-family:monospace">offensive.bloom · <a href='https://linktr.ee/offensive.bloom' style='color:#4d9fff;text-decoration:none'>linktr.ee/offensive.bloom</a></div>
  `;
  resultBanner.style.cssText = `position:fixed;bottom:24px;right:24px;width:360px;background:#0d0d14;border:1px solid ${c.border};border-radius:12px;padding:14px 16px;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,0.5);animation:obSlideIn 0.3s ease`;
  document.body.appendChild(resultBanner);
  document.getElementById("ob-close").addEventListener("click", removeBanner);
  if (type === "safe") setTimeout(removeBanner, 12000);
}
