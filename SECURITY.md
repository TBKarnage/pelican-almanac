# Security Policy

## Supported Versions

Only the latest state of the `main` branch is actively maintained and receives security updates.

| Version | Supported |
| ------- | --------- |
| `main`  | Yes       |

## Reporting a Vulnerability

Please **do not** report security vulnerabilities through public GitHub issues.

Instead, report vulnerabilities privately via GitHub's **Security Advisories** feature (Repository → **Security** → **Advisories** → **Report a vulnerability**).

When submitting a report, please include:
- A description of the vulnerability and its potential impact
- Steps to reproduce or a minimal proof of concept
- Any affected files, scripts (such as `scripts/host-local.mjs` or `nginx.conf`), or dependencies

We will acknowledge receipt and work with you to verify and address confirmed issues promptly.

## Security Notes for Self-Hosting

- **Local Data Storage:** Farm profiles, progress, and imported Stardew Valley XML save data are processed client-side and persisted only in browser `localStorage`.
- **LAN TLS Certificates:** If you generate local HTTPS certificates for `scripts/host-local.mjs --https`, keep `certs/`, `*.pem`, and `*.key` untracked (covered by `.gitignore`) and never commit private keys.
