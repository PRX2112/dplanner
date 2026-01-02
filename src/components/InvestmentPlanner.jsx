import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, AreaChart, Area, BarChart, Bar } from "recharts";
import { Info, Calculator, TrendingUp, PieChart, Target, PiggyBank, HandCoins, LineChart as LineChartIcon, RefreshCw, Printer } from "lucide-react";
import { motion } from "framer-motion";
import CurrencySelector from "./CurrencySelector";
import LanguageSelector from "./LanguageSelector";
import { useCurrency } from "../context/CurrencyContext";

// --- Utilities ---
// const inr removed - using dynamic formatMoney instead
const num = (v) => (isFinite(+v) ? +v : 0);

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Convert annual percentage to monthly decimal
const annualPctToMonthlyRate = (p) => num(p) / 100 / 12;
const annualPctToRate = (p) => num(p) / 100;

// Compound helpers
const fvLumpSum = (principal, annualPct, years, compPerYear = 12) => {
  const r = annualPctToRate(annualPct) / compPerYear;
  const n = years * compPerYear;
  return principal * Math.pow(1 + r, n);
};

const fvSIP = (monthlyInvestment, annualPct, years) => {
  const r = annualPctToMonthlyRate(annualPct);
  const n = Math.round(years * 12);
  if (r === 0) return monthlyInvestment * n;
  return monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
};

const sipSchedule = (monthlyInvestment, annualPct, years) => {
  const r = annualPctToMonthlyRate(annualPct);
  const n = Math.round(years * 12);
  let balance = 0;
  const rows = [];
  for (let m = 1; m <= n; m++) {
    balance = (balance + monthlyInvestment) * (1 + r);
    if (m % 12 === 0) {
      rows.push({ year: m / 12, invested: monthlyInvestment * m, value: balance });
    }
  }
  if (n % 12 !== 0) {
    rows.push({ year: years, invested: monthlyInvestment * n, value: balance });
  }
  return rows;
};

const lumpsumSchedule = (principal, annualPct, years) => {
  const r = annualPctToRate(annualPct);
  const rows = [];
  for (let y = 1; y <= years; y++) {
    const value = principal * Math.pow(1 + r, y);
    rows.push({ year: y, value, invested: principal });
  }
  if (!rows.find((x) => x.year === years)) rows.push({ year: years, value: principal * Math.pow(1 + r, years), invested: principal });
  return rows;
};

// Retirement corpus calculators
const retirementCorpus_SWR = ({ monthlyExpenseToday, inflationPct, yearsToRetire, swrPct }) => {
  const g = annualPctToRate(inflationPct);
  const annualExpenseAtRetire = monthlyExpenseToday * 12 * Math.pow(1 + g, yearsToRetire);
  const corpus = annualExpenseAtRetire / annualPctToRate(swrPct);
  return { annualExpenseAtRetire, corpus };
};

const retirementCorpus_FiniteYears = ({ monthlyExpenseToday, inflationPct, yearsToRetire, yearsInRetirement, postRetReturnPct }) => {
  const g = annualPctToRate(inflationPct);
  const r = annualPctToRate(postRetReturnPct);
  const annualExpenseAtRetire = monthlyExpenseToday * 12 * Math.pow(1 + g, yearsToRetire);
  const realRate = (1 + r) / (1 + g) - 1;
  let corpus;
  if (Math.abs(realRate) < 1e-9) {
    corpus = annualExpenseAtRetire * yearsInRetirement;
  } else {
    corpus = annualExpenseAtRetire * (1 - Math.pow(1 + realRate, -yearsInRetirement)) / realRate;
  }
  return { annualExpenseAtRetire, corpus, realRate };
};

// CAGR
const calcCAGR = ({ initial, final, years }) => {
  if (initial <= 0 || years <= 0) return 0;
  return (Math.pow(final / initial, 1 / years) - 1) * 100;
};

// Age-based asset allocation
const suggestAllocation = (age, rule = "110-age") => {
  const base = rule === "100-age" ? 100 : 110;
  const equity = clamp(base - age, 0, 100);
  const debt = clamp(100 - equity, 0, 100);
  return { equity, debt };
};

// --- New features: Tax modelling (India basics), XIRR, Goal-based SIP back-solve ---

// TAX MODELLING (simple Indian rules)
// Notes: This is a simplified estimator for user education. It supports:
// - Equity LTCG: 10% on gains above ₹1,00,000 in a financial year (no indexation)
// - Equity STCG: 15% (where STT applied)
// - Section 80C deduction cap: ₹1,50,000

