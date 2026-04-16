# Security Policy

**Apex Realty Centers** takes the security of our website, client data, and visitors seriously.  
This document outlines our security practices, supported versions, and how to responsibly report security vulnerabilities.

## Supported Versions

We actively maintain security updates for the following:

| Version       | Supported          | Notes |
|---------------|--------------------|-------|
| `main` branch | :white_check_mark: | Production deployment |
| Older branches| :x:                | Not supported |

## Reporting a Vulnerability

If you discover a security vulnerability in **apexrealtycenters.com**, please report it responsibly.

**Please do not** report security issues through public GitHub issues or discussions.

### How to Report

Send your report to:

**Email:** `security@apexrealtycenters.com`

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact (e.g., data exposure, XSS, authentication bypass, etc.)
- Any proof-of-concept (if safe to share)
- Affected URL(s) or component(s)
- Your preferred contact method (if different from the reporting email)

### What to Expect

- **Acknowledgment**: We will confirm receipt of your report within **48 hours**.
- **Investigation**: Our team will investigate and provide an initial assessment within **5 business days**.
- **Resolution Timeline**: We aim to resolve critical vulnerabilities within **7–14 days** and important ones within **30 days**.
- **Credit**: If you would like, we will publicly thank you (with your permission) in our security acknowledgments.

## Security Best Practices We Follow

- All forms use HTTPS with modern TLS configuration
- Input sanitization and output encoding on all user-submitted data
- Content Security Policy (CSP) headers
- Strict rate limiting on login/contact forms
- Regular dependency updates (Bootstrap, AOS, etc.)
- No storage of sensitive payment data (mortgage calculator is client-side only)
- Dark mode and theme toggle implemented without introducing DOM-based XSS risks
- Preloader and parallax handled safely with modern JS practices

## Out of Scope

The following are generally considered **out of scope** for security reports:

- Missing HTTP security headers that do not lead to direct exploitation
- Rate limiting bypasses without significant impact
- Self-XSS or issues requiring social engineering
- Attacks requiring physical access to a device
- Issues in third-party services (Google Maps embed, IDX iframe, Formspree, etc.)

## Responsible Disclosure

We appreciate the security research community and ask that you:

1. Give us reasonable time to investigate and remediate before public disclosure
2. Avoid destructive testing or actions that could affect our production site or client data

## Thank You

Thank you for helping keep **Apex Realty Centers** and our clients safe.

Your responsible disclosure helps us maintain a secure platform for families and investors in Detroit and Garden City, Michigan.

---

**Last Updated:** April 15, 2026  
**Security Contact:** security@apexrealtycenters.com
