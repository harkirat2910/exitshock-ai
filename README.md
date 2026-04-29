# ExitShock AI — Procurement Risk Intelligence Platform

> **What happens when your only vendor disappears?**  
> ExitShock AI quantifies the catastrophic ripple effects of vendor exits in government procurement — before they happen.

---

## The Problem

Government procurement is a **$64B+ ecosystem** with a silent crisis: **vendor concentration risk**. When a dominant supplier exits — bankruptcy, acquisition, debarment — ministries face:

- **Service blackouts** — no qualified replacement exists
- **Emergency sole-source contracts** — at inflated prices, with zero competition
- **Cascading failures** — downstream services collapse without the upstream vendor

Traditional risk management is reactive. By the time a vendor exits, the damage is done. Procurement officers have no visibility into *how fragile* their supply chains actually are — until it's too late.

---

## Our Solution

**ExitShock AI** is an intelligence platform that simulates vendor exits *before they happen*, scoring every vendor-ministry relationship on a **Fragility Index (0–100)** and generating actionable continuity plans.

We treat procurement like a complex adaptive system — not a spreadsheet.

---

## How It Works

### 1. Fragility Scoring Engine

Every vendor case is scored using a composite fragility model:

| Signal | What It Captures |
|--------|-----------------|
| **HHI (Herfindahl-Hirschman Index)** | Market concentration — monopoly vs. healthy competition |
| **Vendor Share** | Single-vendor dominance over ministry spend |
| **Sole-Source Share** | % of contracts awarded without competition |
| **Replacement Vendor Count** | How many qualified alternatives exist |
| **Active Vendor Pool Depth** | Whether the market can absorb a sudden exit |

These signals combine into a **Fragility Score** with risk classification: `Critical` → `High` → `Moderate` → `Low`.

### 2. Exit Shock Simulation

Our simulation engine models the counterfactual: *"If this vendor vanished tomorrow, what breaks?"*

```
Inputs:
  vendor_spend, ministry_spend, vendor_share,
  active_vendors, replacement_vendors[], replacement_capacity

Outputs:
  → Spend Exposed ($)
  → Coverage Gap (%)
  → Replacement Difficulty (Critical/High/Medium/Low)
  → AI-generated recommendation
```

The simulator calculates **replacement capacity** by aggregating historical spend of qualified alternates and computing the gap between what's needed and what's available.

### 3. What-If Scenario Modeling

Interactive slider lets analysts ask: *"If we diversified 20% of spend away from this vendor, how much does our risk drop?"* — giving quantitative backing to procurement reform proposals.

---

## Platform Walkthrough

### Homepage — Risk Intelligence Dashboard

- **Real-time stats**: Total contracts analyzed, spend under monitoring, flagged vendors, critical cases
- **AI Insight Cards**: Instantly surface the most dangerous patterns (Critical vendors, sole-source dependencies, fragile markets)
- **Live Risk Ticker**: Scrolling feed of active risk signals
- **Sortable Case Table**: Filter by risk level, search vendors, sort by any metric

### Investigation Flow — 4-Step Guided Workflow

| Step | Name | What Happens |
|------|------|-------------|
| 1 | **Signal Triage** | AI surfaces risk signals (dominance, HHI, sole-source, etc.). Analyst confirms or dismisses each threat. |
| 2 | **Deep Dive** | Full vendor case file — timeline data, replacement vendor profiles, historical concentration trends |
| 3 | **Simulate Exit** | One-click simulation computes spend exposure, coverage gap, and replacement difficulty. What-if slider for scenario planning. |
| 4 | **Action Plan** | AI generates prioritized actions based on confirmed threats + simulation results. Export as procurement memo. |

### Challenge Mode — Gamified Risk Prediction

A 5-round interactive game where users predict exit shock outcomes (fragility score, spend exposure, coverage gap) using ring sliders — then watch an animated simulation sequence reveal the truth. Scoring system ranks users from "Risk Novice" to "Oracle".

---

## Technical Architecture

```
React 19 + Vite 8 (sub-1s builds)
├── Tailwind CSS 4 (custom design token system)
├── Framer Motion (page transitions, micro-interactions)
├── Recharts (data visualization)
├── React Router v7 (SPA routing)
└── Context API (global state, simulation state machine)
```

**Design System**: Custom CSS token layer (`@theme` + `@layer`) with semantic tokens — `surface`, `accent`, `danger`, `success` — enabling full theme control from a single file.

**Data Pipeline**: 82,000+ parsed procurement records → scored and normalized → JSON-served to the client. Each case includes timeline data, replacement vendor profiles, and computed fragility metrics.

**Simulation Engine** (`simulation.js`): Pure-function exit shock calculator — deterministic, testable, no external dependencies. Takes raw case data → outputs impact assessment with difficulty classification and natural-language recommendation.

---

## Key Differentiators

| Feature | ExitShock AI | Traditional Tools |
|---------|-------------|-------------------|
| Predictive risk scoring | ✅ Fragility Index (0-100) | ❌ Reactive alerts only |
| Exit simulation | ✅ Full counterfactual modeling | ❌ No simulation capability |
| What-if scenarios | ✅ Interactive diversification slider | ❌ Static reports |
| Guided investigation | ✅ 4-step analyst workflow | ❌ Manual analysis |
| Gamified training | ✅ Challenge mode | ❌ None |
| Actionable output | ✅ Auto-generated procurement memos | ❌ Raw data dumps |

---

## Impact

- **Prevents service disruptions** by identifying fragile vendor relationships *before* exits
- **Saves millions** by enabling proactive diversification vs. emergency sole-source recovery
- **Empowers procurement officers** with quantitative evidence for policy changes
- **Trains the next generation** through gamified risk prediction challenges

---

## Quick Start

```bash
cd exitshock-ai
npm install
npm run dev
```

---

## Team

**Null Entity** — Built for the April 2026 Hackathon

---

*ExitShock AI: Because the best time to plan for a vendor exit is before it happens.*
