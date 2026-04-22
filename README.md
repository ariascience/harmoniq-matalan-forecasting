# HarmonIQ × Matalan — Demand Forecasting Report

Password-gated, client-side-decrypted report hosted on GitHub Pages.

## How it works

- `index.html` — HarmonIQ-branded login page. Mobile-friendly.
- `encrypted.json` — the report HTML, encrypted with AES-256-GCM. The key is derived with PBKDF2-SHA256 (250k iterations) from `username:password`.
- On submit, the browser derives the key, decrypts in memory, and renders the report. Nothing is ever sent to a server.

## Re-encrypting with a new source report

```bash
node build-encrypt.mjs path/to/report.html encrypted.json "username:password"
```

`build-encrypt.mjs` is a dev-time helper — not deployed (ignored via `.gitignore`-style filter at deploy time if desired, otherwise harmless).

## Local preview

Because `index.html` `fetch`es `encrypted.json`, you need a static server — `file://` won't work. From the repo root:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Security notes

- The report is genuinely encrypted — viewing page source does not reveal its contents.
- The repo is **public**, so the encrypted blob is publicly readable. Without the credentials, it is infeasible to decrypt.
- Do not commit the plaintext report.
- If credentials leak, rotate them by re-running the encryption step with a new password and pushing.
