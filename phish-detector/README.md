# 🌸 offensive.bloom

> AI-powered Gmail phishing & email threat detector Chrome extension.  
> Free. Open source. Powered by OpenRouter AI.

![offensive.bloom](https://img.shields.io/badge/offensive.bloom-v1.0-ff2d7a?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-00ff88?style=for-the-badge)
![Free](https://img.shields.io/badge/cost-100%25%20free-00ff88?style=for-the-badge)

---

## What it does

Open any email in Gmail → click **🌸 Analyze** → instantly know if it's:

- ✅ **Safe** — legitimate email, no threats
- ⚠️ **Suspicious** — something feels off, be careful  
- 🚨 **Phishing** — confirmed attack, do not click anything

The AI analyzes the sender, subject, body text, links, and social engineering patterns to give you a **risk score (0–100)** and a plain English explanation.

---

## Features

- 🌸 Floating **Analyze button** injected directly into Gmail toolbar
- 🔴 **Red warning banner** appears in Gmail when phishing is detected
- 🧠 **AI analysis** via OpenRouter (Gemini 2.0 Flash — free model)
- 🔍 Detects: phishing, urgency manipulation, suspicious links, impersonation
- 🔐 Your API key is stored locally — never sent anywhere except OpenRouter
- 💻 Works entirely in your browser — no server, no backend

---

## Installation (free, no Chrome Web Store needed)

### Step 1 — Download
```
Click the green "Code" button → Download ZIP → Extract the folder
```

### Step 2 — Load in Chrome
1. Open Chrome and go to: `chrome://extensions`
2. Enable **Developer Mode** (toggle top right)
3. Click **"Load unpacked"**
4. Select the extracted `offensive-bloom` folder
5. The 🌸 icon appears in your Chrome toolbar

### Step 3 — Get your free API key
1. Go to **[openrouter.ai](https://openrouter.ai)** → Sign up free
2. Go to **Keys** → Create a new key
3. Copy your key (starts with `sk-or-v1-...`)

### Step 4 — Add your key
1. Click the 🌸 offensive.bloom icon in Chrome
2. Paste your key in the API Key field
3. Click **SAVE**

**Done!** Open any Gmail email and click Analyze.

---

## How to use

**Method 1 — Popup:**
Click the 🌸 icon while Gmail is open → click "Analyze Current Email"

**Method 2 — In-Gmail button:**
Open any email → find the 🌸 Analyze button in the toolbar → click it → see result banner

---

## Free tier limits

| Service | Limit | Cost |
|---------|-------|------|
| OpenRouter (Gemini 2.0 Flash) | 200 req/day | Free |
| Everything else | Unlimited | Free |

200 requests/day = you can analyze 200 emails per day for free.

---

## Tech stack

- **Manifest V3** Chrome Extension
- **OpenRouter API** — Gemini 2.0 Flash free model
- **Vanilla JS** — no dependencies, no build step needed
- **Content Script** — injects into Gmail directly

---

## Project structure

```
offensive-bloom/
├── manifest.json          # Extension config
├── popup.html             # Extension popup UI
├── icons/                 # Extension icons
└── src/
    ├── popup.js           # Popup logic + AI call
    ├── content.js         # Gmail injection + banner
    └── content.css        # Styles for injected button
```

---

## Privacy

- Your emails are sent to **OpenRouter API** for analysis (subject + body + links only)
- Your API key is stored **locally in Chrome storage** — never shared
- No data is stored anywhere — every analysis is fresh
- Open source — read every line of code yourself

---

## Author

Built by **offensive.bloom** — cybersecurity tools, free and open source.  
GitHub: [github.com/offensive-bloom](https://github.com/offensive-bloom)

---

## License

MIT — free to use, modify, and distribute.
