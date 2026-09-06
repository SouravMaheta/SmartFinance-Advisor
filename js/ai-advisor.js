/**
 * AI Financial Advisor Engine
 * Generates personalized, step-by-step financial roadmaps.
 * Includes a built-in intelligent rule-based expert engine + optional Gemini API integration.
 */

class AIAdvisor {
  /**
   * Generates a 3-Phase Financial Blueprint
   */
  static generateReport(data, budgetAnalysis, runwayAnalysis, debtAnalysis, healthScore, portfolioAnalysis = {}, currencySymbol = '$') {
    const { income, expenses, debts, savings, goal } = data;
    const { actual, recommended, isOverBudget } = budgetAnalysis;

    // Detect specific vulnerabilities
    const hasHighInterestDebt = (debts || []).some(d => Number(d.apr) >= 15);
    const totalDebt = (debts || []).reduce((sum, d) => sum + (Number(d.balance) || 0), 0);
    const wantsOverLimit = actual.wantsPct > 35;
    const needsOverLimit = actual.needsPct > 55;
    const lowRunway = runwayAnalysis.months < 3;

    // Build Tactical Insights
    const executiveSummary = this._buildExecutiveSummary({
      income,
      actual,
      isOverBudget,
      lowRunway,
      runwayAnalysis,
      totalDebt,
      portfolioAnalysis,
      goal,
      healthScore,
      currencySymbol
    });

    const phase1 = this._buildPhase1({
      actual,
      recommended,
      savings,
      lowRunway,
      runwayAnalysis,
      portfolioAnalysis,
      currencySymbol,
      wantsOverLimit
    });

    const phase2 = this._buildPhase2({
      debtAnalysis,
      totalDebt,
      hasHighInterestDebt,
      portfolioAnalysis,
      actual,
      currencySymbol,
      goal
    });

    const phase3 = this._buildPhase3({
      goal,
      runwayAnalysis,
      portfolioAnalysis,
      totalDebt,
      actual,
      currencySymbol
    });

    return {
      executiveSummary,
      phase1,
      phase2,
      phase3,
      keyMetrics: {
        score: healthScore.score,
        grade: healthScore.grade,
        runwayMonths: runwayAnalysis.months,
        monthlySurplus: actual.savings,
        debtFreeMonths: debtAnalysis.hasDebt ? debtAnalysis.avalanche.months : 0,
        interestSaved: debtAnalysis.hasDebt ? debtAnalysis.interestSaved : 0,
        netWorth: portfolioAnalysis.netWorth || 0,
        totalInvested: portfolioAnalysis.totalInvested || 0
      }
    };
  }

  static _buildExecutiveSummary({ income, actual, isOverBudget, lowRunway, runwayAnalysis, totalDebt, portfolioAnalysis, goal, healthScore, currencySymbol }) {
    let summary = '';
    const totalInvested = portfolioAnalysis?.totalInvested || 0;
    const netWorth = portfolioAnalysis?.netWorth || 0;

    if (isOverBudget) {
      summary = `⚠️ **Critical Cashflow Notice:** Your current monthly commitments exceed your monthly take-home income by **${currencySymbol}${actual.deficit.toLocaleString()}**. Our immediate priority is sealing cash leaks and restructuring fixed obligations to eliminate reliance on credit.`;
    } else if (lowRunway && totalDebt > 0) {
      summary = `⚡ **Dual Focus Strategy:** You currently have **${currencySymbol}${actual.savings.toLocaleString()}/month** in available cashflow, but an emergency reserve of only **${runwayAnalysis?.months || 0} months**. We must balance rapid starter-emergency savings with an aggressive debt payoff strategy to avoid falling back into debt.`;
    } else if (totalDebt === 0 && totalInvested > 0) {
      summary = `🚀 **Wealth Accelerator Mode:** You are 100% debt-free with **${currencySymbol}${totalInvested.toLocaleString()}** already working for you in investments and an estimated Net Worth of **${currencySymbol}${netWorth.toLocaleString()}**. Your primary opportunity is optimizing tax efficiency and scaling automated monthly compounding toward *${goal}*.`;
    } else if (totalDebt === 0) {
      summary = `🚀 **Debt-Free Launchpad:** You have zero high-interest liabilities and a cash surplus of **${currencySymbol}${actual.savings.toLocaleString()}/month**. Now is the prime moment to turn your monthly surplus into market-beating index funds and compound growth toward *${goal}*.`;
    } else {
      summary = `✅ **Balanced Foundation:** With a health score of **${healthScore.score}/100 (${healthScore.grade})** and an estimated Net Worth of **${currencySymbol}${netWorth.toLocaleString()}**, you have solid groundwork. With systematic execution, you can eliminate your **${currencySymbol}${totalDebt.toLocaleString()}** in debt while maintaining your investment trajectory.`;
    }

    return summary;
  }

