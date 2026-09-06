/**
 * AI Finance Engine
 * Handles financial calculations: 50/30/20 budget analysis, Emergency Runway,
 * Snowball vs. Avalanche Debt payoff, and Financial Health Scoring.
 */

class FinanceEngine {
  /**
   * Evaluates budget breakdown against the 50/30/20 standard
   */
  static analyzeBudget(income, expenses) {
    const totalIncome = Math.max(0, Number(income) || 0);

    const needs = (Number(expenses.housing) || 0) +
                  (Number(expenses.utilities) || 0) +
                  (Number(expenses.groceries) || 0) +
                  (Number(expenses.transport) || 0) +
                  (Number(expenses.minDebtPayments) || 0);

    const wants = (Number(expenses.dining) || 0) +
                  (Number(expenses.entertainment) || 0) +
                  (Number(expenses.subscriptions) || 0) +
                  (Number(expenses.otherWants) || 0);

    const currentExpenses = needs + wants;
    const currentSavings = Math.max(0, totalIncome - currentExpenses);
    const deficit = currentExpenses > totalIncome ? currentExpenses - totalIncome : 0;

    // Percentages of actual income
    const needsPct = totalIncome > 0 ? Math.round((needs / totalIncome) * 100) : 0;
    const wantsPct = totalIncome > 0 ? Math.round((wants / totalIncome) * 100) : 0;
    const savingsPct = totalIncome > 0 ? Math.round((currentSavings / totalIncome) * 100) : 0;

    // 50/30/20 Ideal Targets
    const targetNeeds = Math.round(totalIncome * 0.50);
    const targetWants = Math.round(totalIncome * 0.30);
    const targetSavings = Math.round(totalIncome * 0.20);

    return {
      totalIncome,
      actual: {
        needs,
        wants,
        savings: currentSavings,
        deficit,
        needsPct,
        wantsPct,
        savingsPct
      },
      recommended: {
        needs: targetNeeds,
        wants: targetWants,
        savings: targetSavings,
        needsPct: 50,
        wantsPct: 30,
        savingsPct: 20
      },
      isOverBudget: deficit > 0
    };
  }

  /**
   * Calculates how many months user can cover essential living expenses
   */
  static calculateEmergencyRunway(savings, monthlyNeeds) {
    const liquidSavings = Math.max(0, Number(savings) || 0);
    const essentialExpenses = Math.max(1, Number(monthlyNeeds) || 1); // Avoid division by zero

    const months = (liquidSavings / essentialExpenses).toFixed(1);
    const numMonths = parseFloat(months);

    let status = 'Critical';
    let color = 'text-red-500';
    let message = 'You have less than 1 month of safety net. One emergency could trigger high-interest debt.';

    if (numMonths >= 6) {
      status = 'Fortress';
      color = 'text-emerald-500';
      message = 'Outstanding! You have a full 6+ month fortress safety fund.';
    } else if (numMonths >= 3) {
      status = 'Solid';
      color = 'text-green-400';
      message = 'Good security. You have 3-6 months covered for unexpected events.';
    } else if (numMonths >= 1) {
      status = 'Vulnerable';
      color = 'text-amber-500';
      message = 'Moderate buffer. Aim to build this up to at least 3 months.';
    }

    const target3Months = Math.round(essentialExpenses * 3);
    const target6Months = Math.round(essentialExpenses * 6);

    return {
      months: numMonths,
      status,
      color,
      message,
      target3Months,
      target6Months,
      gapTo3Months: Math.max(0, target3Months - liquidSavings)
    };
  }

