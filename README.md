# ⚡ SmartFinance.AI - AI Personal Finance Advisor Website

A modern, high-converting, 100% free-to-use AI Personal Finance Advisor web application. It delivers personalized 50/30/20 budget allocations, debt snowball/avalanche payoff simulations, emergency runway health metrics, and customized 3-phase wealth roadmaps.

---

## 🚀 Quickstart (How to Run Locally)

### Option 1: Run with Live Stock Market Quotes (Recommended)
Open PowerShell or Command Prompt, navigate to `D:\AIFinanceAdvisor`, and run:
```powershell
python server.py
```
Then visit: `http://localhost:8000` in your web browser.
*Note: `server.py` uses the standard Python library (zero installation required) and automatically proxies real-time exchange quotes from the National Stock Exchange (NSE India) and NASDAQ!*

### Option 2: Direct in Browser (Offline / Fallback Mode)
Double-click `D:\AIFinanceAdvisor\index.html` to open directly in Chrome, Edge, or Brave. In this mode, stock quotes use realistic simulated live pricing without needing any server.

---

## 💰 How This Website Makes Money (When Users Pay $0)

The site is configured with **Contextual Financial Affiliate Cards** and ad slots. Whenever a visitor uses your free tool and clicks one of your partner recommendations, you earn a commission:

| Partner Category | Example Programs | Typical Commission | Payout Method to India |
| :--- | :--- | :--- | :--- |
| **High-Yield Savings (HYSA)** | Marcus by Goldman Sachs, SoFi, Ally | **$50 – $100** per funded account | Direct Wire / NEFT via Impact.com |
| **Debt Refinance / Loans** | Upstart, LendingTree, Credible | **$75 – $150** per approved lead | Direct Wire / NEFT via CJ Affiliate |
| **Free Budgeting Apps** | Rocket Money, Monarch, Empower | **$10 – $25** per free signup | Direct Wire / PayPal |
| **Zero-Fee Brokerages** | Robinhood, Webull, M1 Finance | **$30 – $100** per account | Direct Wire / Payoneer |

### How to Update Your Affiliate Links:
Open `D:\AIFinanceAdvisor\affiliates-config.json` and replace the placeholder `affiliateUrl` links with your real referral links:
```json
{
  "id": "hysa_savings",
  "category": "High-Yield Savings",
  "title": "High-Yield Cash Reserve (4.5% - 5.1% APY)",
  "affiliateUrl": "https://your-actual-affiliate-link-here.com",
  ...
}
```

---

## 🌐 How to Deploy This Website Online for FREE

You can host this website with 99.99% uptime and global CDN speed for **$0/month**:

### 1. Vercel (Easiest & Fastest)
1. Sign up at [vercel.com](https://vercel.com) (Free tier).
2. Install Vercel CLI or connect your GitHub repository.
3. Simply drag and drop the `D:\AIFinanceAdvisor` folder or run:
   ```bash
   npm i -g vercel
   vercel
   ```
4. You will get a free live URL (e.g. `https://smartfinance-ai.vercel.app`).

### 2. Netlify
1. Sign up at [netlify.com](https://netlify.com).
2. Drag and drop the `D:\AIFinanceAdvisor` folder into the Netlify dashboard.
3. Your website is instantly live globally.

### 3. Custom Domain (Optional ~₹800/year)
Buy a domain like `smartfinanceai.com` or `aifinanceadvisor.in` from Namecheap, Porkbun, or Hostinger and connect it to your Vercel or Netlify site with 1 click.

---

## 🛠️ Project Structure

```
D:\AIFinanceAdvisor\
├── index.html              # Core application layout, wizard form, and results dashboard
├── affiliates-config.json  # Central configuration for monetization partner links
├── server.py               # Built-in lightweight server with real-time stock quote proxy
├── api\
│   └── quote.js            # Vercel / Netlify serverless endpoint for live exchange quotes
├── css\
│   └── styles.css          # Light theme fintech styling, animations, and PDF print theme
├── js\
│   ├── finance-engine.js   # 50/30/20 math, Debt Snowball/Avalanche simulator, Runway metrics
│   ├── charts.js           # Chart.js visualization wrappers
│   ├── stock-tracker.js    # Zero-OTP live stock quote engine, P&L math, and localStorage sync
│   ├── ai-advisor.js       # 3-Phase tactical roadmap synthesizer
│   └── app.js              # Application state coordinator, wizard steps, currency toggling
└── README.md               # Documentation & monetization guide
```

---

## ⚖️ Legal & Compliance
The site includes a mandatory SEC/FINRA educational disclaimer in the footer to ensure 100% compliance:
> *"SmartFinance.AI is an automated financial budgeting and educational simulation tool. It does not provide certified financial, legal, investment, or tax advice."*