  static _buildPhase1({ actual, recommended, savings, lowRunway, runwayAnalysis, currencySymbol, wantsOverLimit }) {
    const actions = [];

    // Starter Emergency Stash
    if (runwayAnalysis.months < 1) {
      actions.push({
        title: `Establish Starter Emergency Buffer (${currencySymbol}${Math.min(1000, recommended.needs).toLocaleString()})`,
        detail: `Before aggressively attacking debt or investments, immediately accumulate a mini emergency cushion in a liquid high-yield cash account. This prevents having to put car repairs or medical bills on credit cards.`,
        urgency: 'Immediate (Days 1–15)'
      });
    }

    // Cash Leak Plug
    if (wantsOverLimit) {
      const excessWants = Math.max(0, actual.wants - recommended.wants);
      actions.push({
        title: `Audit Discretionary Subscriptions & Dining (Save ~${currencySymbol}${excessWants.toLocaleString()}/mo)`,
        detail: `Your lifestyle & non-essential spending is currently at ${actual.wantsPct}% of income (ideal is 30%). Trimming unused subscriptions and dining out unlocks immediate capital.`,
        urgency: 'Week 1'
      });
    }

    // High-Yield Account Switch
    actions.push({
      title: `Move Liquid Savings to a High-Yield Account (4.5%+ APY)`,
      detail: `Leaving emergency cash in traditional checking earns virtually 0% APY. A federally insured High-Yield Savings Account multiplies your cash yield with zero market risk.`,
      urgency: 'Week 2'
    });

    return {
      title: 'Phase 1: Days 1 – 30 (Defense & Cashflow Optimization)',
      badge: 'Immediate Action',
      description: 'Plug budget leaks, stabilize cash reserves, and stop high-interest bleeding.',
      actions
    };
  }

  static _buildPhase2({ debtAnalysis, totalDebt, hasHighInterestDebt, portfolioAnalysis, actual, currencySymbol, goal }) {
    const actions = [];

    if (debtAnalysis.hasDebt) {
      actions.push({
        title: `Deploy Accelerated Debt Avalanche Strategy`,
        detail: `Pay minimums across all accounts, but direct every spare penny (${currencySymbol}${debtAnalysis.totalBudget.toLocaleString()}/mo total) to your highest-APR debt. This strategy saves you approximately **${currencySymbol}${debtAnalysis.interestSaved.toLocaleString()}** in interest and makes you debt-free **${debtAnalysis.monthsFaster} months faster**.`,
        urgency: 'Month 2 Onwards'
      });

      if (hasHighInterestDebt && (portfolioAnalysis?.stocks > 0 || portfolioAnalysis?.marketEquities > 0)) {
        actions.push({
          title: `Rebalance High-Interest Debt vs. Stock Holdings`,
          detail: `You carry debt with APR >15% alongside invested equities. Paying off a 22% credit card APR delivers a **guaranteed risk-free 22% return**, which outperforms average stock market returns with zero downside risk.`,
          urgency: 'Strategic Review'
        });
      } else if (hasHighInterestDebt) {
        actions.push({
          title: `Explore Debt Consolidation / 0% APR Balance Transfer`,
          detail: `If credit card APRs are above 20%, consolidating into a fixed single-digit loan can instantly reduce monthly finance charges and accelerate your payoff timeline.`,
          urgency: 'Month 2'
        });
      }
    } else {
      actions.push({
        title: `Automate Core Savings & Investment Transfers`,
        detail: `Set up automatic recurring bank transfers on payday. Funnel ${currencySymbol}${actual.savings.toLocaleString()}/month automatically toward your target of ${goal}.`,
        urgency: 'Month 2'
      });
    }

    return {
      title: 'Phase 2: Months 2 – 6 (Momentum & Debt Elimination)',
      badge: 'Execution',
      description: 'Execute systematic debt reduction and automate consistent financial habits.',
      actions
    };
  }

