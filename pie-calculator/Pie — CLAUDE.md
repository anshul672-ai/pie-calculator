# Pie — CLAUDE.md

## Context
The visual design is coming from Claude Design handoff — trust the 
design for all colors, typography, spacing, and layout. Do not 
deviate from it. This file only covers logic, data, and behavior.

## Calculator Logic

### Number formatting — use this everywhere
function fmt(n) {
  if (n >= 1e7) return '₹' + (n/1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + (n/1e5).toFixed(1) + ' L';
  return '₹' + Math.round(n).toLocaleString('en-IN');
}

Slider value display format:
- Ages: "30 YRS"
- Money: "₹80 K" or "₹1.2 L"
- Percentages: "6.0 %"

---

## Tabs

All four tabs — FIRE, SIP, NPS, Combined — are active from the 
start. No locking or sequencing.

---

## FIRE Tab

### Inputs + defaults
- Current age: 22–55, default 30
- Target retirement age: 30–70, default 50
- Monthly expense today: ₹10K–₹5L, default ₹80K
- Inflation rate: 2–12%, default 6%
- Expected portfolio return: 6–20%, default 12%

### Logic
years = target retirement age - current age
future annual expense = (monthly expense × 12) × (1 + inflation)^years
FIRE number = future annual expense × 25

### Display
- FIRE number (large, primary)
- Future monthly expense at retirement
- Years to retirement

---

## SIP Tab

### Inputs + defaults
- Monthly SIP: ₹500–₹2L, default ₹40K
- Annual step-up: 0–25%, default 10%
- Expected return: 6–20%, default 12%
- Duration: derived from (retirement age - current age) using 
  FIRE tab values. If user hasn't touched FIRE tab, default to 
  20 years.

### Logic
Step-up SIP compounding — monthly, annual step-up:
corpus = 0
monthly_sip = default
for each year in duration:
  for each month in year:
    corpus = (corpus + monthly_sip) × (1 + annual_return/12)
  monthly_sip = monthly_sip × (1 + step_up)

### Display
- Total corpus
- Total amount invested
- Total gains
- Wealth multiplier (corpus / invested)

---

## NPS Tab

### Inputs + defaults
- Monthly NPS contribution: ₹500–₹1L, default ₹6K
- Current age: synced from FIRE tab. Default 30 if untouched.
- Equity allocation: 0–75%, default 75%
- Annuity rate: 3–9%, default 6%

### Logic
NPS always compounds to age 60 (fixed retirement for NPS)
blended return = (equity% × 12%) + ((1 - equity%) × 7%)
corpus = standard SIP compounding using blended return 
         from current age to 60
lump sum = corpus × 60% (tax free)
annuity corpus = corpus × 40%
monthly pension = (annuity corpus × annuity rate) / 12

### Display
- Total NPS corpus at 60
- Lump sum (60%)
- Monthly pension estimate
- Years of contribution

---

## Combined Tab

### Behavior
Always uses live values from all three tabs.
If user hasn't touched a tab, use that tab's default values.
Never show a broken or empty state.

### Logic
FIRE target = from FIRE tab (or default)
SIP corpus = from SIP tab (or default)
NPS lump sum = from NPS tab (or default)
total corpus = SIP corpus + NPS lump sum
progress % = (total corpus / FIRE target) × 100, capped display 
             at 100% but show overshoot in insight text
gap = FIRE target - total corpus

### Progress ring
- Animated SVG circle
- Gold stroke fills clockwise based on progress %
- Center: large % number
- If progress >= 100%: ring fully gold, insight says 
  "You'll overshoot by [amount]. Consider retiring earlier."
- If progress < 100%: insight says 
  "₹[gap] more needed. Increase SIP or extend timeline."

### Stacked bar
Three segments proportional to corpus contribution:
- SIP (amber)
- NPS (dark gold)  
- Gap (dark, muted) — only if not fully covered

### Gap analysis card
- Covered: heading "Covered", subtext "YOU'RE PAST THE NUMBER"
- Not covered: show gap amount in large type

---

## Shared state
All tabs share these values silently:
- current age (set in FIRE tab, used by NPS)
- retirement age (set in FIRE tab, used by SIP duration)
If user changes age in FIRE tab, SIP duration and NPS 
contribution years update automatically.

---

## Mobile behavior
- Single column layout
- Sliders stack full width
- Results panel appears below sliders (not beside)
- Tab bar scrolls horizontally if needed
- Hero CTA buttons stack vertically

---

## Hero
- "Calculate your number" button and "How it works" button 
  both smooth scroll to the calculator section
- ₹4.8 Cr stat in hero is hardcoded for v1

---

## Build order (follow strictly, one at a time)
1. Hero section (from design handoff)
2. Calculator section layout + tab switching
3. Combined tab — UI + logic
4. FIRE tab — UI + logic
5. SIP tab — UI + logic
6. NPS tab — UI + logic
7. Wire shared state across tabs
8. Mobile responsive pass
9. Final polish — animations, transitions, hover states

## Rules
- Follow design handoff visuals exactly
- Ask before deviating from anything in this file
- No placeholder copy anywhere
- All slider interactions update results instantly
- No submit buttons anywhere