  /**
   * Simulates Debt Payoff using Snowball (lowest balance first)
   * vs Avalanche (highest APR first) vs Minimum-only baseline
   */
  static simulateDebtPayoff(debts, extraMonthlyPayment = 0) {
    if (!debts || debts.length === 0) {
      return {
        hasDebt: false,
        totalBalance: 0,
        totalMinPayment: 0,
        totalBudget: 0,
        snowball: { months: 0, totalInterest: 0, payoffYears: '0.0', timeline: [] },
        avalanche: { months: 0, totalInterest: 0, payoffYears: '0.0', timeline: [] },
        minimumOnly: { months: 0, totalInterest: 0, payoffYears: '0.0', timeline: [] },
        interestSaved: 0,
        monthsFaster: 0
      };
    }

    const totalBalance = debts.reduce((sum, d) => sum + (Number(d.balance) || 0), 0);
    const totalMinPayment = debts.reduce((sum, d) => sum + (Number(d.minPayment) || 0), 0);
    const extra = Math.max(0, Number(extraMonthlyPayment) || 0);

    if (totalBalance <= 0) {
      return {
        hasDebt: false,
        totalBalance: 0,
        totalMinPayment: 0,
        totalBudget: 0,
        snowball: { months: 0, totalInterest: 0, payoffYears: '0.0', timeline: [] },
        avalanche: { months: 0, totalInterest: 0, payoffYears: '0.0', timeline: [] },
        minimumOnly: { months: 0, totalInterest: 0, payoffYears: '0.0', timeline: [] },
        interestSaved: 0,
        monthsFaster: 0
      };
    }

    // Clone debts for simulations
    const clone = (list) => list.map(d => ({
      name: d.name || 'Debt',
      balance: Math.max(0, Number(d.balance) || 0),
      apr: Math.max(0, Number(d.apr) || 0),
      minPayment: Math.max(10, Number(d.minPayment) || 0)
    }));

    // 1. Minimum only simulation
    const minResult = this._runPayoffSimulation(clone(debts), 0, 'none');

    // 2. Snowball: Sort ascending by balance
    const snowballDebts = clone(debts).sort((a, b) => a.balance - b.balance);
    const snowballResult = this._runPayoffSimulation(snowballDebts, extra, 'snowball');

    // 3. Avalanche: Sort descending by APR
    const avalancheDebts = clone(debts).sort((a, b) => b.apr - a.apr);
    const avalancheResult = this._runPayoffSimulation(avalancheDebts, extra, 'avalanche');

    const interestSaved = Math.max(0, minResult.totalInterest - avalancheResult.totalInterest);
    const monthsFaster = Math.max(0, minResult.months - avalancheResult.months);

    return {
      hasDebt: true,
      totalBalance,
      totalMinPayment,
      totalBudget: totalMinPayment + extra,
      minimumOnly: minResult,
      snowball: snowballResult,
      avalanche: avalancheResult,
      interestSaved,
      monthsFaster
    };
  }

  /**
   * Internal payoff loop
   */
  static _runPayoffSimulation(debtsList, extraPayment, strategy) {
    let activeDebts = debtsList.filter(d => d.balance > 0);
    let months = 0;
    let totalInterest = 0;
    const maxMonths = 360; // 30-year cap to prevent infinite loops
    const history = [];

    while (activeDebts.length > 0 && months < maxMonths) {
      months++;
      let monthlyInterestPaid = 0;
      let availableExtra = extraPayment;

      // Accrue monthly interest on each active debt
      activeDebts.forEach(d => {
        const monthlyRate = (d.apr / 100) / 12;
        const interest = d.balance * monthlyRate;
        d.balance += interest;
        monthlyInterestPaid += interest;
        totalInterest += interest;
      });

      // Pay minimums on all active debts
      activeDebts.forEach(d => {
        const payment = Math.min(d.balance, d.minPayment);
        d.balance -= payment;
      });

      // Apply extra payment to the top target debt according to strategy
      if (strategy !== 'none' && availableExtra > 0) {
        for (let d of activeDebts) {
          if (d.balance > 0) {
            const pay = Math.min(d.balance, availableExtra);
            d.balance -= pay;
            availableExtra -= pay;
            if (availableExtra <= 0) break;
          }
        }
      }

      // Check for paid off debts and rollover payments
      activeDebts = activeDebts.filter(d => d.balance > 0.5);

      if (months % 3 === 0 || activeDebts.length === 0) {
        const currentRemaining = activeDebts.reduce((sum, d) => sum + d.balance, 0);
        history.push({
          month: months,
          remaining: Math.round(currentRemaining)
        });
      }
    }

    return {
      months,
      totalInterest: Math.round(totalInterest),
      payoffYears: (months / 12).toFixed(1),
      timeline: history
    };
  }

