# Project Roadmap: Gaps & Opportunities

## 🚀 Phase 1: Feature Depth (High Impact, Low Risk)
### 1️⃣ Detailed Investment Breakdown
- **Goal**: Add year-wise / month-wise tables alongside charts.
- **Details**:
  - **SIP**: year-wise invested vs value
  - **Lumpsum**: compounding table
  - **Retirement**: corpus depletion table
- **Benefit**: Increases trust + clarity

### 2️⃣ Scenario Comparison
- **Goal**: Allow users to compare different scenarios.
- **Details**:
  - SIP @ 10% vs 12% vs 14%
  - Retirement corpus under different inflation assumptions
  - Goal SIP with/without existing corpus
- **Benefit**: Helps with decision-making, not just calculation

### 3️⃣ Export & Share
- **Goal**: Make the app actually usable in real life.
- **Details**:
  - 📄 Download PDF (plan summary)
  - 📊 Export CSV (tables)
  - 🔗 Shareable link (query params)

## 🧠 Phase 2: Intelligence Layer (Differentiator)
### 4️⃣ Risk Profiling (Simple but Powerful)
- **Goal**: Bridges calculator → planner
- **Details**:
  - Add a short quiz (Age, Income stability, Market experience, Loss tolerance)
  - Automatically adjust expected returns and suggest asset allocation rule

### 5️⃣ Monte Carlo Simulation (Advanced)
- **Goal**: Moves the app into serious finance territory.
- **Details**:
  - Run 1,000 simulated return paths for SIP & retirement
  - Show probability of goal success (%)

## 🏗️ Phase 3: Architecture & Scale
### 6️⃣ State & Performance
- Move calculations to pure utility functions
- Memoize heavy calculations
- Consider Zustand / Jotai for shared state

### 7️⃣ Testing (Very Important for Finance)
- Unit tests for formulas
- Edge case tests (0 return, high inflation, short durations)

## 🌍 Phase 4: Monetization-Ready Enhancements
### 8️⃣ User Accounts (Optional)
- Save multiple plans
- Named goals (House, Child Education, Retirement)
- Local-first → backend later

### 9️⃣ Regional Expansion
- 🇺🇸 US tax placeholders
- 🇬🇧 ISA / pension basics
- 🇪🇺 Generic capital gains model

## 📊 Priority Order
1. Year-wise tables for all calculators
2. Scenario comparison toggle
3. PDF / CSV export
4. Risk profiling → auto assumptions
5. Monte Carlo simulation
6. Tests for all formulas
