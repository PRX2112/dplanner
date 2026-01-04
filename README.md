# Investment Planning Web App

A comprehensive, responsive React-based investment planning application designed to help users make informed financial decisions. The app provides advanced calculators, visualizations, and planning tools for various investment scenarios with a modern, mobile-first design.

## 🚀 Features

### 📈 **SIP Calculator**
- **Monthly SIP Planning**: Calculate future value of Systematic Investment Plans
- **Growth Projections**: Visualize investment growth over time with interactive charts
- **Wealth Analysis**: Compare total invested amount vs. final value
- **Flexible Parameters**: Adjust monthly investment, expected returns, and time horizon
- **Real-time Calculations**: Instant updates as you modify inputs

### 💰 **Lump Sum Calculator**
- **One-time Investment Growth**: Calculate compound growth of lump sum investments
- **Time-based Projections**: See how your investment grows year by year
- **Visual Charts**: Line charts showing investment progression
- **Customizable Returns**: Set your expected annual return rate
- **Investment Analysis**: Track principal vs. wealth gain over time

### 🏖️ **Retirement Planner**
- **Dual Calculation Methods**:
  - **SWR (Safe Withdrawal Rate)**: Based on the classic 4% rule
  - **Finite Years Method**: For time-bound retirement spending
- **Inflation Adjustment**: Accounts for rising living costs
- **Expense Projection**: Calculate future monthly expenses at retirement
- **Corpus Requirements**: Determine how much you need to save
- **Real Return Analysis**: Shows inflation-adjusted returns

### 📊 **CAGR Calculator**
- **Compound Annual Growth Rate**: Calculate the annualized return rate
- **Growth Multiple**: See how much your investment has multiplied
- **Time Period Analysis**: Understand performance over specific durations
- **Investment Comparison**: Compare different investment performances
- **Smooth Compounding**: Assumes consistent annual returns

### ⚖️ **Asset Allocation**
- **Age-based Recommendations**: 
  - 110-age rule (aggressive)
  - 100-age rule (conservative)
- **Interactive Slider**: Adjust age to see allocation changes
- **Visual Bar Charts**: See equity vs. debt allocation percentages
- **Risk-based Planning**: Adapt allocation based on risk tolerance
- **Portfolio Visualization**: Clear representation of asset distribution

### 🧾 **Tax Modeling (India)**
- **Region Specific**: Dedicated Indian tax regime calculations
- **Capital Gains Tax**:
  - **LTCG (Long-term)**: 10% on gains above ₹1,00,000
  - **STCG (Short-term)**: 15% on equity gains
- **Section 80C Deductions**: Up to ₹1,50,000 tax savings
- **Taxable Income Calculation**: Shows impact of deductions
- **Simplified Tax Estimation**: Educational tool for tax planning


### 📈 **XIRR Calculator**
- **Irregular Cash Flows**: Handle investments with varying amounts and dates
- **Internal Rate of Return**: Calculate actual returns on complex investments
- **Dynamic Input Management**: Add/remove cash flow entries
- **Date-based Calculations**: Account for timing of investments
- **Real-world Scenarios**: Perfect for SIPs with varying amounts

### 🎯 **Goal-based SIP Planner**
- **Target Amount Planning**: Calculate SIP needed to reach specific goals
- **Existing Corpus Integration**: Factor in current investments
- **Lump Sum Addition**: Include one-time investments
- **Time-bound Goals**: Set specific timeframes for achievement
- **Monthly SIP Calculation**: Determine required monthly investment
- **Conservative Planning**: Adjust for realistic return expectations

## 🎨 **Design & User Experience**

### **Responsive Design**
- **Mobile-first Approach**: Optimized for all screen sizes
- **Progressive Enhancement**: Enhanced features on larger screens
- **Touch-friendly Interface**: Optimized for mobile interactions
- **Adaptive Layouts**: Cards stack on mobile, side-by-side on desktop

### **Visual Elements**
- **Interactive Charts**: Recharts-powered data visualizations
- **Glass Morphism**: Modern translucent card designs
- **Smooth Animations**: Framer Motion powered transitions
- **Gradient Backgrounds**: Dynamic animated backgrounds
- **Icon Integration**: Lucide React icons throughout

### **Accessibility**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Friendly**: Proper ARIA labels and semantic HTML
- **High Contrast**: Readable text and visual elements
- **Focus Management**: Clear focus indicators