  /**
   * Calculates overall Financial Health Score (0 - 100)
   */
  /**
   * Analyzes invested assets (stocks, mutual funds, retirement, alternatives) and Net Worth
   */
  static analyzePortfolio(savings, investments = {}, totalDebt = 0) {
    const liquid = Math.max(0, Number(savings) || 0);
    const stocks = Math.max(0, Number(investments.stocks) || 0);
    const mutualFunds = Math.max(0, Number(investments.mutualFunds) || 0);
    const retirement = Math.max(0, Number(investments.retirement) || 0);
    const otherAssets = Math.max(0, Number(investments.otherAssets) || 0);
    const monthlyContribution = Math.max(0, Number(investments.monthlyInvestment) || 0);

    const totalInvested = stocks + mutualFunds + retirement + otherAssets;
    const marketEquities = stocks + mutualFunds; // Market-linked
    const totalAssets = liquid + totalInvested;
    const debt = Math.max(0, Number(totalDebt) || 0);
    const netWorth = totalAssets - debt;

    // Asset allocation percentages
    const stocksPct = totalAssets > 0 ? Math.round((stocks / totalAssets) * 100) : 0;
    const mfPct = totalAssets > 0 ? Math.round((mutualFunds / totalAssets) * 100) : 0;
    const retirementPct = totalAssets > 0 ? Math.round((retirement / totalAssets) * 100) : 0;
    const cashPct = totalAssets > 0 ? Math.round((liquid / totalAssets) * 100) : 0;

    return {
      liquid,
      stocks,
      mutualFunds,
      retirement,
      otherAssets,
      monthlyContribution,
      marketEquities,
      totalInvested,
      totalAssets,
      totalDebt: debt,
      netWorth,
      allocation: {
        stocksPct,
        mfPct,
        retirementPct,
        cashPct
      },
      hasInvestments: totalInvested > 0,
      isPositiveNetWorth: netWorth >= 0
    };
  }

  /**
   * Calculates overall Financial Health Score (0 - 100)
   */
  static calculateHealthScore(income, expenses, debts, savings, investments = {}) {
    const budget = this.analyzeBudget(income, expenses);
    const runway = this.calculateEmergencyRunway(savings, budget.actual.needs);
    const totalDebt = (debts || []).reduce((sum, d) => sum + (Number(d.balance) || 0), 0);
    const portfolio = this.analyzePortfolio(savings, investments, totalDebt);

    let score = 45; // Starting baseline

    // 1. Savings & Investment Inflow (+/- 20 pts)
    const effectiveSavings = budget.actual.savings + portfolio.monthlyContribution;
    const effectiveSavingsPct = budget.totalIncome > 0 ? Math.round((effectiveSavings / budget.totalIncome) * 100) : 0;

    if (effectiveSavingsPct >= 20) score += 20;
    else if (effectiveSavingsPct >= 10) score += 12;
    else if (effectiveSavingsPct >= 5) score += 5;
    else score -= 10;

    // 2. Emergency Buffer (+/- 20 pts)
    if (runway.months >= 6) score += 20;
    else if (runway.months >= 3) score += 12;
    else if (runway.months >= 1) score += 5;
    else score -= 15;

    // 3. Debt to Income Ratio (+/- 20 pts)
    const annualIncome = Math.max(1, budget.totalIncome * 12);
    const dti = (totalDebt / annualIncome) * 100;

    if (totalDebt === 0) score += 20;
    else if (dti < 20) score += 12;
    else if (dti < 40) score += 5;
    else score -= 15;

    // 4. Investment Portfolio & Net Worth (+/- 20 pts)
    if (portfolio.netWorth > 0) {
      score += 10;
      if (portfolio.totalInvested >= budget.totalIncome * 3) score += 10; // 3x monthly income in investments
      else if (portfolio.totalInvested > 0) score += 5;
    } else {
      score -= 10;
    }

    // Consistency Bonus (Ongoing SIP)
    if (portfolio.monthlyContribution > 0) score += 5;

    // Clamp score 15 - 99
    score = Math.max(15, Math.min(99, score));

    let grade = 'C';
    let gradeLabel = 'Needs Attention';
    let colorClass = 'text-amber-500';

    if (score >= 85) {
      grade = 'A+';
      gradeLabel = 'Exceptional Wealth Health';
      colorClass = 'text-emerald-500';
    } else if (score >= 70) {
      grade = 'B';
      gradeLabel = 'Healthy & Growing Portfolio';
      colorClass = 'text-green-400';
    } else if (score >= 50) {
      grade = 'C';
      gradeLabel = 'Fair / Room to Optimize';
      colorClass = 'text-yellow-400';
    } else {
      grade = 'D';
      gradeLabel = 'High Vulnerability';
      colorClass = 'text-red-500';
    }

    return {
      score,
      grade,
      gradeLabel,
      colorClass
    };
  }