const taxModel = ({ ltcgGain, stcgGain, otherIncome = 0, taxableIncomeBefore80C = 0, investments80C = 0 }) => {
  // Inputs expected in INR
  const exemptLTCGThreshold = 100000;
  const ltcgTaxable = Math.max(0, ltcgGain - exemptLTCGThreshold);
  const ltcgTax = ltcgTaxable * 0.10;
  const stcgTax = Math.max(0, stcgGain) * 0.15;

  const sec80CLimit = 150000;
  const eligible80C = Math.min(sec80CLimit, Math.max(0, investments80C));

  const grossIncome = otherIncome + taxableIncomeBefore80C;
  const taxableAfter80C = Math.max(0, grossIncome - eligible80C);

  // Very crude slab: we won't implement the full Indian slab system here — show taxable income after 80C and taxes on capital gains separately.
  return {
    ltcgTaxable,
    ltcgTax,
    stcgTax,
    eligible80C,
    taxableAfter80C,
    grossIncome,
    totalCapitalGainsTax: ltcgTax + stcgTax,
  };
};

// XIRR implementation (Newton-Raphson on NPV of cashflows)
// cashflows: [{ date: Date/string, amount: number }] amounts: outflows negative, inflows positive
const xirr = (cashflows, guess = 0.1) => {
  // Helper: convert date to year fraction relative to first date
  const parseDate = (d) => (d instanceof Date ? d : new Date(d));
  if (!cashflows || cashflows.length === 0) return NaN;
  const dates = cashflows.map((c) => parseDate(c.date));
  const amounts = cashflows.map((c) => num(c.amount));
  const t0 = dates[0];
  const dayDiff = (d1, d2) => (d1 - d2) / (1000 * 60 * 60 * 24);
  const years = dates.map((d) => dayDiff(d, t0) / 365.0);

  const npv = (r) => amounts.reduce((s, a, i) => s + a / Math.pow(1 + r, years[i]), 0);
  const npvDerivative = (r) => amounts.reduce((s, a, i) => s - (years[i] * a) / Math.pow(1 + r, years[i] + 1), 0);

  let x = guess;
  for (let i = 0; i < 100; i++) {
    const f = npv(x);
    const fprime = npvDerivative(x);
    if (Math.abs(fprime) < 1e-10) break;
    const dx = f / fprime;
    x -= dx;
    if (Math.abs(dx) < 1e-7) return x;
  }
  return x;
};

// GOAL-BASED SIP BACK-SOLVE
// Compute monthly SIP needed to reach target considering existing corpus and lump sum
const requiredSIP = ({ targetAmount, years, expectedAnnualReturnPct, existingCorpus = 0, existingMonthly = 0, lumpsum = 0 }) => {
  const r = annualPctToMonthlyRate(expectedAnnualReturnPct);
  const n = Math.round(years * 12);

  // Future value of existing corpus and lumpsum
  const fvCorpus = fvLumpSum(existingCorpus + lumpsum, expectedAnnualReturnPct, years, 12);

  // If r === 0, simple arithmetic
  if (Math.abs(r) < 1e-12) {
    const remaining = Math.max(0, targetAmount - fvCorpus);
    return remaining / n;
  }

  const factor = ((Math.pow(1 + r, n) - 1) / r) * (1 + r); // multiplier for SIP
  const remaining = Math.max(0, targetAmount - fvCorpus);
  const monthly = remaining / factor;
  return monthly;
};

// UI Helper components
const Field = ({ label, children, hint }) => (
  <div className="grid gap-2">
    <Label className="text-sm sm:text-base text-gray-200 font-medium">{label}</Label>
    {children}
    {hint && (
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mt-1">
        <Info className="h-3 w-3 sm:h-3.5 sm:w-3.5 icon-hover" />
        <span>{hint}</span>
      </div>
    )}
  </div>
);

const Metric = ({ label, value, sub }) => (
  <div className="p-3 sm:p-4 rounded-2xl metric-card gradient-card">
    <div className="text-xs sm:text-sm uppercase tracking-wide text-gray-300">{label}</div>
    <div className="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 text-white counter">{value}</div>
    {sub && <div className="text-xs sm:text-sm text-gray-400 mt-1">{sub}</div>}
  </div>
);