### **Global Reach**
- **Multi-Currency Support**: 
  - Real-time switching between INR (₹), USD ($), EUR (€), GBP (£), JPY (¥), and AED.
  - Formatting adapted to selected locale (e.g., Lakhs/Crores for INR, standard millions for others).
  - Persists user preference across sessions.

- **Native Internationalization (i18n)**: 
  - **Powered by react-i18next**: Robust translation management.
  - **Supported Languages**: English, Hindi (हिंदी), and Gujarati (ગુજરાતી).
  - **Language Detector**: Automatically detects user's preferred language.
  - **Seamless Switching**: Instant language toggle without page reload.



## 🛠️ **Tech Stack**

### **Frontend Framework**
- **React 18**: Latest React with hooks and modern features
- **Vite**: Fast build tool and development server
- **JavaScript (ES6+)**: Modern JavaScript features

### **Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible, unstyled UI components
- **Custom CSS**: Advanced animations and effects
- **Responsive Design**: Mobile-first approach

### **Data Visualization**
- **Recharts**: React charting library
- **Interactive Charts**: Area, Line, and Bar charts
- **Responsive Charts**: Adapt to different screen sizes
- **Custom Styling**: Branded chart colors and themes

### **Animations & Interactions**
- **Framer Motion**: Smooth page transitions and animations
- **CSS Animations**: Keyframe animations for enhanced UX
- **Hover Effects**: Interactive element feedback
- **Loading States**: Smooth loading animations

### **Icons & Assets**
- **Lucide React**: Beautiful, customizable icons
- **Custom Favicon**: Branded application icon
- **Optimized Images**: Web-optimized assets

## 📦 **Installation & Setup**

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn package manager

### **Installation Steps**

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd investment-planner
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Access the Application**
   - Open your browser
   - Navigate to `http://localhost:5173`
   - The app will automatically reload on file changes

### **Build for Production**
```bash
npm run build
# or
yarn build
```

## 📁 **Project Structure**

```
investment-planner/
├── public/
│   ├── favicon.png          # Application favicon
│   └── vite.svg            # Vite logo
├── src/
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── button.jsx  # Custom button component
│   │   │   ├── card.jsx    # Card layout component
│   │   │   ├── input.jsx   # Form input component
│   │   │   ├── label.jsx   # Form label component
│   │   │   ├── select.jsx  # Dropdown select component
│   │   │   ├── slider.jsx  # Range slider component
│   │   │   └── tabs.jsx    # Tab navigation component
│   │   └── InvestmentPlanner.jsx # Main application component
│   ├── lib/
│   │   └── utils.js        # Utility functions and helpers
│   ├── assets/
│   │   └── react.svg       # React logo
│   ├── App.jsx             # Root application component
│   ├── App.css             # Global styles and animations
│   ├── main.jsx            # Application entry point
│   └── index.css           # Tailwind CSS imports
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
└── README.md               # Project documentation
```

## 🎯 **Detailed Usage Guide**

### **1. SIP Calculator**
- **Input Fields**:
  - Monthly Investment: Enter your SIP amount (₹)
  - Expected Annual Return: Set expected return percentage
  - Investment Horizon: Number of years for investment
- **Output**:
  - Future Value: Total corpus at maturity
  - Total Invested: Sum of all SIP payments
  - Wealth Gain: Profit from investment
  - Interactive Chart: Visual growth projection

### **2. Lump Sum Calculator**
- **Input Fields**:
  - Principal Amount: Initial investment (₹)
  - Expected Annual Return: Expected return percentage
  - Investment Period: Number of years
- **Output**:
  - Future Value: Final investment value
  - Wealth Gain: Profit from investment
  - Line Chart: Year-by-year growth visualization

### **3. Retirement Planner**
- **Input Fields**:
  - Current Monthly Expenses: Current living costs (₹)
  - Inflation Rate: Expected inflation percentage
  - Years to Retirement: Time until retirement
  - Years in Retirement: Expected retirement duration
  - Post-retirement Return: Expected return during retirement
  - Safe Withdrawal Rate: Annual withdrawal percentage (default 4%)
- **Output**:
  - Annual Expenses at Retirement: Inflation-adjusted expenses
  - Required Corpus: Total amount needed for retirement
  - Two Methods: SWR rule and finite years calculation

### **4. CAGR Calculator**
- **Input Fields**:
  - Initial Value: Starting investment amount (₹)
  - Final Value: Ending investment value (₹)
  - Time Period: Number of years