  /**
   * 1. SIP Compounding & Wealth Milestone Engine
   * Calculates monthly compounding growth and solves for the ₹1 Crore / $1 Million milestone year.
   */
  static calculateSIP(monthlyContrib, annualRatePct = 12, years = 15, currencyCode = 'USD') {
    const P = Math.max(0, Number(monthlyContrib) || 0);
    const r = (Number(annualRatePct) || 12) / 12 / 100;
    const n = Math.max(1, Number(years) || 15) * 12;

    const yearlyData = [];
    let milestoneReachedYear = null;
    const targetMilestone = currencyCode === 'INR' ? 10000000 : 1000000; // 1 Cr or $1M

    for (let yr = 1; yr <= (n / 12); yr++) {
      const months = yr * 12;
      const totalInvested = P * months;
      const futureVal = r > 0 ? P * ((Math.pow(1 + r, months) - 1) / r) * (1 + r) : totalInvested;
      const totalInterest = Math.max(0, futureVal - totalInvested);

      if (!milestoneReachedYear && futureVal >= targetMilestone) {
        milestoneReachedYear = yr;
      }

      yearlyData.push({
        year: yr,
        invested: Math.round(totalInvested),
        interest: Math.round(totalInterest),
        totalWealth: Math.round(futureVal)
      });
    }

    const finalVal = yearlyData[yearlyData.length - 1] || { invested: 0, interest: 0, totalWealth: 0 };

    return {
      monthlyContrib: P,
      annualRatePct,
      years,
      totalInvested: finalVal.invested,
      totalInterest: finalVal.interest,
      finalWealth: finalVal.totalWealth,
      milestoneTarget: targetMilestone,
      milestoneYear: milestoneReachedYear,
      wealthMultiplier: finalVal.invested > 0 ? (finalVal.totalWealth / finalVal.invested).toFixed(1) : '1.0',
      progression: yearlyData
    };
  }

  /**
   * 2. Loan Prepayment & EMI Slash Simulator
   * Calculates interest and tenure savings from paying 1 extra EMI per year or stepping up payments.
   */
  static calculateLoanPrepayment(principal, annualRatePct = 8.5, tenureYears = 20, extraEmiPerYear = 1) {
    const P = Math.max(0, Number(principal) || 0);
    const r = (Number(annualRatePct) || 8.5) / 12 / 100;
    const totalMonths = Math.max(1, Number(tenureYears) || 20) * 12;

    if (P <= 0 || r <= 0) {
      return {
        monthlyEmi: 0,
        normalTotalInterest: 0,
        prepaidTotalInterest: 0,
        interestSaved: 0,
        monthsSaved: 0,
        yearsSaved: 0,
        revisedTenureYears: 0
      };
    }

    // Standard EMI formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = (P * r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
    const normalTotalPaid = emi * totalMonths;
    const normalTotalInterest = normalTotalPaid - P;

    // Simulate prepayment with 1 extra EMI paid annually (split monthly or lump sum)
    const monthlyExtra = (emi * (Number(extraEmiPerYear) || 1)) / 12;
    let balance = P;
    let prepaidMonths = 0;
    let prepaidTotalInterest = 0;

    while (balance > 0 && prepaidMonths < totalMonths * 2) {
      prepaidMonths++;
      const interestMonth = balance * r;
      prepaidTotalInterest += interestMonth;
      const principalPaid = (emi + monthlyExtra) - interestMonth;
      balance -= principalPaid;
      if (balance <= 0) break;
    }

    const interestSaved = Math.max(0, normalTotalInterest - prepaidTotalInterest);
    const monthsSaved = Math.max(0, totalMonths - prepaidMonths);
    const yearsSaved = (monthsSaved / 12).toFixed(1);

    return {
      principal: P,
      monthlyEmi: Math.round(emi),
      normalTotalInterest: Math.round(normalTotalInterest),
      prepaidTotalInterest: Math.round(prepaidTotalInterest),
      interestSaved: Math.round(interestSaved),
      interestSavedPct: normalTotalInterest > 0 ? Math.round((interestSaved / normalTotalInterest) * 100) : 0,
      monthsSaved,
      yearsSaved: parseFloat(yearsSaved),
      revisedTenureYears: (prepaidMonths / 12).toFixed(1)
    };
  }

