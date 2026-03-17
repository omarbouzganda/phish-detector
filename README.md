# phish-detector — AI Gmail Phishing Shield

```
██████╗ ██╗  ██╗██╗███████╗██╗  ██╗    ██████╗ ███████╗████████╗███████╗ ██████╗████████╗ ██████╗ ██████╗ 
██╔══██╗██║  ██║██║██╔════╝██║  ██║    ██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗
██████╔╝███████║██║███████╗███████║    ██║  ██║█████╗     ██║   █████╗  ██║        ██║   ██║   ██║██████╔╝
██╔═══╝ ██╔══██║██║╚════██║██╔══██║    ██║  ██║██╔══╝     ██║   ██╔══╝  ██║        ██║   ██║   ██║██╔══██╗
██║     ██║  ██║██║███████║██║  ██║    ██████╔╝███████╗   ██║   ███████╗╚██████╗   ██║   ╚██████╔╝██║  ██║
╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝   ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
                    P H I S H - D E T E C T O R   b y   o f f e n s i v e . b l o o m
```

> ⚠️ **FOR DEFENSIVE SECURITY & PERSONAL PROTECTION ONLY** ⚠️
> This tool is designed to protect you from phishing attacks. Never use security knowledge for unauthorized access to systems you do not own.

---

## 🧠 What is phish-detector?

**phish-detector** is a free Chrome extension built by **offensive.bloom** that uses AI to analyze your Gmail emails in real time and tell you if they are **safe**, **suspicious**, or a **phishing attack**.

No backend. No server. No data stored anywhere. Everything runs in your browser.

You open an email. You click one button. The AI thinks. You get a verdict.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **14 free AI models** | Auto-rotates through working models — never gets stuck |
| 🟢🔴 **Live logo color change** | Green = safe. Red = danger. You see it instantly |
| 🎯 **Risk score 0–100** | Exact threat level for every email |
| 🚩 **Red flags breakdown** | Shows exactly what triggered the AI |
| ✅ **Safe signals** | Confirms what looks legitimate |
| 💡 **AI recommendation** | One clear action to take |
| 🔄 **Smart fallback system** | Working → Backup → Rate-limited → Daily limit message |
| ❓ **Built-in guide** | Step-by-step help inside the extension |
| 🔐 **100% private** | Your key stored locally — never sent anywhere except OpenRouter |
| 💸 **100% free** | No subscription, no account, no credit card |

---

## 🚀 Installation

### Requirements
- Google Chrome (or any Chromium browser)
- A free OpenRouter API key (takes 30 seconds)

### Step 1 — Download
```
Click the green "Code" button → Download ZIP → Extract the folder
```

### Step 2 — Load in Chrome
1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer Mode** (toggle top right)
3. Click **"Load unpacked"**
4. Select the extracted `offensive-bloom` folder
5. The 🔒 icon appears in your Chrome toolbar

### Step 3 — Get your free API key
1. Go to **[openrouter.ai](https://openrouter.ai)** → Sign up free (no credit card)
2. Go to **Keys** → Create a new key
3. Copy it (starts with `sk-or-v1-...`)

### Step 4 — Connect
1. Click the 🔒 icon in Chrome
2. Paste your key → click **SAVE**
3. See **"API key saved OK"** in green

**Done. You're protected.**

---

## 🤖 AI Models — Smart Fallback System

phish-detector tries models in priority order automatically:

### 🟢 Phase 1 — Confirmed Working
| Model | Provider |
|---|---|
| `arcee-ai/trinity-large-preview:free` | Arcee AI |
| `google/gemma-3n-e2b-it:free` | Google |
| `google/gemma-3n-e4b-it:free` | Google |
| `google/gemma-3-4b-it:free` | Google |
| `google/gemma-3-12b-it:free` | Google |

### 🟡 Phase 2 — Backup Models
| Model | Provider |
|---|---|
| `nvidia/nemotron-3-super-120b-a12b:free` | NVIDIA |
| `arcee-ai/trinity-mini:free` | Arcee AI |
| `nvidia/nemotron-nano-9b-v2:free` | NVIDIA |
| `z-ai/glm-4.5-air:free` | Z.ai |

### 🔴 Phase 3 — Rate Limited (tried last)
| Model | Provider |
|---|---|
| `meta-llama/llama-3.3-70b-instruct:free` | Meta |
| `google/gemma-3-27b-it:free` | Google |
| `mistralai/mistral-small-3.1-24b-instruct:free` | Mistral |

> If all models hit their daily quota, the extension tells you to come back tomorrow or contact us for the Pro version.

---

## 🔍 How It Works

```
You open Gmail email
        ↓
Click "Analyze Current Email"
        ↓
Extension reads: subject + sender + body + links
        ↓
Sends to AI model via OpenRouter API
        ↓
AI analyzes for: urgency tactics, suspicious links,
                 fake domains, social engineering,
                 impersonation, malicious patterns
        ↓
Returns: verdict + risk score + red flags + recommendation
        ↓
Logo turns GREEN (safe) or RED (phishing)
```

---

## 🎯 What the Results Mean

| Result | Score | Meaning |
|---|---|---|
| ✅ **SAFE** | 0–30 | Legitimate email, no threats detected |
| ⚠️ **SUSPICIOUS** | 31–70 | Something feels off — be careful before clicking |
| 🚨 **PHISHING** | 71–100 | Confirmed attack — do not click anything |

---

## 📁 Project Structure

```
phish-detector/
├── manifest.json          # Chrome Extension config (Manifest V3)
├── popup.html             # Extension popup UI
├── icons/
│   ├── logo_green.png     # Safe state icon
│   ├── logo_red.png       # Danger state icon
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── src/
    ├── popup.js           # Main logic + AI fallback system
    ├── content.js         # Gmail injection + result banner
    └── content.css        # Injected button styles
```

---

## 🔒 Privacy

- ✅ Your emails are analyzed by **OpenRouter API** — only subject, body, and links are sent
- ✅ Your API key is stored **locally in Chrome storage only** — never shared
- ✅ **No data is logged or stored** — every scan is fresh
- ✅ **Open source** — read every line of code yourself
- ✅ No account required to use the extension

---

## 💎 Pro Version

The free version gives you **~50 scans/day** across all models.

Want **unlimited scans**, faster models, priority support, and exclusive features?

**Contact us and we send you the Pro version within 24 hours.**

[![Contact us](https://img.shields.io/badge/Get%20Pro-linktr.ee%2Foffensive.bloom-0066ff?style=for-the-badge)](https://linktr.ee/offensive.bloom)

---

## ⚠️ Legal Disclaimer

This tool is intended exclusively for:

- Personal email protection
- Security awareness and education
- Defensive cybersecurity research
- CTF (Capture The Flag) competitions

**Never use security tools against systems or accounts you do not own. The author accepts no liability for misuse.**

---

## 👤 Author

**Omar Bouzganda**  
powered by **offensive.bloom** · AI Security Tools

[![offensive.bloom](https://img.shields.io/badge/offensive.bloom-linktr.ee-0066ff?style=flat-square)](https://linktr.ee/offensive.bloom)
[![YouTube](https://img.shields.io/badge/YouTube-@offensive.bloomm-red?style=flat-square&logo=youtube)](https://www.youtube.com/@offensive.bloomm)

---

## ☕ Support & Donations

If this tool helped protect you, consider supporting the project:

**Bitcoin (BTC):**
```
bc1qex88c788lfmkhsp8djxzn5t5j8w4xq99e0mzf6
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">
  <strong>phish-detector</strong> · made with 🔒 by <a href="https://linktr.ee/offensive.bloom">offensive.bloom</a>
</div>
