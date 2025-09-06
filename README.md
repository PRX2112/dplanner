# Investment Planning Web App

A comprehensive React-based investment planning application with SIP calculators, retirement planning, CAGR analysis, asset allocation, tax modeling, XIRR calculations, and goal-based SIP planning.

## Features

- **SIP Calculator**: Monthly SIP investment planning with growth projections
- **Lump Sum Calculator**: One-time investment growth calculations
- **Retirement Planner**: Corpus calculation using SWR and finite years methods
- **CAGR Calculator**: Compound Annual Growth Rate calculations
- **Asset Allocation**: Age-based portfolio allocation recommendations
- **Tax Modeling**: Simplified Indian tax calculations for capital gains
- **XIRR Calculator**: Internal Rate of Return for irregular cash flows
- **Goal-based SIP**: Calculate required monthly SIP to reach financial goals

## Tech Stack

- **React 18** with Vite
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Recharts** for data visualization
- **Framer Motion** for animations
- **Lucide React** for icons

## Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local development URL (usually `http://localhost:5173`)

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── select.jsx
│   │   ├── slider.jsx
│   │   └── tabs.jsx
│   └── InvestmentPlanner.jsx # Main application component
├── lib/
│   └── utils.js           # Utility functions
├── App.jsx                # Root component
├── main.jsx              # Application entry point
└── index.css             # Global styles and Tailwind imports
```

## Usage

1. **SIP Calculator**: Enter monthly investment amount, expected return, and investment horizon to see projected growth
2. **Lump Sum**: Calculate growth of one-time investments
3. **Retirement Planning**: Plan for retirement using current expenses, inflation, and withdrawal rates
4. **CAGR**: Calculate compound annual growth rate between two values
5. **Asset Allocation**: Get age-based portfolio allocation recommendations
6. **Advanced Features**: 
   - Tax modeling for Indian capital gains
   - XIRR calculations for irregular investments
   - Goal-based SIP planning

## Disclaimer

This tool is for educational and planning purposes only. It does not provide financial advice. Returns are assumptions, not guarantees. Tax calculations are simplified and may not reflect actual tax obligations. For precise financial planning and tax advice, consult a licensed professional.

## License

This project is open source and available under the MIT License.