  /**
   * 3. Old vs. New Tax Regime Comparison Optimizer
   * Computes tax for Indian Budget 2024/25 (with US Federal fallback for USD).
   */
  static calculateTaxRegime(annualIncome, currencyCode = 'INR') {
    const income = Math.max(0, Number(annualIncome) || 0);

    if (currencyCode === 'INR') {
      // Indian Tax Regime (Budget 2024/25)
      // New Regime: Std deduction 75,000. Rebate u/s 87A up to 7L taxable income (effectively 0 tax up to 7.75L).
      const newStdDeduction = 75000;
      const newTaxable = Math.max(0, income - newStdDeduction);
      let newTax = 0;

      if (newTaxable > 1500000) {
        newTax += (newTaxable - 1500000) * 0.30 + 150000;
      } else if (newTaxable > 1200000) {
        newTax += (newTaxable - 1200000) * 0.20 + 90000;
      } else if (newTaxable > 1000000) {
        newTax += (newTaxable - 1000000) * 0.15 + 60000;
      } else if (newTaxable > 700000) {
        newTax += (newTaxable - 700000) * 0.10 + 30000;
      } else if (newTaxable > 300000) {
        newTax += (newTaxable - 300000) * 0.05;
      }

      // 87A Rebate in New Regime (taxable <= 7 Lakhs -> tax is 0)
      if (newTaxable <= 700000) {
        newTax = 0;
      }

      // 4% Health & Edu Cess
      newTax = Math.round(newTax * 1.04);

      // Old Regime: Std deduction 50,000 + 80C (1.5L) + 80D (25k) + NPS (50k) = 2.75L deductions typical
      const oldDeductions = 50000 + 150000 + 25000 + 50000;
      const oldTaxable = Math.max(0, income - oldDeductions);
      let oldTax = 0;

      if (oldTaxable > 1000000) {
        oldTax += (oldTaxable - 1000000) * 0.30 + 112500;
      } else if (oldTaxable > 500000) {
        oldTax += (oldTaxable - 500000) * 0.20 + 12500;
      } else if (oldTaxable > 250000) {
        oldTax += (oldTaxable - 250000) * 0.05;
      }

      if (oldTaxable <= 500000) {
        oldTax = 0;
      }
      oldTax = Math.round(oldTax * 1.04);

      const recommended = newTax <= oldTax ? 'NEW' : 'OLD';
      const savings = Math.abs(oldTax - newTax);

      return {
        annualIncome: income,
        currency: '₹',
        newRegimeTax: newTax,
        oldRegimeTax: oldTax,
        recommended,
        taxDifference: savings,
        newStdDeduction,
        potentialDeductions: 275000,
        tips: recommended === 'NEW'
          ? 'The New Regime provides zero hassle and lower tax with the increased ₹75,000 standard deduction.'
          : 'The Old Regime saves you money if you maximize 80C ELSS mutual funds, Health Insurance, and NPS.'
      };
    } else {
      // US Standard Deduction & Federal brackets (Single filer approx)
      const stdDeduction = 14600;
      const taxable = Math.max(0, income - stdDeduction);
      let tax = 0;

      if (taxable > 100525) tax = 17494 + (taxable - 100525) * 0.24;
      else if (taxable > 47150) tax = 5426 + (taxable - 47150) * 0.22;
      else if (taxable > 11600) tax = 1160 + (taxable - 11600) * 0.12;
      else tax = taxable * 0.10;

      const itemizedTax = Math.max(0, tax * 0.92); // Approx with 401(k) / IRA tax shelters

      return {
        annualIncome: income,
        currency: '$',
        newRegimeTax: Math.round(tax),
        oldRegimeTax: Math.round(itemizedTax),
        recommended: 'NEW',
        taxDifference: Math.round(tax * 0.08),
        newStdDeduction: stdDeduction,
        potentialDeductions: 23000,
        tips: 'Take full advantage of tax-advantaged 401(k) and HSA contributions to lower your federal adjusted gross income.'
      };
    }
  }

