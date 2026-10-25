/* ═══════════════════════════════════════════════════════
   SUBSCRIPTION LEAK — detection engine
   Everything runs locally. No network calls, no storage.
═══════════════════════════════════════════════════════ */
"use strict";

/* ── known subscription services ─────────────────────── */
const SERVICES = [
  { k: ["netflix"], name: "Netflix", glyph: "🎬", cancel: "https://www.netflix.com/cancelplan" },
  { k: ["spotify"], name: "Spotify", glyph: "🎧", cancel: "https://www.spotify.com/account/subscription/" },
  { k: ["youtube premium", "youtubepremium", "google youtube"], name: "YouTube Premium", glyph: "▶️", cancel: "https://www.youtube.com/paid_memberships" },
  { k: ["amazon prime", "amzn prime", "primevideo", "prime video"], name: "Amazon Prime", glyph: "📦", cancel: "https://www.amazon.com/mc" },
  { k: ["disney", "hotstar"], name: "Disney+ / Hotstar", glyph: "🏰", cancel: "https://www.disneyplus.com/account" },
  { k: ["hulu"], name: "Hulu", glyph: "📺", cancel: "https://secure.hulu.com/account" },
  { k: ["hbo", "max.com"], name: "Max (HBO)", glyph: "🎭", cancel: "https://www.max.com/account" },
  { k: ["apple.com/bill", "apple com bill", "itunes"], name: "Apple Services", glyph: "🍎", cancel: "https://support.apple.com/118428" },
  { k: ["icloud"], name: "iCloud+", glyph: "☁️", cancel: "https://support.apple.com/108351" },
  { k: ["google one", "googleone"], name: "Google One", glyph: "🗄️", cancel: "https://one.google.com/settings" },
  { k: ["google storage", "googlestorage"], name: "Google Storage", glyph: "🗄️", cancel: "https://one.google.com/settings" },
  { k: ["dropbox"], name: "Dropbox", glyph: "📁", cancel: "https://www.dropbox.com/account/plan" },
  { k: ["adobe"], name: "Adobe Creative Cloud", glyph: "🎨", cancel: "https://account.adobe.com/plans" },
  { k: ["canva"], name: "Canva Pro", glyph: "🖌️", cancel: "https://www.canva.com/settings/billing-and-teams" },
  { k: ["figma"], name: "Figma", glyph: "📐", cancel: "https://www.figma.com/settings" },
  { k: ["notion"], name: "Notion", glyph: "📝", cancel: "https://www.notion.so/my-account" },
  { k: ["chatgpt", "openai"], name: "ChatGPT Plus", glyph: "🤖", cancel: "https://chat.openai.com/#settings" },
  { k: ["anthropic", "claude.ai"], name: "Claude", glyph: "✴️", cancel: "https://claude.ai/settings" },
  { k: ["github"], name: "GitHub", glyph: "🐙", cancel: "https://github.com/settings/billing" },
  { k: ["midjourney"], name: "Midjourney", glyph: "🖼️", cancel: "https://www.midjourney.com/account" },
  { k: ["linkedin"], name: "LinkedIn Premium", glyph: "💼", cancel: "https://www.linkedin.com/premium/cancel" },
  { k: ["audible"], name: "Audible", glyph: "🎙️", cancel: "https://www.audible.com/account/overview" },
  { k: ["kindle unlimited"], name: "Kindle Unlimited", glyph: "📚", cancel: "https://www.amazon.com/hz/subscribe/ku" },
  { k: ["xbox", "game pass", "gamepass"], name: "Xbox Game Pass", glyph: "🎮", cancel: "https://account.microsoft.com/services" },
  { k: ["playstation", "sony entertainment"], name: "PlayStation Plus", glyph: "🕹️", cancel: "https://www.playstation.com/account/subscriptions" },
  { k: ["nintendo"], name: "Nintendo Online", glyph: "🍄", cancel: "https://accounts.nintendo.com" },
  { k: ["steam"], name: "Steam", glyph: "♨️", cancel: "https://store.steampowered.com/account/" },
  { k: ["discord", "nitro"], name: "Discord Nitro", glyph: "💬", cancel: "https://discord.com/settings/subscriptions" },
  { k: ["twitch"], name: "Twitch", glyph: "🟪", cancel: "https://www.twitch.tv/subscriptions" },
  { k: ["patreon"], name: "Patreon", glyph: "🧡", cancel: "https://www.patreon.com/settings/memberships" },
  { k: ["onlyfans"], name: "OnlyFans", glyph: "🔞", cancel: "https://onlyfans.com/my/settings/subscriptions" },
  { k: ["substack"], name: "Substack", glyph: "📬", cancel: "https://substack.com/settings" },
  { k: ["medium.com", "medium monthly"], name: "Medium", glyph: "✍️", cancel: "https://medium.com/me/settings" },
  { k: ["nytimes", "ny times"], name: "NY Times", glyph: "🗞️", cancel: "https://www.nytimes.com/account" },
  { k: ["wsj", "wall street journal"], name: "WSJ", glyph: "📈", cancel: "https://customercenter.wsj.com" },
  { k: ["economist"], name: "The Economist", glyph: "🌍", cancel: "https://www.economist.com/my-account" },
  { k: ["duolingo"], name: "Duolingo", glyph: "🦉", cancel: "https://www.duolingo.com/settings/super" },
  { k: ["headspace"], name: "Headspace", glyph: "🧘", cancel: "https://www.headspace.com/settings/subscription" },
  { k: ["calm.com", "calm subscription"], name: "Calm", glyph: "😌", cancel: "https://www.calm.com/profile" },
  { k: ["strava"], name: "Strava", glyph: "🏃", cancel: "https://www.strava.com/account" },
  { k: ["fitbit"], name: "Fitbit Premium", glyph: "⌚", cancel: "https://www.fitbit.com/settings/subscriptions" },
  { k: ["peloton"], name: "Peloton", glyph: "🚴", cancel: "https://www.onepeloton.com/mymembership" },
  { k: ["gym", "fitness", "anytime fit", "planet fit", "cult.fit", "cultfit"], name: "Gym Membership", glyph: "🏋️", cancel: null },
  { k: ["tinder"], name: "Tinder", glyph: "🔥", cancel: "https://tinder.com/app/settings" },
  { k: ["bumble"], name: "Bumble", glyph: "🐝", cancel: "https://bumble.com/settings" },
  { k: ["hinge"], name: "Hinge", glyph: "💘", cancel: null },
  { k: ["grammarly"], name: "Grammarly", glyph: "✏️", cancel: "https://account.grammarly.com/subscription" },
  { k: ["nordvpn"], name: "NordVPN", glyph: "🛡️", cancel: "https://my.nordaccount.com" },
  { k: ["expressvpn"], name: "ExpressVPN", glyph: "🛡️", cancel: "https://www.expressvpn.com/subscriptions" },
  { k: ["surfshark"], name: "Surfshark", glyph: "🦈", cancel: "https://my.surfshark.com" },
  { k: ["1password"], name: "1Password", glyph: "🔑", cancel: "https://my.1password.com" },
  { k: ["lastpass"], name: "LastPass", glyph: "🔑", cancel: "https://lastpass.com/my-account" },
  { k: ["microsoft 365", "msft", "microsoft*"], name: "Microsoft 365", glyph: "🪟", cancel: "https://account.microsoft.com/services" },
  { k: ["zoom.us", "zoom video"], name: "Zoom", glyph: "📹", cancel: "https://zoom.us/billing" },
  { k: ["slack"], name: "Slack", glyph: "💼", cancel: null },
  { k: ["doordash", "dashpass"], name: "DashPass", glyph: "🚗", cancel: "https://www.doordash.com/consumer/manage_plan" },
  { k: ["uber one", "uberone", "uber pass"], name: "Uber One", glyph: "🚕", cancel: "https://www.uber.com/account" },
  { k: ["instacart"], name: "Instacart+", glyph: "🛒", cancel: "https://www.instacart.com/store/account" },
  { k: ["swiggy one", "swiggyone"], name: "Swiggy One", glyph: "🍔", cancel: null },
  { k: ["zomato gold", "zomato pro"], name: "Zomato Gold", glyph: "🍕", cancel: null },
  { k: ["hellofresh"], name: "HelloFresh", glyph: "🥗", cancel: "https://www.hellofresh.com/account-settings" },
  { k: ["blinkist"], name: "Blinkist", glyph: "📖", cancel: "https://www.blinkist.com/settings" },
  { k: ["skillshare"], name: "Skillshare", glyph: "🎓", cancel: "https://www.skillshare.com/settings/payments" },
  { k: ["coursera"], name: "Coursera Plus", glyph: "🎓", cancel: "https://www.coursera.org/my-purchases" },
  { k: ["masterclass"], name: "MasterClass", glyph: "🎓", cancel: "https://www.masterclass.com/account" },
  { k: ["crunchyroll"], name: "Crunchyroll", glyph: "🍥", cancel: "https://www.crunchyroll.com/account" },
  { k: ["paramount"], name: "Paramount+", glyph: "⛰️", cancel: "https://www.paramountplus.com/account" },
  { k: ["peacock"], name: "Peacock", glyph: "🦚", cancel: "https://www.peacocktv.com/account" },
  { k: ["jiocinema", "jiosaavn", "jio recharge"], name: "Jio Services", glyph: "📱", cancel: null },
  { k: ["airtel"], name: "Airtel", glyph: "📱", cancel: null },
  { k: ["tidal"], name: "Tidal", glyph: "🌊", cancel: "https://account.tidal.com" },
  { k: ["deezer"], name: "Deezer", glyph: "🎵", cancel: "https://www.deezer.com/account" },
  { k: ["apple music"], name: "Apple Music", glyph: "🎵", cancel: "https://support.apple.com/118428" },
  { k: ["vercel"], name: "Vercel", glyph: "▲", cancel: "https://vercel.com/account/billing" },
  { k: ["heroku"], name: "Heroku", glyph: "🟣", cancel: "https://dashboard.heroku.com/account/billing" },
  { k: ["digitalocean", "digital ocean"], name: "DigitalOcean", glyph: "🌊", cancel: "https://cloud.digitalocean.com/account/billing" },
  { k: ["aws", "amazon web services"], name: "AWS", glyph: "☁️", cancel: "https://console.aws.amazon.com/billing" },
  { k: ["hostinger"], name: "Hostinger", glyph: "🌐", cancel: "https://hpanel.hostinger.com" },
  { k: ["godaddy"], name: "GoDaddy", glyph: "🌐", cancel: "https://account.godaddy.com/subscriptions" },
  { k: ["squarespace"], name: "Squarespace", glyph: "⬛", cancel: "https://account.squarespace.com" },
  { k: ["wix"], name: "Wix", glyph: "🌐", cancel: "https://manage.wix.com/account/subscriptions" },
  { k: ["shopify"], name: "Shopify", glyph: "🛍️", cancel: "https://admin.shopify.com/settings/plan" },
];

