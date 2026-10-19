"""Rewrites the LIVE LEDGER block in README.md with real data from the GitHub API.
Runs daily from .github/workflows/profile.yml. Standard library only."""
import json, os, re, urllib.request, datetime as dt

USER = os.environ.get("GH_USER", "Sahil-Zaini")
TOKEN = os.environ.get("GITHUB_TOKEN", "")
DUBAI = dt.timezone(dt.timedelta(hours=4))

def api(path):
    req = urllib.request.Request(f"https://api.github.com{path}",
        headers={"Accept": "application/vnd.github+json", "User-Agent": USER,
                 **({"Authorization": f"Bearer {TOKEN}"} if TOKEN else {})})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

repos = [r for r in api(f"/users/{USER}/repos?per_page=100&sort=pushed")
         if not r["fork"] and r["name"].lower() != USER.lower()]
stars = sum(r["stargazers_count"] for r in repos)
now = dt.datetime.now(DUBAI)
golive = dt.datetime(2027, 1, 1, tzinfo=DUBAI)
days = max((golive - now).days, 0)

def ago(iso):
    d = now - dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))
    if d.days >= 1: return f"{d.days}d ago"
    h = d.seconds // 3600
    return f"{h}h ago" if h else "just now"

rows = "\n".join(
    f"| [`{r['name']}`]({r['html_url']}) | {(r['description'] or '—')[:70]} | ⭐ {r['stargazers_count']} | {ago(r['pushed_at'])} |"
    for r in repos[:5])

block = f"""<!-- LEDGER:START -->
| 📦 Public repos | ⭐ Total stars | 🧾 Days to UAE e-invoicing go-live* | 🕒 Updated (Dubai) |
|:---:|:---:|:---:|:---:|
| **{len(repos)}** | **{stars}** | **{days}** | {now:%d %b %Y, %H:%M} |

**Recently shipped**

| Repo | What | Stars | Last push |
|---|---|:---:|:---:|
{rows}

<sub>*First mandatory phase for large businesses, 1 Jan 2027. This block rewrites itself every day via GitHub Actions.</sub>
<!-- LEDGER:END -->"""

p = "README.md"
s = open(p, encoding="utf-8").read()
s = re.sub(r"<!-- LEDGER:START -->.*?<!-- LEDGER:END -->", block, s, flags=re.S)
open(p, "w", encoding="utf-8").write(s)
print("ledger updated:", len(repos), "repos,", stars, "stars,", days, "days")