  /**
   * 4. Smart Credit Card & Cashback Recommender
   * Evaluates discretionary & living expenses to calculate exact reward earnings.
   */
  static recommendCreditCards(expenses, currencyCode = 'USD') {
    const dining = Number(expenses.dining) || 0;
    const groceries = Number(expenses.groceries) || 0;
    const transport = Number(expenses.transport) || 0;
    const utilities = Number(expenses.utilities) || 0;
    const shopping = (Number(expenses.entertainment) || 0) + (Number(expenses.otherWants) || 0);

    const annualEligibleSpend = (dining + groceries + transport + utilities + shopping) * 12;

    // Estimate realistic cashback rewards (3% to 5% category blends)
    const annualCashback = Math.round(
      (groceries * 12 * 0.05) +
      (dining * 12 * 0.04) +
      (utilities * 12 * 0.03) +
      (shopping * 12 * 0.02)
    );

    const isINR = currencyCode === 'INR';

    const cards = isINR ? [
      {
        name: 'HDFC Millennia / Swiggy Card',
        badge: 'Top for Dining & Cashback',
        cashbackRate: '5% Cashback on Amazon, Swiggy, Zomato',
        annualBenefit: '₹' + Math.round(annualCashback * 0.65).toLocaleString(),
        features: ['5% Unlimited Online Cashback', '4 Free Domestic Lounge Visits/yr', 'Zero fee on annual spend waiver'],
        applyUrl: 'https://bitli.in/enkviCh'
      },
      {
        name: 'SBI Cashback Credit Card',
        badge: 'Best Flat 5% Online',
        cashbackRate: 'Flat 5% on all online merchants',
        annualBenefit: '₹' + Math.round(annualCashback).toLocaleString(),
        features: ['No merchant restrictions', 'Direct statement credit every month', '1% fuel surcharge waiver'],
        applyUrl: 'https://bitli.in/xGn3eM8'
      },
      {
        name: 'Axis Bank Airtel / Ace Card',
        badge: 'Best for Utility & Bills',
        cashbackRate: '25% on bills, 4% on food deliveries',
        annualBenefit: '₹' + Math.round(annualCashback * 0.45).toLocaleString(),
        features: ['25% on mobile, DTH & broadband', '10% on Swiggy & Zomato', 'Instant approval via digital KYC'],
        applyUrl: 'https://bitli.in/2eKkuCS'
      }
    ] : [
      {
        name: 'Chase Freedom Unlimited®',
        badge: 'Best Everyday Rewards',
        cashbackRate: '5% on Travel, 3% Dining & Drugstores',
        annualBenefit: '$' + Math.round(annualCashback).toLocaleString(),
        features: ['0% Intro APR for 15 months', '$200 Welcome Bonus', 'No annual fee ever'],
        applyUrl: 'https://creditcards.chase.com/cash-back-credit-cards/freedom/unlimited'
      },
      {
        name: 'Capital One SavorOne Cash Rewards',
        badge: 'Top for Dining & Groceries',
        cashbackRate: '3% Dining, Entertainment & Groceries',
        annualBenefit: '$' + Math.round(annualCashback * 0.85).toLocaleString(),
        features: ['8% on Capital One Entertainment', 'No foreign transaction fees', '$200 cash bonus on signup'],
        applyUrl: 'https://www.capitalone.com/credit-cards/savorone-dining-rewards/'
      },
      {
        name: 'Blue Cash Preferred® from Amex',
        badge: 'Highest Supermarket Rate',
        cashbackRate: '6% at U.S. Supermarkets & Streaming',
        annualBenefit: '$' + Math.round(annualCashback * 1.15).toLocaleString(),
        features: ['6% on up to $6,000/yr in groceries', '3% on Transit & Gas stations', 'Top-tier purchase protection'],
        applyUrl: 'https://www.americanexpress.com/us/credit-cards/card/blue-cash-everyday/'
      }
    ];

    return {
      annualEligibleSpend,
      estimatedAnnualCashback: annualCashback,
      recommendedCards: cards
    };
  }

