# Getting your real work onto the contribution graph

Your graph is empty because GitHub isn't counting the work you already do. Fix these, in order:

## 1. Turn on private contributions (biggest win — 30 seconds)
Profile page → **Contribution settings** (above the graph) → tick **Private contributions**.
Every commit in your private client repos then shows as a green square (repo names stay hidden).

## 2. Make sure commits are attributed to you
GitHub only counts commits whose author email is on your account. On every machine:

```bash
git config --global user.name  "Sahil Zaini"
git config --global user.email "sahilzaini2007@gmail.com"   # or add info@zainidevelopers.com under Settings → Emails
```
Check old repos with `git log --format='%ae' | sort | uniq -c`. Any email not listed under
**Settings → Emails** won't count — add it there and those past commits light up retroactively.

## 3. Push the projects that already have git history
Run `scripts/push-real-history.sh` from a folder that contains your project folders
(FORMA, ZainiPOS, StaffManager Pro…). It pushes each one that already has commits to a new
**private** repo, keeping the original commit dates. Requires the GitHub CLI (`gh auth login`).

## 4. Commit as you go
Small, real commits every working day (one per fix/feature) build the graph naturally from here on.