  static _buildPhase3({ goal, runwayAnalysis, portfolioAnalysis, totalDebt, actual, currencySymbol }) {
    const actions = [];

    actions.push({
      title: `Scale Emergency Fund to 6 Full Months (${currencySymbol}${runwayAnalysis.target6Months.toLocaleString()})`,
      detail: `Expand your liquid buffer until it covers 6 months of essential living costs. This gives you peace of mind to weather any economic storm without panic-selling market assets.`,
      urgency: 'Months 6–12'
    });

    if (portfolioAnalysis?.totalInvested > 0) {
      actions.push({
        title: `Systematic SIP Step-Up & Broad-Market Indexing`,
        detail: `With ${currencySymbol}${portfolioAnalysis.totalInvested.toLocaleString()} already invested, increase your recurring monthly investments by 10% each year (SIP Step-up). Ensure low-cost index funds and broad ETFs form at least 70% of your equity core to minimize single-stock volatility.`,
        urgency: 'Year 1 & Long Term'
      });
    } else {
      actions.push({
        title: `Launch Automated Index Fund & Mutual Fund SIP`,
        detail: `Once high-interest debt is conquered and emergency funds are locked, launch an automated recurring SIP into diversified, low-cost broad market index funds (e.g., S&P 500 or Nifty 50) to build compounding wealth.`,
        urgency: 'Year 1 & Long Term'
      });
    }

    return {
      title: 'Phase 3: Year 1 & Beyond (Wealth Building & Compounding)',
      badge: 'Long-Term Growth',
      description: 'Leverage compound interest, mutual fund SIPs, and tax-advantaged investing to reach financial freedom.',
      actions
    };
  }

  /**
   * Optional Gemini API real-time custom analysis
   * Can be hooked with a Gemini API key
   */
  static async requestGeminiAdvice(apiKey, userData, calculationSummary) {
    if (!apiKey) return null;

    const prompt = `You are a high-level personal financial planning expert.
Analyze the following user financial profile:
- Monthly Income: ${userData.currency}${userData.income}
- Monthly Needs: ${userData.currency}${calculationSummary.budget.actual.needs} (${calculationSummary.budget.actual.needsPct}%)
- Monthly Wants: ${userData.currency}${calculationSummary.budget.actual.wants} (${calculationSummary.budget.actual.wantsPct}%)
- Monthly Savings/Surplus: ${userData.currency}${calculationSummary.budget.actual.savings} (${calculationSummary.budget.actual.savingsPct}%)
- Total Debt: ${userData.currency}${calculationSummary.debt.totalBalance}
- Emergency Runway: ${calculationSummary.runway.months} months
- Primary Goal: ${userData.goal}

Provide 3 concise, punchy, hyper-actionable tips in JSON format:
{
  "quickWin": "One immediate 5-minute action today",
  "smartMove": "Strategic optimization for this specific situation",
  "motivationalTakeaway": "Inspiring perspective based on their numbers"
}`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) return null;
      const resData = await response.json();
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ? JSON.parse(text) : null;
    } catch (err) {
      console.warn('Gemini API call skipped, using local expert engine:', err);
      return null;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIAdvisor;
}