  /**
   * 5. AI Portfolio Doctor & Risk Diagnostic
   * Evaluates asset allocation, detects over-concentration, and scores portfolio safety.
   */
  static auditPortfolioRisk(portfolio, stockCount = 0) {
    const stocks = Math.max(0, Number(portfolio.stocks) || 0);
    const mutualFunds = Math.max(0, Number(portfolio.mutualFunds) || 0);
    const cash = Math.max(0, Number(portfolio.liquidSavings) || 0);
    const retirement = Math.max(0, Number(portfolio.retirement) || 0);
    const alternatives = Math.max(0, Number(portfolio.otherAssets) || 0);

    const totalAssets = stocks + mutualFunds + cash + retirement + alternatives;

    if (totalAssets === 0) {
      return {
        diversificationGrade: 'N/A',
        score: 0,
        breakdown: { stocksPct: 0, fundsPct: 0, cashPct: 100, retirementPct: 0, altPct: 0 },
        riskLabel: 'Starting Fresh',
        statusColor: 'text-slate-500',
        findings: ['No invested assets recorded yet. Start with an index fund SIP to build compounding momentum.'],
        recommendation: 'Allocate 60% of new savings into broad-market index mutual funds and 40% into cash buffer.'
      };
    }

    const stocksPct = Math.round((stocks / totalAssets) * 100);
    const fundsPct = Math.round((mutualFunds / totalAssets) * 100);
    const cashPct = Math.round((cash / totalAssets) * 100);
    const retirementPct = Math.round((retirement / totalAssets) * 100);
    const altPct = Math.round((alternatives / totalAssets) * 100);

    const findings = [];
    let score = 85;

    // Check equity concentration
    if (stocksPct > 50) {
      score -= 20;
      findings.push(`High Direct Equity Risk: ${stocksPct}% of wealth is concentrated in individual stocks. Individual stocks can swing 30-50% in a bear market.`);
    }

    // Check cash drag
    if (cashPct > 45 && totalAssets > 5000) {
      score -= 15;
      findings.push(`Inflation Drag: ${cashPct}% of your assets are in low-interest liquid cash losing real purchasing power to inflation.`);
    }

    // Check lack of broad funds
    if (fundsPct + retirementPct < 20) {
      score -= 15;
      findings.push(`Low Core Compounding: Only ${fundsPct + retirementPct}% is in diversified index/mutual funds. Diversification is your only free lunch in finance.`);
    }

    // Positive findings
    if (fundsPct >= 30 && fundsPct <= 70) {
      score += 10;
      findings.push(`Solid Fund Foundation: ${fundsPct}% allocated to mutual funds/ETFs provides healthy exposure to economic growth.`);
    }

    score = Math.max(25, Math.min(98, score));

    let diversificationGrade = 'B';
    let riskLabel = 'Moderate Balance';
    let statusColor = 'text-emerald-600';

    if (score >= 85) {
      diversificationGrade = 'A+';
      riskLabel = 'Fortress Diversification';
      statusColor = 'text-emerald-600';
    } else if (score >= 70) {
      diversificationGrade = 'B';
      riskLabel = 'Well-Balanced Portfolio';
      statusColor = 'text-blue-600';
    } else if (score >= 50) {
      diversificationGrade = 'C';
      riskLabel = 'Concentrated Risk';
      statusColor = 'text-amber-600';
    } else {
      diversificationGrade = 'D';
      riskLabel = 'Critical Exposure';
      statusColor = 'text-red-600';
    }

    return {
      diversificationGrade,
      score,
      totalAssets,
      breakdown: { stocksPct, fundsPct, cashPct, retirementPct, altPct },
      riskLabel,
      statusColor,
      findings,
      recommendation: stocksPct > 40
        ? 'Rebalance by directing upcoming SIPs into Digital Gold or Fixed-Income Bonds to hedge equity drawdown.'
        : 'Maintain your systematic monthly contribution across broad-market index funds.'
    };
  }

}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = FinanceEngine;
}
