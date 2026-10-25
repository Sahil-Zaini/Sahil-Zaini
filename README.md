# 🕵️ Subscription Leak

> Your bank statement is hiding something.

**Paste your bank statement → find every subscription silently draining your money.**
The forgotten free trials. The gym you haven't visited since January. The three cloud-storage plans doing the same job.

**100% private. Runs entirely in your browser. Nothing is uploaded, stored, or sent — ever.**

![Made with vanilla JS](https://img.shields.io/badge/vanilla-JS-f7df1e?labelColor=1b1611)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-c81f14?labelColor=1b1611)
![Privacy first](https://img.shields.io/badge/data%20leaves%20your%20browser-never-1e6f3e?labelColor=1b1611)

## 🔥 What it does

1. **Paste** transactions from any bank/card statement — messy copy-paste or a CSV export, both work
2. The engine finds **recurring charges**: same merchant, similar amount, regular interval (weekly / monthly / quarterly / yearly)
3. It cross-references a database of **80+ known subscription services** (Netflix, Spotify, Adobe, ChatGPT, that VPN you forgot…)
4. You get the verdict: **how much you're leaking per month and per year**, which charges look like **zombie subscriptions** (still billing, possibly dead to you), and **direct cancel links** for every service it recognizes
5. Download a **share card** and expose your leak. Everyone thinks they're the exception. Nobody is.

## 🔒 Privacy

This is the whole point:

- **No backend. No server. No analytics. No cookies. No tracking pixel. Nothing.**
- The entire analysis runs client-side in ~1 file of vanilla JavaScript
- Open DevTools → Network tab while using it: the only requests are two Google Fonts
- Close the tab and your data is gone

Don't trust me? Good instinct — [read the source](app.js). It's one file, no build step, no minification.

## 🧠 How detection works

```
parse → normalize → group → detect cadence → price it
```

- **Parser** handles raw copy-paste text and CSV (auto-detects delimiter, headers, date formats, dd/mm vs mm/dd ambiguity, and `1,234.56` vs `1.234,56` amount styles, with $ ₹ € £ currencies)
- **Merchant normalizer** strips reference codes, `PAYPAL *`/`GOOGLE *` prefixes, POS/UPI/ACH noise
- **Cadence detector** computes median gap between charges per merchant: weekly (5–9d), monthly (24–38d), quarterly (80–100d), yearly (330–400d), with 20% amount tolerance
- **Known-service matching** flags big subscription brands even from a single charge
- **Zombie detection**: a subscription with no charge in 60+ days gets flagged — it may still be billing you elsewhere

## 🚀 Run it

It's a static page. No install, no build:

```bash
git clone https://github.com/YOUR_USERNAME/subscription-leak
open subscription-leak/index.html
```

Or just open the live site and hit **"run the demo case"** to see it work on sample data.

## 🤝 Contributing

The easiest high-impact PR: add services to the `SERVICES` database in [`app.js`](app.js) — name, match keywords, and a cancel URL. Regional services (India, Brazil, EU…) especially welcome.

## 📄 License

MIT — do whatever you want, just don't add tracking to it. That would be ironic.
