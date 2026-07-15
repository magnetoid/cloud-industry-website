# Cloud Industry — Hosting Platform Redesign

Date: 2026-07-15
Status: implemented (autonomous session — decisions recorded here in lieu of interactive brainstorm)

## Brief

Redesign the site from an AI-agency portfolio into a professional, high-tech **cloud hosting
platform** landing page. Very minimal, creative, and psychologically persuasive marketing copy.
Static stack stays: `index.html` + `css/style.css` + `js/main.js`, no build step.

## Identity

- **Subject**: Cloud Industry — managed cloud hosting. Audience: developers, agencies, store
  owners fed up with slow/legacy hosts. Page job: start a plan or claim a free migration.
- **Palette**: Porcelain `#F6F7F9` (light bg), Ink `#0B1220` (text / dark bg), Ultramarine
  `#2547F4` (single accent), Signal `#10B981` (used ONLY for operational/uptime semantics),
  Slate `#5B6478` (muted), hairline `#E3E7EE`. Dark mode inverts to deep slate panels.
- **Type**: Cabinet Grotesk (display), Switzer (body) — Fontshare; JetBrains Mono for
  data/terminal only.
- **Signature**: hero provisioning terminal — types a `cloud deploy` sequence, goes "live in
  38s", then live-ticking latency metrics. Green status dot in nav ("All systems operational").
  Everything else quiet: hairlines, whitespace, mono data labels. No cursor gimmicks, orbs,
  constellation, marquee, or tilt.

## Page structure

1. Nav — logo, links, status pill, theme toggle, CTA
2. Hero — copy + risk-reversal microcopy | terminal panel
3. Proof: uptime ledger — status-page-style 90-day tick bar (30 days on mobile) with one
   deliberate amber "blemish effect" tick + counters (sites, TTFB, support rating, $0 switch cost)
4. Services — 8-card uniform grid: Web Hosting, Cloud VPS, Dedicated Servers, Managed
   WordPress, Domains & DNS, CDN & Edge, Security (SSL/DDoS/WAF), Storage & Backups
5. Migration — 3-step "switching is painless" (objection removal)
6. Pricing — 3 tiers, annual-default toggle, anchored prices, center decoy "Most popular"
7. Support — 24/7 engineers, response-time stats, channels
8. Testimonials — 3 quotes (placeholder)
9. Guarantee band — 30-day money-back risk reversal
10. FAQ — objection handling
11. Final CTA, footer with full service list

## Tetra Host page (`tetra.html`)

Product page for the hosting console at https://console.cloud-industry.com, linked from nav
("Tetra Host") and footer on both pages. Same design system; hero signature is a console
dashboard mockup (sidebar + KPI tiles + activity feed) reusing the `.term` window chrome.
Sections: hero, 6-card feature grid (`services--3`, 3 columns), see/act/leave value trio,
CTA. The "median session under three minutes" claim is a placeholder like all other stats.

## Persuasion inventory (all copy-level, no dark patterns)

anchoring (struck prices), decoy/center-stage plan, social proof counters + testimonials,
loss aversion (downtime cost framing), risk reversal (money-back, free zero-downtime
migration, no lock-in), authority (SLA language), specificity (precise numbers), friction
removal (CTA microcopy: no setup fees, cancel anytime). Deliberately excluded: fake countdown
timers, fabricated certification badges.

## Placeholder data — MUST be replaced before go-live

All stats (12,400 sites, 99.99% uptime, 22ms TTFB, 4.9/5), testimonials, and prices are
illustrative placeholders. Publishing them as-is would be false advertising.