/* words that suggest a recurring product even if unknown */
const SUBBY_WORDS = /\b(subscription|membership|monthly|recurring|renewal|auto.?pay|autopay|premium|plan)\b/i;

/* ── parsing ─────────────────────────────────────────── */
const CUR_SYMBOLS = { "$": "$", "₹": "₹", "€": "€", "£": "£", "usd": "$", "inr": "₹", "eur": "€", "gbp": "£", "rs.": "₹", "rs": "₹" };

const DATE_RES = [
  // 2026-03-01 / 2026/03/01
  { re: /\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/, fn: m => new Date(+m[1], +m[2] - 1, +m[3]) },
  // 03/01/2026, 03-01-26  (ambiguous — resolved later by column stats)
  { re: /\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2}|\d{2})\b/, fn: null },
  // 01 Mar 2026 / Mar 01, 2026 / 1 March
  { re: /\b(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?,?\s*(20\d{2}|\d{2})?\b/i, fn: m => mkDate(m[3], monthIdx(m[2]), +m[1]) },
  { re: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(\d{1,2}),?\s*(20\d{2}|\d{2})?\b/i, fn: m => mkDate(m[3], monthIdx(m[1]), +m[2]) },
];
function monthIdx(s) { return ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"].indexOf(s.slice(0,3).toLowerCase()); }
function mkDate(y, m, d) {
  let year = y ? +y : new Date().getFullYear();
  if (year < 100) year += 2000;
  return new Date(year, m, d);
}

function parseStatement(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { txns: [], currency: "$" };

  // Currency detection
  const curCount = {};
  for (const l of lines) {
    for (const sym of ["₹", "€", "£", "$"]) {
      curCount[sym] = (curCount[sym] || 0) + (l.split(sym).length - 1);
    }
    const low = l.toLowerCase();
    for (const code of ["inr", "usd", "eur", "gbp"]) {
      if (low.includes(code)) curCount[CUR_SYMBOLS[code]] = (curCount[CUR_SYMBOLS[code]] || 0) + 1;
    }
  }
  const currency = Object.entries(curCount).sort((a, b) => b[1] - a[1]).find(e => e[1] > 0)?.[0] || "$";

  // CSV with headers?
  const maybeCsv = lines[0].includes(",") || lines[0].includes(";") || lines[0].includes("\t");
  let txns = [];
  if (maybeCsv) txns = parseCsv(lines);
  if (!txns.length) txns = parseLoose(lines);
  return { txns: resolveAmbiguousDates(txns), currency };
}

function splitCsvLine(line, delim) {
  const out = []; let cur = "", q = false;
  for (const ch of line) {
    if (ch === '"') { q = !q; continue; }
    if (ch === delim && !q) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map(s => s.trim());
}

function parseCsv(lines) {
  const delim = [",", ";", "\t"].sort((a, b) =>
    lines[0].split(b).length - lines[0].split(a).length)[0];
  const header = splitCsvLine(lines[0], delim).map(h => h.toLowerCase());
  const find = (...keys) => header.findIndex(h => keys.some(k => h.includes(k)));
  let iDate = find("date"), iDesc = find("description", "narration", "details", "merchant", "payee", "name", "particular"),
      iAmt = find("amount", "debit", "withdrawal", "value");
  const hasHeader = iDate >= 0 || iDesc >= 0 || iAmt >= 0;
  const rows = (hasHeader ? lines.slice(1) : lines).map(l => splitCsvLine(l, delim));
  if (!hasHeader) {
    // Guess columns from the first data row
    const probe = rows[0] || [];
    iDate = probe.findIndex(c => parseDateToken(c));
    iAmt = probe.length - 1 - [...probe].reverse().findIndex(c => parseAmount(c) !== null);
    iDesc = probe.findIndex((c, i) => i !== iDate && i !== iAmt && /[a-z]/i.test(c));
  }
  const txns = [];
  for (const cols of rows) {
    if (cols.length < 2) continue;
    const date = iDate >= 0 ? parseDateToken(cols[iDate]) : null;
    const amt = iAmt >= 0 ? parseAmount(cols[iAmt]) : null;
    const desc = iDesc >= 0 ? cols[iDesc] : cols.filter((_, i) => i !== iDate && i !== iAmt).join(" ");
    if (date && amt !== null && desc) txns.push({ date, desc, amount: Math.abs(amt), raw: cols.join(" ") });
  }
  return txns;
}

function parseLoose(lines) {
  const txns = [];
  for (const line of lines) {
    const date = parseDateToken(line);
    if (!date) continue;
    // amount: last money-looking token
    const amtMatches = [...line.matchAll(/[-+]?\s*[₹$€£]?\s*\d[\d,]*(?:\.\d{1,2})?\b(?!\s*[-/.]\d)/g)]
      .map(m => ({ s: m[0], i: m.index }))
      .filter(m => !/^\d{1,2}$/.test(m.s.trim()) || /[₹$€£]/.test(m.s));
    if (!amtMatches.length) continue;
    const last = amtMatches[amtMatches.length - 1];
    const amt = parseAmount(last.s);
    if (amt === null || amt === 0) continue;
    // description: strip date + amount tokens
    let desc = line;
    for (const { re } of DATE_RES) { const m = desc.match(re); if (m) { desc = desc.replace(m[0], " "); break; } }
    desc = desc.slice(0, last.i < desc.length ? undefined : undefined).replace(last.s, " ");
    desc = desc.replace(/[-+]?\s*[₹$€£]\s*\d[\d,]*(?:\.\d{1,2})?/g, " ").replace(/\s{2,}/g, " ").trim();
    if (!desc) continue;
    txns.push({ date, desc, amount: Math.abs(amt), raw: line, _ambig: date._ambig });
  }
  return txns;
}

function parseDateToken(s) {
  for (const { re, fn } of DATE_RES) {
    const m = s.match(re);
    if (!m) continue;
    if (fn) { const d = fn(m); if (d && !isNaN(d)) return d; continue; }
    // ambiguous dd/mm vs mm/dd
    let a = +m[1], b = +m[2], y = +m[3]; if (y < 100) y += 2000;
    let d;
    if (a > 12) d = new Date(y, b - 1, a);        // must be dd/mm
    else if (b > 12) d = new Date(y, a - 1, b);   // must be mm/dd
    else { d = new Date(y, a - 1, b); d._ambig = { y, a, b }; }
    if (!isNaN(d)) return d;
  }
  return null;
}

/* If many ambiguous dates exist and mm/dd produces impossible months later, flip.
   Heuristic: if any txn in the set has first-number > 12, treat all ambiguous as dd/mm. */
function resolveAmbiguousDates(txns) {
  const anyDayFirst = txns.some(t => t._ambig === undefined && t.raw && /\b(1[3-9]|2\d|3[01])[-/.](\d{1,2})[-/.]/.test(t.raw));
  if (anyDayFirst) {
    for (const t of txns) {
      if (t._ambig) t.date = new Date(t._ambig.y, t._ambig.b - 1, t._ambig.a);
    }
  }
  txns.forEach(t => delete t._ambig);
  return txns;
}

function parseAmount(s) {
  if (s == null) return null;
  const neg = /[-(]/.test(s);
  const cleaned = String(s).replace(/[^0-9.,]/g, "");
  if (!cleaned) return null;
  // handle 1,234.56 and 1.234,56 and 1,23,456.78
  let normalized = cleaned;
  const lastComma = cleaned.lastIndexOf(","), lastDot = cleaned.lastIndexOf(".");
  if (lastComma > lastDot) normalized = cleaned.replace(/\./g, "").replace(",", ".");
  else normalized = cleaned.replace(/,/g, "");
  const v = parseFloat(normalized);
  if (isNaN(v)) return null;
  return neg ? -v : v;
}

/* ── merchant normalization & grouping ───────────────── */
function normalizeMerchant(desc) {
  let s = desc.toLowerCase();
  s = s.replace(/\b(pos|upi|ach|neft|imps|visa|mastercard|debit|credit|card|purchase|payment|pymt|intl|txn|transaction|ref|autopay|auto-pay|recurring|bill ?pay|web|online|dr|cr)\b/g, " ");
  s = s.replace(/\b(paypal|gpay|google pay|razorpay|stripe|paytm|phonepe|sq|square)\s*\*?\s*/g, " ");
  s = s.replace(/[*#]/g, " ");
  s = s.replace(/\b[a-z]*\d[\w-]*\b/g, " ");   // tokens containing digits (ref codes)
  s = s.replace(/\b(com|net|www|inc|llc|ltd|pvt|co)\b/g, " ");
  s = s.replace(/[^a-z ]/g, " ").replace(/\s{2,}/g, " ").trim();
  return s || desc.toLowerCase().trim();
}

function matchService(desc) {
  const low = " " + desc.toLowerCase() + " ";
  for (const svc of SERVICES) {
    if (svc.k.some(k => low.includes(k))) return svc;
  }
  return null;
}

function titleCase(s) {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

/* ── recurrence analysis ─────────────────────────────── */
const CADENCES = [
  { name: "WEEKLY", lo: 5, hi: 9, perMonth: 4.33 },
  { name: "MONTHLY", lo: 24, hi: 38, perMonth: 1 },
  { name: "QUARTERLY", lo: 80, hi: 100, perMonth: 1 / 3 },
  { name: "YEARLY", lo: 330, hi: 400, perMonth: 1 / 12 },
];

function analyze(txns) {
  const groups = new Map();
  for (const t of txns) {
    const svc = matchService(t.desc);
    const key = svc ? "svc:" + svc.name : "m:" + normalizeMerchant(t.desc);
    if (!groups.has(key)) groups.set(key, { svc, txns: [], key });
    groups.get(key).txns.push(t);
  }

  const found = [];
  for (const g of groups.values()) {
    g.txns.sort((a, b) => a.date - b.date);
    const n = g.txns.length;
    const amounts = g.txns.map(t => t.amount);
    const lastAmt = amounts[amounts.length - 1];
    const displayName = g.svc ? g.svc.name : titleCase(normalizeMerchant(g.txns[0].desc)).slice(0, 34);
    const subbyText = g.txns.some(t => SUBBY_WORDS.test(t.raw || t.desc));

    // intervals between charges
    let cadence = null, regular = false;
    if (n >= 2) {
      const gaps = [];
      for (let i = 1; i < n; i++) gaps.push((g.txns[i].date - g.txns[i - 1].date) / 86400000);
      const median = gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)];
      cadence = CADENCES.find(c => median >= c.lo && median <= c.hi) || null;
      // amount similarity: all within 20% of median amount
      const medAmt = [...amounts].sort((a, b) => a - b)[Math.floor(n / 2)];
      const similar = amounts.every(a => Math.abs(a - medAmt) / medAmt < 0.2);
      regular = !!cadence && similar;
    }

    let status = null;
    if (regular) status = "confirmed";
    else if (g.svc && n >= 2) { status = "confirmed"; cadence = cadence || CADENCES[1]; }
    else if (g.svc && n === 1) { status = "suspected"; cadence = CADENCES[1]; }
    else if (subbyText && n >= 1) { status = "suspected"; cadence = cadence || CADENCES[1]; }
    if (!status) continue;

    const monthly = lastAmt * (cadence ? cadence.perMonth : 1);
    found.push({
      name: displayName,
      glyph: g.svc ? g.svc.glyph : "🧾",
      cancel: g.svc ? g.svc.cancel : null,
      count: n,
      cadence: cadence ? cadence.name : "MONTHLY",
      lastAmt, monthly, status,
      first: g.txns[0].date, last: g.txns[n - 1].date,
    });
  }
  found.sort((a, b) => b.monthly - a.monthly);
  return found;
}

/* ── rendering ───────────────────────────────────────── */
const $ = id => document.getElementById(id);
const fmtMoney = (v, cur) => cur + (v >= 100 ? Math.round(v).toLocaleString("en") : v.toFixed(2).replace(/\.00$/, ""));

let lastReport = null;

function runAnalysis(text) {
  const err = $("parse-error");
  err.hidden = true;
  const { txns, currency } = parseStatement(text);
  if (txns.length < 2) {
    err.textContent = "⚠ Couldn't read enough transactions. Each line needs a date, a description, and an amount — or try the demo case to see the format.";
    err.hidden = false;
    return;
  }
  const subs = analyze(txns);
  if (!subs.length) {
    err.textContent = "✓ Case closed: no recurring charges detected in " + txns.length + " transactions. Either you're financially bulletproof, or the statement window is too short (2+ months works best).";
    err.hidden = false;
    return;
  }
  render(subs, currency, txns.length);
}

function render(subs, cur, txnCount) {
  const monthlyTotal = subs.reduce((s, x) => s + x.monthly, 0);
  const yearly = monthlyTotal * 12;
  lastReport = { subs, cur, monthlyTotal, yearly };

  $("cur-sym").textContent = cur;
  $("yearly-total").textContent = fmtMoney(yearly, cur);
  $("suspect-count").textContent = subs.length;
  $("verdict-title").textContent = subs.length === 1 ? "The damage (it's just one — barely a leak)" : "The damage";

  // equivalents
  const eq = $("equivalents");
  const coffee = cur === "₹" ? 250 : 5;
  const flight = cur === "₹" ? 6000 : 150;
  const rows = [
    ["☕ Coffees per month, liquefied", Math.round(monthlyTotal / coffee) + " cups"],
    ["✈️ Flights per year, evaporated", (yearly / flight).toFixed(1) + " tickets"],
    ["⏳ If invested at 8% for 10 years instead", fmtMoney(monthlyTotal * 12 * ((Math.pow(1.08, 10) - 1) / 0.08), cur)],
    ["🧾 Transactions examined", String(txnCount)],
  ];
  eq.innerHTML = rows.map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join("");

  // suspects
  const list = $("suspects");
  list.innerHTML = "";
  subs.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "suspect";
    div.style.animationDelay = (0.08 * i) + "s";
    const zombie = (Date.now() - s.last) > 1000 * 60 * 60 * 24 * 60;
    div.innerHTML = `
      <div class="glyph">${s.glyph}</div>
      <div class="who">
        <div class="name">${escapeHtml(s.name)}</div>
        <div class="meta">
          <span class="badge ${s.status}">${s.status.toUpperCase()}</span>
          ${s.cadence} · ${s.count} charge${s.count > 1 ? "s" : ""} on record
          ${zombie ? ' · <span class="badge zombie">POSSIBLY DEAD — CHECK IT</span>' : ""}
        </div>
        ${s.cancel ? `<div class="cancel">⟶ <a href="${s.cancel}" target="_blank" rel="noopener">cancel / manage ${escapeHtml(s.name)}</a></div>` : ""}
      </div>
      <div class="cost">${fmtMoney(s.monthly, lastReport.cur)}<small>/MONTH</small></div>`;
    list.appendChild(div);
  });

  $("results").hidden = false;
  $("results").scrollIntoView({ behavior: "smooth", block: "start" });
  animateNumber($("monthly-total"), monthlyTotal);
  drawShareCard();
}

function animateNumber(el, target) {
  const t0 = performance.now(), dur = 1400;
  const fmt = v => target >= 100 ? Math.round(v).toLocaleString("en") : v.toFixed(2);
  function tick(t) {
    const p = Math.min(1, (t - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(target * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ── share card ──────────────────────────────────────── */
function drawShareCard() {
  if (!lastReport) return;
  const { subs, cur, monthlyTotal, yearly } = lastReport;
  const c = $("share-canvas"), x = c.getContext("2d");
  const W = c.width, H = c.height;

  x.fillStyle = "#f4eee1"; x.fillRect(0, 0, W, H);
  // frame
  x.strokeStyle = "#1b1611"; x.lineWidth = 6; x.strokeRect(40, 40, W - 80, H - 80);
  x.strokeStyle = "#c9bda2"; x.lineWidth = 2; x.strokeRect(58, 58, W - 116, H - 116);

  x.fillStyle = "#4a4336";
  x.font = "600 26px 'IBM Plex Mono', monospace";
  x.textAlign = "center";
  x.fillText("CASE FILE Nº 001 — RECURRING CHARGES", W / 2, 140);

  x.fillStyle = "#1b1611";
  x.font = "900 92px 'Fraunces', Georgia, serif";
  x.fillText("SUBSCRIPTION", W / 2, 250);
  x.fillStyle = "#c81f14";
  x.font = "italic 900 112px 'Fraunces', Georgia, serif";
  x.fillText("LEAK", W / 2, 360);

  x.fillStyle = "#4a4336";
  x.font = "500 28px 'IBM Plex Mono', monospace";
  x.fillText("MY STATEMENT WAS HIDING", W / 2, 470);

  x.fillStyle = "#c81f14";
  x.font = "900 150px 'Fraunces', Georgia, serif";
  x.fillText(fmtMoney(monthlyTotal, cur) + "/mo", W / 2, 620);

  x.fillStyle = "#1b1611";
  x.font = "600 34px 'IBM Plex Mono', monospace";
  x.fillText("= " + fmtMoney(yearly, cur) + " PER YEAR", W / 2, 690);

  // top suspects
  x.textAlign = "left";
  const top = subs.slice(0, 5);
  let y = 790;
  x.strokeStyle = "#c9bda2"; x.setLineDash([8, 8]);
  for (const s of top) {
    x.beginPath(); x.moveTo(120, y - 44); x.lineTo(W - 120, y - 44); x.stroke();
    x.fillStyle = "#1b1611";
    x.font = "700 40px 'Fraunces', Georgia, serif";
    x.fillText(s.glyph + "  " + s.name.slice(0, 20), 120, y);
    x.textAlign = "right";
    x.font = "600 36px 'IBM Plex Mono', monospace";
    x.fillStyle = "#c81f14";
    x.fillText(fmtMoney(s.monthly, cur), W - 120, y);
    x.textAlign = "left";
    y += 86;
  }
  x.setLineDash([]);
  if (subs.length > 5) {
    x.fillStyle = "#4a4336";
    x.font = "italic 500 30px 'Fraunces', Georgia, serif";
    x.fillText("…and " + (subs.length - 5) + " more suspects.", 120, y + 6);
  }

  // stamp
  x.save();
  x.translate(W - 280, 920); x.rotate(0.14);
  x.strokeStyle = "rgba(168,25,16,.85)"; x.lineWidth = 7;
  x.strokeRect(-150, -60, 300, 120);
  x.fillStyle = "rgba(168,25,16,.85)";
  x.font = "600 44px 'IBM Plex Mono', monospace";
  x.textAlign = "center";
  x.fillText("LEAK", 0, -8);
  x.fillText("CONFIRMED", 0, 42);
  x.restore();

  x.fillStyle = "#4a4336";
  x.textAlign = "center";
  x.font = "500 26px 'IBM Plex Mono', monospace";
  x.fillText("FIND YOURS — 100% PRIVATE, IN-BROWSER", W / 2, H - 150);
  x.fillStyle = "#1b1611";
  x.font = "600 30px 'IBM Plex Mono', monospace";
  x.fillText(location.hostname || "subscription-leak", W / 2, H - 105);

  $("share-preview").src = c.toDataURL("image/png");
}

/* ── demo data ───────────────────────────────────────── */
function demoStatement() {
  const today = new Date();
  const d = (monthsAgo, day) => {
    const dt = new Date(today.getFullYear(), today.getMonth() - monthsAgo, day);
    return `${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}/${dt.getFullYear()}`;
  };
  const rows = [];
  // non-subscription spend varies wildly month to month, like real life
  const groceries = { 3: "61.20", 2: "112.47", 1: "84.31" };
  const amazon    = { 3: "78.55", 2: "22.14", 1: "43.10" };
  const gas       = { 3: "38.40", 2: "67.25", 1: "52.00" };
  const burrito   = { 3: "28.60", 2: "11.30", 1: "14.75" };
  for (let m = 3; m >= 1; m--) {
    rows.push(
      `${d(m, 2)}  NETFLIX.COM 866-579-7172        -15.49`,
      `${d(m, 3)}  SPOTIFY USA P2E4F1               -11.99`,
      `${d(m, 5)}  APPLE.COM/BILL CA                 -2.99`,
      `${d(m, 7)}  POS DEBIT GYMCO FITNESS MEMBER   -34.00`,
      `${d(m, 9)}  PAYPAL *ADOBE INC                -22.99`,
      `${d(m, 11)} GOOGLE *YOUTUBEPREMIUM           -13.99`,
      `${d(m, 12)} TRADER JOES #552                 -${groceries[m]}`,
      `${d(m, 14)} AMZN MKTP US*2K4LP${m}           -${amazon[m]}`,
      `${d(m, 15)} CHATGPT SUBSCRIPTION OPENAI      -20.00`,
      `${d(m, 16)} SHELL OIL 5744231                -${gas[m]}`,
      `${d(m, 18)} DUOLINGO 702-5551234              -6.99`,
      `${d(m, 20)} CHIPOTLE 1138                    -${burrito[m]}`,
      `${d(m, 22)} AUDIBLE*MEMBERSHIP               -14.95`,
      `${d(m, 25)} DISCORD* NITRO                    -9.99`,
    );
  }
  rows.push(`${d(2, 27)} HELLOFRESH US                    -59.94`);
  rows.push(`${d(1, 27)} HELLOFRESH US                    -59.94`);
  return rows.join("\n");
}

/* ── wiring ──────────────────────────────────────────── */
$("analyze").addEventListener("click", () => runAnalysis($("stmt").value));
$("demo").addEventListener("click", () => {
  $("stmt").value = demoStatement();
  runAnalysis($("stmt").value);
});
$("restart").addEventListener("click", () => {
  $("results").hidden = true;
  $("stmt").value = "";
  $("stmt").focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
$("download-card").addEventListener("click", () => {
  // redraw after fonts are surely loaded
  drawShareCard();
  const a = document.createElement("a");
  a.download = "subscription-leak-case-card.png";
  a.href = $("share-canvas").toDataURL("image/png");
  a.click();
});
$("csvfile").addEventListener("change", e => {
  const f = e.target.files[0];
  if (!f) return;
  f.text().then(t => { $("stmt").value = t; runAnalysis(t); });
});

const dz = $("dropzone");
["dragenter", "dragover"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add("dragover"); }));
["dragleave", "drop"].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove("dragover"); }));
dz.addEventListener("drop", e => {
  const f = e.dataTransfer.files[0];
  if (f) f.text().then(t => { $("stmt").value = t; runAnalysis(t); });
});

// Redraw share card once webfonts land (canvas needs them loaded)
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (lastReport) drawShareCard(); });