- **Output**:
  - CAGR Percentage: Annualized return rate
  - Growth Multiple: How much the investment multiplied
  - Performance Analysis: Investment performance summary

### **5. Asset Allocation**
- **Input Fields**:
  - Age: Your current age (slider control)
  - Allocation Rule: Choose between 110-age or 100-age rule
- **Output**:
  - Equity Percentage: Recommended equity allocation
  - Debt Percentage: Recommended debt allocation
  - Bar Chart: Visual allocation representation

### **6. Tax Modeling (India)**
- **Input Fields**:
  - LTCG on Equities: Long-term capital gains (₹)
  - STCG on Equities: Short-term capital gains (₹)
  - Other Income: Salary, interest income (₹)
  - 80C Investments: Tax-saving investments (₹)
- **Output**:
  - Taxable LTCG: LTCG after exemption
  - LTCG Tax: Tax on long-term gains
  - STCG Tax: Tax on short-term gains
  - 80C Deduction: Tax savings from 80C
  - Net Taxable Income: Income after deductions

### **7. XIRR Calculator**
- **Input Fields**:
  - Date: Investment/withdrawal date
  - Amount: Investment amount (negative for outflows, positive for inflows)
  - Dynamic Rows: Add/remove cash flow entries
- **Output**:
  - XIRR Percentage: Internal rate of return
  - Cash Flow Analysis: Investment performance summary

### **8. Goal-based SIP Planner**
- **Input Fields**:
  - Target Amount: Financial goal amount (₹)
  - Years to Goal: Time to achieve the goal
  - Expected Annual Return: Expected return percentage
  - Existing Corpus: Current investment value (₹)
  - Lump Sum Addition: One-time investment (₹)
- **Output**:
  - Required Monthly SIP: Monthly investment needed
  - Goal Timeline: Time to achieve the target

## 🔧 **Advanced Features**

### **Responsive Design**
- **Breakpoints**: Optimized for mobile (320px), tablet (768px), laptop (1024px), desktop (1280px+)
- **Adaptive Layouts**: Cards stack on mobile, side-by-side on desktop
- **Touch Optimization**: Mobile-friendly interactions and gestures
- **Performance**: Optimized for all device types

### **Animations & Effects**
- **Page Transitions**: Smooth fade-in animations
- **Card Animations**: Hover effects and slide-in animations
- **Loading States**: Skeleton loading and smooth transitions
- **Interactive Elements**: Button hover effects and icon animations

### **Analytics**
- **Visitor Counter**: Tracks total and unique daily visitors.
- **Privacy Focused**: Uses local storage for unique visitor tracking without external cookies.
- **Visual Counters**: Animated counter display for engagement.

### **Data Visualization**
- **Interactive Charts**: Hover tooltips and responsive scaling
- **Multiple Chart Types**: Area, Line, and Bar charts
- **Custom Styling**: Branded colors and themes
- **Responsive Charts**: Adapt to container size

## ⚠️ **Important Disclaimers**

### **Educational Purpose Only**
This application is designed for educational and planning purposes only. It does not provide financial advice, investment recommendations, or guarantee returns.

### **Return Assumptions**
- All return calculations are based on assumptions
- Past performance does not guarantee future results
- Market conditions can significantly impact actual returns
- Consider multiple scenarios and conservative estimates

### **Tax Calculations**
- Tax calculations are simplified and educational
- Based on current Indian tax laws (as of 2024)
- Does not include all tax provisions, cess, or surcharge
- Consult a tax professional for accurate tax planning

### **Investment Risks**
- All investments carry risk
- Diversification is important for risk management
- Consider your risk tolerance and financial situation
- Consult a financial advisor for personalized advice

### **Data Accuracy**
- Calculations are based on mathematical formulas
- Real-world factors may affect actual results
- Use multiple tools and professional advice for important decisions

## 🤝 **Contributing**

We welcome contributions to improve this project! Please feel free to:
- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 **License**

This project is open source and available under the MIT License. You are free to use, modify, and distribute this software for personal and commercial purposes.

## 🙏 **Acknowledgments**

- **React Team**: For the amazing React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **Recharts**: For the beautiful charting library
- **Framer Motion**: For smooth animations
- **Radix UI**: For accessible UI components
- **Lucide**: For the beautiful icon set

---

**Happy Investing! 📈💰**