export default function InvestmentPlanner() {
  const { t } = useTranslation();
  const { formatMoney, activeCurrency } = useCurrency();
  const s = activeCurrency.symbol;
  // ---- SIP ----
  const [sip, setSip] = useState({ monthly: 20000, annualReturn: 12, years: 20 });
  const sipFV = useMemo(() => fvSIP(sip.monthly, sip.annualReturn, sip.years), [sip]);
  const sipData = useMemo(() => sipSchedule(sip.monthly, sip.annualReturn, sip.years), [sip]);

  // ---- Lump Sum ----
  const [ls, setLs] = useState({ principal: 1000000, annualReturn: 10, years: 15 });
  const lsFV = useMemo(() => fvLumpSum(ls.principal, ls.annualReturn, ls.years), [ls]);
  const lsData = useMemo(() => lumpsumSchedule(ls.principal, ls.annualReturn, ls.years), [ls]);

  // ---- Retirement ----
  const [ret, setRet] = useState({ expenseMonthly: 60000, inflation: 6, yearsToRetire: 25, yearsInRetirement: 30, postRetReturn: 7, swr: 4 });
  const retSWR = useMemo(() => retirementCorpus_SWR({ monthlyExpenseToday: ret.expenseMonthly, inflationPct: ret.inflation, yearsToRetire: ret.yearsToRetire, swrPct: ret.swr }), [ret]);
  const retFinite = useMemo(() => retirementCorpus_FiniteYears({ monthlyExpenseToday: ret.expenseMonthly, inflationPct: ret.inflation, yearsToRetire: ret.yearsToRetire, yearsInRetirement: ret.yearsInRetirement, postRetReturnPct: ret.postRetReturn }), [ret]);

  // ---- CAGR ----
  const [cagr, setCagr] = useState({ initial: 500000, final: 2500000, years: 5 });
  const cagrPct = useMemo(() => calcCAGR(cagr), [cagr]);

  // ---- Allocation ----
  const [age, setAge] = useState(30);
  const [rule, setRule] = useState("110-age");
  const alloc = useMemo(() => suggestAllocation(age, rule), [age, rule]);

  // ---- Advanced features state ----
  const [taxInputs, setTaxInputs] = useState({ ltcgGain: 120000, stcgGain: 20000, otherIncome: 1200000, taxableIncomeBefore80C: 1200000, investments80C: 100000 });
  const taxResult = useMemo(() => taxModel(taxInputs), [taxInputs]);

  const [xirrFlows, setXirrFlows] = useState([
    { date: new Date().toISOString().slice(0, 10), amount: -20000 },
    { date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10), amount: 250000 },
  ]);
  const xirrValue = useMemo(() => xirr(xirrFlows), [xirrFlows]);

  const [goal, setGoal] = useState({ target: 10000000, years: 10, expectedReturn: 12, existingCorpus: 500000, lumpsum: 0 });
  const requiredMonthly = useMemo(() => requiredSIP({ targetAmount: goal.target, years: goal.years, expectedAnnualReturnPct: goal.expectedReturn, existingCorpus: goal.existingCorpus, lumpsum: goal.lumpsum }), [goal]);

  const resetAll = () => {
    setSip({ monthly: 0, annualReturn: 0, years: 0 });
    setLs({ principal: 0, annualReturn: 0, years: 0 });
    setRet({ expenseMonthly: 0, inflation: 0, yearsToRetire: 0, yearsInRetirement: 0, postRetReturn: 0, swr: 0 });
    setCagr({ initial: 0, final: 0, years: 0 });
    setAge(0);
    setRule("110-age");
    setTaxInputs({ ltcgGain: 0, stcgGain: 0, otherIncome: 0, taxableIncomeBefore80C: 0, investments80C: 0 });
    setXirrFlows([
      { date: new Date().toISOString().slice(0, 10), amount: 0 },
      { date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().slice(0, 10), amount: 0 },
    ]);
    setGoal({ target: 0, years: 0, expectedReturn: 0, existingCorpus: 0, lumpsum: 0 });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const currentDate = new Date().toLocaleDateString(activeCurrency.locale, { year: 'numeric', month: 'long', day: 'numeric' });

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>D-Planner Investment Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; }
          .header h1 { color: #1e40af; font-size: 32px; margin-bottom: 10px; }
          .header .subtitle { color: #6b7280; font-size: 14px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 15px; background: #f3f4f6; border-radius: 8px; }
          .section { margin-bottom: 30px; page-break-inside: avoid; }
          .section-title { color: #1e40af; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #3b82f6; padding-left: 12px; }
          .input-group { margin-bottom: 20px; }
          .input-label { font-weight: 600; color: #374151; margin-bottom: 5px; }
          .input-value { color: #059669; font-size: 18px; font-weight: 500; }
          .results { background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; }
          .result-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #d1fae5; }
          .result-item:last-child { border-bottom: none; }
          .result-label { font-weight: 600; color: #065f46; }
          .result-value { color: #047857; font-size: 18px; font-weight: 700; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          @media print { body { padding: 20px; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 D-Planner Investment Report</h1>
          <p class="subtitle">${t('header.subtitle')}</p>
        </div>
        
        <div class="meta">
          <div><strong>Date:</strong> ${currentDate}</div>
          <div><strong>Currency:</strong> ${activeCurrency.code} (${activeCurrency.symbol})</div>
        </div>

        <div class="section">
          <h2 class="section-title">${t('sip.title')}</h2>
          <div class="input-group">
            <div class="input-label">${t('sip.monthlyInvestment')}</div>
            <div class="input-value">${formatMoney(sip.monthly)}</div>
          </div>
          <div class="input-group">
            <div class="input-label">${t('sip.expectedReturn')}</div>
            <div class="input-value">${sip.annualReturn}%</div>
          </div>
          <div class="input-group">
            <div class="input-label">${t('sip.investmentHorizon')}</div>
            <div class="input-value">${sip.years} ${t('common.years')}</div>
          </div>
          <div class="results">
            <div class="result-item">
              <span class="result-label">${t('sip.futureValue')}:</span>
              <span class="result-value">${formatMoney(sipFV)}</span>
            </div>
            <div class="result-item">
              <span class="result-label">${t('sip.totalInvested')}:</span>
              <span class="result-value">${formatMoney(sip.monthly * Math.round(sip.years * 12))}</span>
            </div>
            <div class="result-item">
              <span class="result-label">${t('sip.wealthGain')}:</span>
              <span class="result-value">${formatMoney(Math.max(0, sipFV - sip.monthly * Math.round(sip.years * 12)))}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t('lumpsum.title')}</h2>
          <div class="input-group">
            <div class="input-label">${t('lumpsum.principal')}</div>
            <div class="input-value">${formatMoney(ls.principal)}</div>
          </div>
          <div class="input-group">
            <div class="input-label">${t('lumpsum.expectedReturn')}</div>
            <div class="input-value">${ls.annualReturn}%</div>
          </div>
          <div class="input-group">
            <div class="input-label">${t('common.years')}</div>
            <div class="input-value">${ls.years} ${t('common.years')}</div>
          </div>
          <div class="results">
            <div class="result-item">
              <span class="result-label">${t('sip.futureValue')}:</span>
              <span class="result-value">${formatMoney(lsFV)}</span>
            </div>
            <div class="result-item">
              <span class="result-label">${t('sip.wealthGain')}:</span>
              <span class="result-value">${formatMoney(Math.max(0, lsFV - ls.principal))}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t('retirement.title')}</h2>
          <div class="input-group">
            <div class="input-label">${t('retirement.monthlyExpense')}</div>
            <div class="input-value">${formatMoney(ret.expenseMonthly)}</div>
          </div>
          <div class="input-group">
            <div class="input-label">${t('retirement.yearsToRetirement')}</div>
            <div class="input-value">${ret.yearsToRetire} ${t('common.years')}</div>
          </div>
          <div class="input-group">
            <div class="input-label">${t('retirement.yearsInRetirement')}</div>
            <div class="input-value">${ret.yearsInRetirement} ${t('common.years')}</div>
          </div>
          <div class="results">
            <div class="result-item">
              <span class="result-label">${t('retirement.corpusSWR')}:</span>
              <span class="result-value">${formatMoney(retSWR.corpus)}</span>
            </div>
            <div class="result-item">
              <span class="result-label">${t('retirement.corpusFinite', { years: ret.yearsInRetirement })}:</span>
              <span class="result-value">${formatMoney(retFinite.corpus)}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">${t('cagr.title')}</h2>
          <div class="input-group">
            <div class="input-label">${t('cagr.initialValue')}</div>
            <div class="input-value">${formatMoney(cagr.initial)}</div>
          </div>
          <div class="input-group">
            <div class="input-label">${t('cagr.finalValue')}</div>
            <div class="input-value">${formatMoney(cagr.final)}</div>
          </div>
          <div class="input-group">
            <div class="input-label">${t('common.years')}</div>
            <div class="input-value">${cagr.years} ${t('common.years')}</div>
          </div>
          <div class="results">
            <div class="result-item">
              <span class="result-label">${t('tabs.cagr')}:</span>
              <span class="result-value">${cagrPct.toFixed(2)}% p.a.</span>
            </div>
            <div class="result-item">
              <span class="result-label">${t('cagr.growthMultiple')}:</span>
              <span class="result-value">× ${(cagr.final / Math.max(1, cagr.initial)).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p><strong>Disclaimer:</strong> This tool is for education and planning. It does not provide financial advice. Returns are assumptions, not guarantees. For precise tax filing and investment advice consult a licensed professional.</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="min-h-screen gradient-bg text-white p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto"
      >
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 animate-fade-in-up">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-gradient">
              <div className="flex items-center gap-2 sm:gap-3">
                <img className="h-6 w-6 sm:h-7 sm:w-7 md:h-15 md:w-15 icon-hover animate-float" src="/favicon.png" />
                {/* <span className="leading-tight">D-Planner</span> */}
              </div>
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300">{t('header.title')}</span>
            </h1>
            <p className="text-sm sm:text-base text-gray-300 mt-1 sm:mt-2 animate-fade-in-up animate-delay-200 leading-relaxed">
              {t('header.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 animate-fade-in-up animate-delay-300 mt-3 sm:mt-0">
            <CurrencySelector />
            <LanguageSelector />
            <Button variant="outline" onClick={handlePrint} className="rounded-2xl btn-enhanced glass text-sm sm:text-base px-3 sm:px-4 py-2">
              <Printer className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 icon-hover" />
              {t('common.print')}
            </Button>
            <Button variant="outline" onClick={resetAll} className="rounded-2xl btn-enhanced glass text-sm sm:text-base px-3 sm:px-4 py-2">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 icon-hover" />
              {t('common.reset')}
            </Button>
          </div>
        </header>

        <Tabs defaultValue="sip" className="grid gap-4 sm:gap-6">
          <div className="overflow-x-auto">
            <TabsList className="grid grid-cols-6 sm:grid-cols-6 w-full min-w-max rounded-2xl glass animate-fade-in-up animate-delay-400">
              <TabsTrigger value="sip" className="rounded-2xl tab-enhanced text-xs sm:text-sm px-2 sm:px-3">
                <PiggyBank className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 icon-hover" />
                <span className="hidden sm:inline">{t('tabs.sip')}</span>
                <span className="sm:hidden">{t('tabs.sip')}</span>
              </TabsTrigger>
              <TabsTrigger value="lumpsum" className="rounded-2xl tab-enhanced text-xs sm:text-sm px-2 sm:px-3">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 icon-hover" />
                <span className="hidden sm:inline">{t('tabs.lumpsum')}</span>
                <span className="sm:hidden">LS</span>
              </TabsTrigger>
              <TabsTrigger value="retire" className="rounded-2xl tab-enhanced text-xs sm:text-sm px-2 sm:px-3">
                <HandCoins className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 icon-hover" />
                <span className="hidden sm:inline">{t('tabs.retirement')}</span>
                <span className="sm:hidden">Ret</span>
              </TabsTrigger>
              <TabsTrigger value="cagr" className="rounded-2xl tab-enhanced text-xs sm:text-sm px-2 sm:px-3">
                <LineChartIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 icon-hover" />
                <span className="hidden sm:inline">{t('tabs.cagr')}</span>
                <span className="sm:hidden">{t('tabs.cagr')}</span>
              </TabsTrigger>
              <TabsTrigger value="alloc" className="rounded-2xl tab-enhanced text-xs sm:text-sm px-2 sm:px-3">
                <PieChart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 icon-hover" />
                <span className="hidden sm:inline">{t('tabs.allocation')}</span>
                <span className="sm:hidden">Alloc</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="rounded-2xl tab-enhanced text-xs sm:text-sm px-2 sm:px-3">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 icon-hover" />
                <span className="hidden sm:inline">{t('tabs.advanced')}</span>
                <span className="sm:hidden">Adv</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* SIP */}
          <TabsContent value="sip" className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            <Card className="lg:col-span-2 rounded-2xl card-enhanced glass animate-slide-in-left">
              <CardHeader>
                <CardTitle className="text-gradient text-lg sm:text-xl">{t('sip.title')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:gap-4">
                <Field label={`${t('sip.monthlyInvestment')} (${s})`}>
                  <Input type="number" value={sip.monthly} onChange={(e) => setSip({ ...sip, monthly: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={t('sip.expectedReturn')} hint={t('sip.hint')}>
                  <Input type="number" step="0.1" value={sip.annualReturn} onChange={(e) => setSip({ ...sip, annualReturn: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={t('sip.investmentHorizon')}>
                  <Input type="number" step="1" value={sip.years} onChange={(e) => setSip({ ...sip, years: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 rounded-2xl card-enhanced glass animate-slide-in-right">
              <CardHeader>
                <CardTitle className="text-gradient text-lg sm:text-xl">{t('sip.projectedGrowth')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:gap-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  <Metric label={t('sip.futureValue')} value={formatMoney(sipFV)} />
                  <Metric label={t('sip.totalInvested')} value={formatMoney(sip.monthly * Math.round(sip.years * 12))} />
                  <Metric label={t('sip.wealthGain')} value={formatMoney(Math.max(0, sipFV - sip.monthly * Math.round(sip.years * 12)))} />
                  <Metric label={t('common.years')} value={`${sip.years}`} />
                </div>
                <div className="h-64 sm:h-72 lg:h-80 chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sipData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="v1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="v2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip
                        formatter={(v) => formatMoney(v)}
                        labelFormatter={(l) => `Year ${l}`}
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '12px'
                        }}
                      />
                      <Area type="monotone" dataKey="invested" name="Invested" stroke="#60a5fa" fillOpacity={1} fill="url(#v1)" />
                      <Area type="monotone" dataKey="value" name="Value" stroke="#34d399" fillOpacity={1} fill="url(#v2)" />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lump Sum */}
          <TabsContent value="lumpsum" className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            <Card className="lg:col-span-2 rounded-2xl card-enhanced glass animate-slide-in-right">
              <CardHeader>
                <CardTitle className="text-gradient text-lg sm:text-xl">{t('lumpsum.title')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:gap-4">
                <Field label={`${t('lumpsum.principal')} (${s})`}>
                  <Input type="number" value={ls.principal} onChange={(e) => setLs({ ...ls, principal: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={t('lumpsum.expectedReturn')}>
                  <Input type="number" step="0.1" value={ls.annualReturn} onChange={(e) => setLs({ ...ls, annualReturn: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={t('common.years')}>
                  <Input type="number" step="1" value={ls.years} onChange={(e) => setLs({ ...ls, years: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 rounded-2xl card-enhanced glass animate-slide-in-left">
              <CardHeader>
                <CardTitle className="text-gradient text-lg sm:text-xl">{t('lumpsum.projection')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:gap-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                  <Metric label={t('sip.futureValue')} value={formatMoney(lsFV)} />
                  <Metric label={t('lumpsum.principal')} value={formatMoney(ls.principal)} />
                  <Metric label={t('sip.wealthGain')} value={formatMoney(Math.max(0, lsFV - ls.principal))} />
                  <Metric label={t('common.years')} value={`${ls.years}`} />
                </div>
                <div className="h-64 sm:h-72 lg:h-80 chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lsData} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip
                        formatter={(v) => formatMoney(v)}
                        labelFormatter={(l) => `Year ${l}`}
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '12px'
                        }}
                      />
                      <Line type="monotone" dataKey="value" name="Value" stroke="#38bdf8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Retirement */}
          <TabsContent value="retire" className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            <Card className="lg:col-span-2 rounded-2xl card-enhanced glass animate-slide-in-left">
              <CardHeader>
                <CardTitle className="text-gradient text-lg sm:text-xl">{t('retirement.title')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:gap-4">
                <Field label={`${t('retirement.monthlyExpense')} (${s})`}>
                  <Input type="number" value={ret.expenseMonthly} onChange={(e) => setRet({ ...ret, expenseMonthly: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={t('retirement.inflation')}>
                  <Input type="number" step="0.1" value={ret.inflation} onChange={(e) => setRet({ ...ret, inflation: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={t('retirement.yearsToRetirement')}>
                  <Input type="number" value={ret.yearsToRetire} onChange={(e) => setRet({ ...ret, yearsToRetire: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={t('retirement.yearsInRetirement')}>
                  <Input type="number" value={ret.yearsInRetirement} onChange={(e) => setRet({ ...ret, yearsInRetirement: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={t('retirement.postRetirementReturn')}>
                  <Input type="number" step="0.1" value={ret.postRetReturn} onChange={(e) => setRet({ ...ret, postRetReturn: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={t('retirement.safeWithdrawalRate')} hint={t('retirement.swrHint')}>
                  <Input type="number" step="0.1" value={ret.swr} onChange={(e) => setRet({ ...ret, swr: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 rounded-2xl card-enhanced glass animate-slide-in-right">
              <CardHeader>
                <CardTitle className="text-gradient text-lg sm:text-xl">{t('retirement.requiredCorpus')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  <Metric label={t('retirement.annualExpenseAtRetirement')} value={formatMoney(retSWR.annualExpenseAtRetire)} sub={`After ${ret.yearsToRetire} ${t('common.years')}`} />
                  <Metric label={t('retirement.corpusSWR')} value={formatMoney(retSWR.corpus)} sub={`${ret.swr}% rule`} />
                  <Metric label={t('retirement.corpusFinite', { years: ret.yearsInRetirement })} value={formatMoney(retFinite.corpus)} sub={t('retirement.realReturn', { rate: (retFinite.realRate * 100).toFixed(2) })} />
                </div>
                <div className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                  <p>{t('retirement.methodsNote')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CAGR */}
          <TabsContent value="cagr" className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            <Card className="lg:col-span-2 rounded-2xl card-enhanced glass animate-slide-in-right">
              <CardHeader>
                <CardTitle className="text-gradient text-lg sm:text-xl">{t('cagr.title')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:gap-4">
                <Field label={`${t('cagr.initialValue')} (${s})`}>
                  <Input type="number" value={cagr.initial} onChange={(e) => setCagr({ ...cagr, initial: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={`${t('cagr.finalValue')} (${s})`}>
                  <Input type="number" value={cagr.final} onChange={(e) => setCagr({ ...cagr, final: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
                <Field label={t('common.years')}>
                  <Input type="number" value={cagr.years} onChange={(e) => setCagr({ ...cagr, years: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                </Field>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 rounded-2xl card-enhanced glass animate-slide-in-left">
              <CardHeader>
                <CardTitle className="text-gradient text-lg sm:text-xl">{t('cagr.result')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  <Metric label={t('tabs.cagr')} value={`${cagrPct.toFixed(2)}% p.a.`} />
                  <Metric label={t('cagr.growthMultiple')} value={`× ${(cagr.final / Math.max(1, cagr.initial)).toFixed(2)}`} />
                  <Metric label={t('cagr.duration')} value={`${cagr.years} ${t('common.years')}`} />
                </div>
                <div className="text-xs sm:text-sm text-gray-400 leading-relaxed">{t('cagr.note')}</div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Allocation */}
          <TabsContent value="alloc" className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
            <Card className="lg:col-span-2 rounded-2xl card-enhanced glass animate-slide-in-left">
              <CardHeader>
                <CardTitle className="text-gradient text-lg sm:text-xl">{t('allocation.title')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:gap-4">
                <Field label={t('allocation.age')}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Slider value={[age]} min={18} max={80} step={1} onValueChange={([v]) => setAge(v)} className="w-full slider" />
                    <div className="w-12 sm:w-14 text-right text-sm sm:text-base font-medium">{age}</div>
                  </div>
                </Field>
                <Field label={t('allocation.rule')}>
                  <Select value={rule} onValueChange={setRule}>
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="110-age">110 − age</SelectItem>
                      <SelectItem value="100-age">100 − age</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2">
                  <Metric label={t('allocation.equity')} value={`${alloc.equity}%`} />
                  <Metric label={t('allocation.debt')} value={`${alloc.debt}%`} />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3 rounded-2xl card-enhanced glass animate-slide-in-right">
              <CardHeader>
                <CardTitle className="text-gradient text-lg sm:text-xl">{t('allocation.visual')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 sm:h-72 lg:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{ name: "Portfolio", Equity: alloc.equity, Debt: alloc.debt }]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip
                        formatter={(v) => `${v}%`}
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: '#ffffff',
                          fontSize: '12px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="Equity" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="Debt" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs sm:text-sm text-gray-400 mt-3 leading-relaxed">{t('allocation.note')}</div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Advanced */}
          <TabsContent value="advanced" className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
            {/* Tax Modelling Section */}
            <div className="xl:col-span-5 grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              <Card className="lg:col-span-2 rounded-2xl card-enhanced glass animate-slide-in-right">
                <CardHeader>
                  <CardTitle className="text-gradient text-lg sm:text-xl">{t('advanced.taxModelling.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:gap-4">
                  <Field label={`${t('advanced.taxModelling.ltcgEquities')} (${s})`}>
                    <Input type="number" value={taxInputs.ltcgGain} onChange={(e) => setTaxInputs({ ...taxInputs, ltcgGain: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                  </Field>
                  <Field label={`${t('advanced.taxModelling.stcgEquities')} (${s})`}>
                    <Input type="number" value={taxInputs.stcgGain} onChange={(e) => setTaxInputs({ ...taxInputs, stcgGain: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                  </Field>
                  <Field label={`${t('advanced.taxModelling.otherIncome')} (${s})`}>
                    <Input type="number" value={taxInputs.otherIncome} onChange={(e) => setTaxInputs({ ...taxInputs, otherIncome: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                  </Field>
                  <Field label={`${t('advanced.taxModelling.investments80C')} (${s})`} hint={`${t('advanced.taxModelling.max80C')} ${formatMoney(150000)}`}>
                    <Input type="number" value={taxInputs.investments80C} onChange={(e) => setTaxInputs({ ...taxInputs, investments80C: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                  </Field>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 rounded-2xl card-enhanced glass animate-slide-in-left">
                <CardHeader>
                  <CardTitle className="text-gradient text-lg sm:text-xl">{t('advanced.taxModelling.estimate')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    <Metric label={t('advanced.taxModelling.ltcgTaxable')} value={formatMoney(taxResult.ltcgTaxable)} />
                    <Metric label={t('advanced.taxModelling.ltcgTax')} value={formatMoney(taxResult.ltcgTax)} />
                    <Metric label={t('advanced.taxModelling.stcgTax')} value={formatMoney(taxResult.stcgTax)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <Metric label={t('advanced.taxModelling.eligible80C')} value={formatMoney(taxResult.eligible80C)} />
                    <Metric label={t('advanced.taxModelling.taxableAfter80C')} value={formatMoney(taxResult.taxableAfter80C)} />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 leading-relaxed">{t('advanced.taxModelling.disclaimer')}</div>
                </CardContent>
              </Card>
            </div>

            {/* XIRR Section */}
            <div className="xl:col-span-5 grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              <Card className="lg:col-span-2 rounded-2xl card-enhanced glass animate-slide-in-left">
                <CardHeader>
                  <CardTitle className="text-gradient text-lg sm:text-xl">{t('advanced.xirr.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:gap-4">
                  <div className="grid gap-2">
                    {xirrFlows.map((f, i) => (
                      <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <Input type="date" value={f.date} onChange={(e) => setXirrFlows(xirrFlows.map((s, j) => (j === i ? { ...s, date: e.target.value } : s)))} className="text-sm sm:text-base" />
                        <Input type="text" value={f.amount} onChange={(e) => setXirrFlows(xirrFlows.map((s, j) => (j === i ? { ...s, amount: num(e.target.value) } : s)))} className="text-sm sm:text-base" />
                        <Button variant="ghost" onClick={() => setXirrFlows(xirrFlows.filter((_, j) => j !== i))} className="text-xs sm:text-sm">{t('advanced.xirr.remove')}</Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button onClick={() => setXirrFlows([...xirrFlows, { date: new Date().toISOString().slice(0, 10), amount: 0 }])} className="text-sm sm:text-base">{t('advanced.xirr.addRow')}</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 rounded-2xl card-enhanced glass animate-slide-in-right">
                <CardHeader>
                  <CardTitle className="text-gradient text-lg sm:text-xl">{t('advanced.xirr.result')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:gap-4">
                  <Metric label="XIRR" value={isFinite(xirrValue) ? `${(xirrValue * 100).toFixed(2)}%` : "—"} />
                  <div className="text-xs sm:text-sm text-gray-400 leading-relaxed">{t('advanced.xirr.description')}</div>
                </CardContent>
              </Card>
            </div>

            {/* Goal-based SIP Section */}
            <div className="xl:col-span-5 grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              <Card className="lg:col-span-2 rounded-2xl card-enhanced glass animate-slide-in-right">
                <CardHeader>
                  <CardTitle className="text-gradient text-lg sm:text-xl">{t('advanced.goalSip.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:gap-4">
                  <Field label={`${t('advanced.goalSip.targetAmount')} (${s})`}>
                    <Input type="number" value={goal.target} onChange={(e) => setGoal({ ...goal, target: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                  </Field>
                  <Field label={t('advanced.goalSip.yearsToGoal')}>
                    <Input type="number" value={goal.years} onChange={(e) => setGoal({ ...goal, years: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                  </Field>
                  <Field label={t('advanced.goalSip.expectedReturn')}>
                    <Input type="number" step="0.1" value={goal.expectedReturn} onChange={(e) => setGoal({ ...goal, expectedReturn: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                  </Field>
                  <Field label={`${t('advanced.goalSip.existingCorpus')} (${s})`}>
                    <Input type="number" value={goal.existingCorpus} onChange={(e) => setGoal({ ...goal, existingCorpus: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                  </Field>
                  <Field label={`${t('advanced.goalSip.existingLumpsum')} (${s})`}>
                    <Input type="number" value={goal.lumpsum} onChange={(e) => setGoal({ ...goal, lumpsum: num(e.target.value) })} className="input-enhanced focus-enhanced text-sm sm:text-base" />
                  </Field>
                </CardContent>
              </Card>

              <Card className="lg:col-span-3 rounded-2xl card-enhanced glass animate-slide-in-left">
                <CardHeader>
                  <CardTitle className="text-gradient text-lg sm:text-xl">{t('advanced.goalSip.requiredSip')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <Metric label={t('advanced.goalSip.monthlySip')} value={formatMoney(Math.max(0, Math.round(requiredMonthly)))} />
                    <Metric label={t('advanced.goalSip.targetAfter')} value={`${goal.years} ${t('common.years')}`} />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400 leading-relaxed">{t('advanced.goalSip.note')}</div>
                </CardContent>
              </Card>
            </div>

          </TabsContent>
        </Tabs>

        <footer className="max-w-6xl mx-auto mt-6 sm:mt-8 lg:mt-10 text-xs sm:text-sm text-gray-400 leading-relaxed glass p-4 sm:p-6 rounded-2xl animate-fade-in-up animate-delay-500">
          <p><strong className="text-white">Disclaimer:</strong> This tool is for education and planning. It does not provide financial advice. Returns are assumptions, not guarantees. Taxes, fees, and product-specific rules (e.g., exact income tax slab computation, cess, surcharge, LTCG exemptions with indexation for non-equity assets) are simplified here. For precise tax filing and investment advice consult a licensed professional.</p>
        </footer>
      </motion.div>
    </div>
  );
}
