/**
 * AI Finance Advisor - Main Application Controller (Production Light Theme)
 * Handles wizard state, dynamic debt rows, calculation execution, toast alerts, modals, and affiliate rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  // State
  let currentStep = 1;
  const totalSteps = 5;
  let currentCurrency = '$';
  let calculationResults = null;

  // Currency symbols map
  const currencySymbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£'
  };

  // DOM Elements
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const wizardSteps = document.querySelectorAll('.wizard-step');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const generateBtn = document.getElementById('generate-btn');
  const currencySelect = document.getElementById('currency-select');
  const currencyLabels = document.querySelectorAll('.currency-label');
  const debtsContainer = document.getElementById('debts-container');
  const addDebtBtn = document.getElementById('add-debt-btn');

  const intakeSection = document.getElementById('intake-section');
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingText = document.getElementById('loading-text');
  const resultsDashboard = document.getElementById('results-dashboard');
  const restartBtn = document.getElementById('restart-btn');
  const printPdfBtn = document.getElementById('print-pdf-btn');

  // Initialize
  updateCurrency(currencySelect.value);
  updateWizardUI();

  // Toast Notification Helper
  function showToast(message, type = 'error') {
    window.showToast = showToast;
    const toast = document.getElementById('toast-notification');
    const toastMsg = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast || !toastMsg) {
      alert(message);
      return;
    }

    toastMsg.textContent = message;

    if (type === 'error') {
      toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-900 border border-red-200 shadow-xl max-w-md transition-all duration-300 transform translate-y-0 opacity-100';
      toastIcon.innerHTML = `<svg class="w-5 h-5 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    } else {
      toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xl max-w-md transition-all duration-300 transform translate-y-0 opacity-100';
      toastIcon.innerHTML = `<svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
    }

    setTimeout(() => {
      toast.className = 'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-xl max-w-md transition-all duration-300 transform translate-y-12 opacity-0 pointer-events-none';
    }, 4500);
  }
  window.showToast = showToast;

  // Live Real-Time Intake Preview Listener
  const intakeForm = document.getElementById('finance-intake-form');
  if (intakeForm) {
    intakeForm.addEventListener('input', updateIntakeLivePreview);
  }
  updateIntakeLivePreview();

  // Currency Switcher Event
  currencySelect.addEventListener('change', (e) => {
    updateCurrency(e.target.value);
  });

  function updateCurrency(currencyCode) {
    currentCurrency = currencySymbols[currencyCode] || '$';
    currencyLabels.forEach(el => {
      el.textContent = currentCurrency;
    });

    // Notify StockTracker of currency switch
    if (window.StockTracker) {
      window.StockTracker.setCurrency(currentCurrency, currencyCode);
    }

    // Update range labels and recalculate revenue tools
    updateIntakeLivePreview();
    const sipMinLabel = document.getElementById('sip-min-label');
    const sipMaxLabel = document.getElementById('sip-max-label');
    if (sipMinLabel) sipMinLabel.textContent = `${currentCurrency}50`;
    if (sipMaxLabel) sipMaxLabel.textContent = `${currentCurrency}5,000`;

    if (calculationResults) {
      updateSIPCalculator();
      updateCreditCards(calculationResults.budget.actual);
      updateLoanPrepayment();
      updateTaxOptimizer(calculationResults.budget.totalIncome * 12);
      if (calculationResults.portfolio) {
        updatePortfolioDoctor(calculationResults.portfolio);
      }
    }

    // Re-render charts and metrics if results are already displayed
    if (calculationResults) {
      FinanceCharts.renderBudgetChart('budget-chart', calculationResults.budget, currentCurrency);
      if (calculationResults.debt?.hasDebt) {
        FinanceCharts.renderDebtChart('debt-chart', calculationResults.debt, currentCurrency);
      }
      populateDashboard(calculationResults);
    }
  }

  // Wizard Navigation
  nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        currentStep++;
        updateWizardUI();
      }
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateWizardUI();
    }
  });

  function updateWizardUI() {
    // Show/Hide step containers
    wizardSteps.forEach((step, idx) => {
      if (idx + 1 === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Update Contextual AI Advisor Guidance Tip
    const stepTips = {
      1: "Enter your true post-tax take-home earnings. Having an accurate cash baseline ensures our 50/30/20 algorithms build a realistic wealth roadmap.",
      2: "The 50% Rule: Fixed obligations (Needs) should ideally stay under 50% of income to leave room for investing and discretionary spending.",
      3: "Crushing Debt: High-APR credit card interest steals your wealth compounding. Avalanche math prioritizes highest rates first to save maximum money.",
      4: "Compounding Engine: Systematic monthly SIPs beat lump-sum market timing 91% of the time over 10-year horizons with zero market stress.",
      5: "Milestone Focus: Defining your #1 priority helps our AI synthesize a laser-focused 30-day tactical roadmap."
    };
    const tipEl = document.getElementById('intake-step-tip');
    if (tipEl && stepTips[currentStep]) {
      tipEl.textContent = stepTips[currentStep];
    }

    // Step indicators - Light Theme Fintech Aesthetics
    stepIndicators.forEach((ind, idx) => {
      if (idx + 1 < currentStep) {
        ind.className = 'step-indicator flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold shadow-sm';
      } else if (idx + 1 === currentStep) {
        ind.className = 'step-indicator flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs ring-4 ring-emerald-100 shadow-md';
      } else {
        ind.className = 'step-indicator flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold';
      }
    });

    // Button states
    if (currentStep === 1) {
      prevBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
    }

    if (currentStep === totalSteps) {
      nextBtn.classList.add('hidden');
      generateBtn.classList.remove('hidden');
    } else {
      nextBtn.classList.remove('hidden');
      generateBtn.classList.add('hidden');
    }

    // Scroll smoothly to intake container
    intakeSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function validateStep(step) {
    if (step === 1) {
      const income = document.getElementById('monthly-income')?.value;
      if (!income || Number(income) <= 0) {
        showToast('Please enter your estimated monthly take-home income to proceed.');
        document.getElementById('monthly-income')?.focus();
        return false;
      }
    }
    return true;
  }

  // Dynamic Debt Rows: Delegation ensures both initial and added rows delete properly
  debtsContainer.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-debt-btn');
    if (removeBtn) {
      const row = removeBtn.closest('.debt-row');
      if (row) {
        row.remove();
      }
    }
  });

  addDebtBtn.addEventListener('click', () => {
    addDebtRow();
  });

  function addDebtRow(name = '', balance = '', apr = '', minPayment = '') {
    const row = document.createElement('div');
    row.className = 'debt-row grid grid-cols-1 md:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 relative transition';
    row.innerHTML = `
      <div>
        <label class="block text-xs font-medium text-slate-600 mb-1">Debt Name</label>
        <input type="text" class="debt-name w-full px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-300 text-slate-900" placeholder="e.g. Visa Credit Card" value="${name}">
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-600 mb-1">Balance</label>
        <div class="relative">
          <span class="absolute left-2.5 top-1.5 text-xs text-slate-400 currency-label">${currentCurrency}</span>
          <input type="number" class="debt-balance w-full pl-6 pr-2 py-1.5 rounded-lg text-sm bg-white border border-slate-300 text-slate-900" placeholder="5000" value="${balance}">
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-slate-600 mb-1">APR (Interest %)</label>
        <div class="relative">
          <input type="number" step="0.1" class="debt-apr w-full px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-300 text-slate-900" placeholder="22.5" value="${apr}">
          <span class="absolute right-2.5 top-1.5 text-xs text-slate-400">%</span>
        </div>
      </div>
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate-600 mb-1">Min Payment</label>
          <div class="relative">
            <span class="absolute left-2.5 top-1.5 text-xs text-slate-400 currency-label">${currentCurrency}</span>
            <input type="number" class="debt-min w-full pl-6 pr-2 py-1.5 rounded-lg text-sm bg-white border border-slate-300 text-slate-900" placeholder="120" value="${minPayment}">
          </div>
        </div>
        <button type="button" class="remove-debt-btn p-2 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-red-50" title="Remove debt">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    `;

    debtsContainer.appendChild(row);
  }

  // Generate Blueprint Trigger
  generateBtn.addEventListener('click', async () => {
    try {
      // Gather all inputs
      const userData = gatherUserData();

      if (userData.income <= 0) {
        showToast('Please enter your monthly income to generate a valid plan.');
        currentStep = 1;
        updateWizardUI();
        return;
      }

      // Show AI Generation Animation
      intakeSection.classList.add('hidden');
      loadingOverlay.classList.remove('hidden');

      const steps = [
        'Ingesting financial profile...',
        'Computing 50/30/20 budget allocations...',
        'Simulating Debt Snowball vs. Avalanche trajectories...',
        'Calculating Portfolio & Net Worth balance sheet...',
        'Synthesizing personalized AI tactical roadmap...'
      ];

      for (let i = 0; i < steps.length; i++) {
        loadingText.textContent = steps[i];
        await new Promise(r => setTimeout(r, 380));
      }

      // Run calculations
      const budgetAnalysis = FinanceEngine.analyzeBudget(userData.income, userData.expenses);
      const runwayAnalysis = FinanceEngine.calculateEmergencyRunway(userData.savings, budgetAnalysis.actual.needs);
      const debtAnalysis = FinanceEngine.simulateDebtPayoff(userData.debts, budgetAnalysis.actual.savings * 0.5); // 50% of surplus to debt
      const portfolioAnalysis = FinanceEngine.analyzePortfolio(userData.savings, userData.investments, debtAnalysis.totalBalance);
      const healthScore = FinanceEngine.calculateHealthScore(userData.income, userData.expenses, userData.debts, userData.savings, userData.investments);

      const aiReport = AIAdvisor.generateReport(
        userData,
        budgetAnalysis,
        runwayAnalysis,
        debtAnalysis,
        healthScore,
        portfolioAnalysis,
        currentCurrency
      );

      calculationResults = {
        userData,
        budget: budgetAnalysis,
        runway: runwayAnalysis,
        debt: debtAnalysis,
        portfolio: portfolioAnalysis,
        healthScore,
        aiReport
      };

      // Render Results into Dashboard
      populateDashboard(calculationResults);

      // Hide Loading, Show Dashboard
      loadingOverlay.classList.add('hidden');
      resultsDashboard.classList.remove('hidden');
      resultsDashboard.scrollIntoView({ behavior: 'smooth' });

      // Render Charts
      setTimeout(() => {
        FinanceCharts.renderBudgetChart('budget-chart', budgetAnalysis, currentCurrency);
        if (debtAnalysis.hasDebt) {
          document.getElementById('debt-chart-card')?.classList.remove('hidden');
          FinanceCharts.renderDebtChart('debt-chart', debtAnalysis, currentCurrency);
        } else {
          document.getElementById('debt-chart-card')?.classList.add('hidden');
        }
      }, 150);

      // Load and Render Affiliate Recommendations
      renderAffiliateCards(calculationResults);
    } catch (err) {
      console.error('Error generating financial blueprint:', err);
      loadingOverlay.classList.add('hidden');
      intakeSection.classList.remove('hidden');
      showToast('An error occurred while generating your blueprint: ' + (err.message || err));
    }
  });

  function gatherUserData() {
    const income = Number(document.getElementById('monthly-income')?.value) || 0;
    const sideIncome = Number(document.getElementById('side-income')?.value) || 0;
    const savings = Number(document.getElementById('liquid-savings')?.value) || 0;

    const expenses = {
      housing: Number(document.getElementById('exp-housing')?.value) || 0,
      utilities: Number(document.getElementById('exp-utilities')?.value) || 0,
      groceries: Number(document.getElementById('exp-groceries')?.value) || 0,
      transport: Number(document.getElementById('exp-transport')?.value) || 0,
      minDebtPayments: 0,
      dining: Number(document.getElementById('exp-dining')?.value) || 0,
      entertainment: Number(document.getElementById('exp-entertainment')?.value) || 0,
      subscriptions: Number(document.getElementById('exp-subscriptions')?.value) || 0,
      otherWants: Number(document.getElementById('exp-other-wants')?.value) || 0
    };

    // Gather debts
    const debtRows = document.querySelectorAll('.debt-row');
    const debts = [];
    let totalMinDebt = 0;

    debtRows.forEach(row => {
      const name = row.querySelector('.debt-name')?.value || 'Debt';
      const balance = Number(row.querySelector('.debt-balance')?.value) || 0;
      const apr = Number(row.querySelector('.debt-apr')?.value) || 0;
      const minPayment = Number(row.querySelector('.debt-min')?.value) || 0;

      if (balance > 0) {
        debts.push({ name, balance, apr, minPayment });
        totalMinDebt += minPayment;
      }
    });

    expenses.minDebtPayments = totalMinDebt;

    // Gather Investments & Portfolio (Auto-synced with Live Stock Watchlist if active)
    let userStockVal = Number(document.getElementById('inv-stocks')?.value) || 0;
    if (window.StockTracker) {
      const stockVal = window.StockTracker.getValuation();
      if (stockVal.count > 0 && userStockVal === 0) {
        userStockVal = stockVal.totalCurrentValue;
        const invStocksInput = document.getElementById('inv-stocks');
        if (invStocksInput) invStocksInput.value = userStockVal;
      }
    }

    const investments = {
      stocks: userStockVal,
      mutualFunds: Number(document.getElementById('inv-mutual-funds')?.value) || 0,
      retirement: Number(document.getElementById('inv-retirement')?.value) || 0,
      otherAssets: Number(document.getElementById('inv-other')?.value) || 0,
      monthlyInvestment: Number(document.getElementById('inv-monthly-contrib')?.value) || 0
    };

    const goalSelect = document.getElementById('primary-goal');
    const goal = goalSelect ? goalSelect.value : 'Financial Freedom';

    return {
      income: income + sideIncome,
      savings,
      expenses,
      debts,
      investments,
      goal,
      currency: currentCurrency
    };
  }



  // Real-Time Intake Live Preview Sidebar Controller
  function updateIntakeLivePreview() {
    const income = Number(document.getElementById('monthly-income')?.value) || 0;
    const sideIncome = Number(document.getElementById('side-income')?.value) || 0;
    const liquidSavings = Number(document.getElementById('liquid-savings')?.value) || 0;
    const totalInflow = income + sideIncome;

    const housing = Number(document.getElementById('exp-housing')?.value) || 0;
    const utilities = Number(document.getElementById('exp-utilities')?.value) || 0;
    const groceries = Number(document.getElementById('exp-groceries')?.value) || 0;
    const transport = Number(document.getElementById('exp-transport')?.value) || 0;
    const totalNeeds = housing + utilities + groceries + transport;

    const dining = Number(document.getElementById('exp-dining')?.value) || 0;
    const entertainment = Number(document.getElementById('exp-entertainment')?.value) || 0;
    const subscriptions = Number(document.getElementById('exp-subscriptions')?.value) || 0;
    const otherWants = Number(document.getElementById('exp-other-wants')?.value) || 0;
    const totalWants = dining + entertainment + subscriptions + otherWants;

    const totalExpenses = totalNeeds + totalWants;
    const surplus = Math.max(0, totalInflow - totalExpenses);

    // Runway
    const runwayMonths = totalNeeds > 0 ? (liquidSavings / totalNeeds).toFixed(1) : (liquidSavings > 0 ? '6.0+' : '0.0');

    // Debts
    let totalDebts = 0;
    document.querySelectorAll('#debts-container .debt-row').forEach(row => {
      totalDebts += Number(row.querySelector('.debt-balance')?.value) || 0;
    });

    // Investments
    let stocks = Number(document.getElementById('inv-stocks')?.value) || 0;
    if (window.StockTracker) {
      const sVal = window.StockTracker.getValuation();
      if (sVal.count > 0 && stocks === 0) stocks = sVal.totalCurrentValue;
    }
    const mutualFunds = Number(document.getElementById('inv-mutual-funds')?.value) || 0;
    const retirement = Number(document.getElementById('inv-retirement')?.value) || 0;
    const otherAssets = Number(document.getElementById('inv-other')?.value) || 0;
    const totalAssets = liquidSavings + stocks + mutualFunds + retirement + otherAssets;
    const netWorth = totalAssets - totalDebts;

    // Update DOM
    const inflowEl = document.getElementById('preview-inflow');
    const surplusEl = document.getElementById('preview-surplus');
    const runwayEl = document.getElementById('preview-runway');
    const networthEl = document.getElementById('preview-networth');

    if (inflowEl) inflowEl.textContent = `${currentCurrency}${totalInflow.toLocaleString()}/mo`;
    if (surplusEl) surplusEl.textContent = `${currentCurrency}${surplus.toLocaleString()}/mo`;
    if (runwayEl) runwayEl.textContent = `${runwayMonths} Mos`;
    if (networthEl) {
      if (netWorth < 0) {
        networthEl.textContent = `-${currentCurrency}${Math.abs(netWorth).toLocaleString()}`;
        networthEl.className = 'text-sm font-extrabold text-red-600';
      } else {
        networthEl.textContent = `${currentCurrency}${netWorth.toLocaleString()}`;
        networthEl.className = 'text-sm font-extrabold text-emerald-700';
      }
    }

    // Target 50/30/20 breakdown
    const targetNeeds = Math.round(totalInflow * 0.50);
    const targetWants = Math.round(totalInflow * 0.30);
    const targetSavings = Math.round(totalInflow * 0.20);

    const tNeedsEl = document.getElementById('preview-target-needs');
    const tWantsEl = document.getElementById('preview-target-wants');
    const tSavingsEl = document.getElementById('preview-target-savings');

    if (tNeedsEl) tNeedsEl.textContent = `${currentCurrency}${targetNeeds.toLocaleString()}`;
    if (tWantsEl) tWantsEl.textContent = `${currentCurrency}${targetWants.toLocaleString()}`;
    if (tSavingsEl) tSavingsEl.textContent = `${currentCurrency}${targetSavings.toLocaleString()}`;
  }

  // ==========================================
  // REVENUE FEATURES CONTROLLER
  // ==========================================

  // 1. SIP Compounding Calculator Handler
  function updateSIPCalculator() {
    const monthlySlider = document.getElementById('sip-monthly-slider');
    const rateSlider = document.getElementById('sip-rate-slider');
    const yearsSlider = document.getElementById('sip-years-slider');

    if (!monthlySlider || !rateSlider || !yearsSlider) return;

    const monthly = Number(monthlySlider.value) || 500;
    const rate = Number(rateSlider.value) || 12;
    const years = Number(yearsSlider.value) || 15;

    // Update Slider Displays
    const monthlyDisplay = document.getElementById('sip-monthly-display');
    const rateDisplay = document.getElementById('sip-rate-display');
    const yearsDisplay = document.getElementById('sip-years-display');

    if (monthlyDisplay) monthlyDisplay.textContent = `${currentCurrency}${monthly.toLocaleString()}/mo`;
    if (rateDisplay) rateDisplay.textContent = `${rate}% p.a.`;
    if (yearsDisplay) yearsDisplay.textContent = `${years} Years`;

    const sipData = FinanceEngine.calculateSIP(monthly, rate, years, currencySelect.value);

    // Update KPI Pills
    const investedEl = document.getElementById('sip-stat-invested');
    const interestEl = document.getElementById('sip-stat-interest');
    const totalEl = document.getElementById('sip-stat-total');
    const multEl = document.getElementById('sip-stat-mult');
    const milestoneText = document.getElementById('sip-milestone-text');

    if (investedEl) investedEl.textContent = `${currentCurrency}${sipData.totalInvested.toLocaleString()}`;
    if (interestEl) interestEl.textContent = `+${currentCurrency}${sipData.totalInterest.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `${currentCurrency}${sipData.finalWealth.toLocaleString()}`;
    if (multEl) multEl.textContent = `${sipData.wealthMultiplier}x Wealth Multiplier`;

    if (milestoneText) {
      if (sipData.milestoneYear) {
        const targetLabel = currencySelect.value === 'INR' ? '₹1 Crore' : '$1 Million';
        milestoneText.textContent = `Hit ${targetLabel} in Year ${sipData.milestoneYear}!`;
      } else {
        const targetLabel = currencySelect.value === 'INR' ? '₹1 Crore' : '$1 Million';
        milestoneText.textContent = `Growing towards ${targetLabel}...`;
      }
    }

    // Render Compounding Chart
    FinanceCharts.renderCompoundingChart('compounding-chart', sipData, currentCurrency);
  }

  // 2. Smart Credit Card Recommender Handler
  function updateCreditCards(expenses) {
    const grid = document.getElementById('credit-cards-grid');
    const rewardsVal = document.getElementById('cc-annual-rewards-val');
    if (!grid) return;

    const cardData = FinanceEngine.recommendCreditCards(expenses, currencySelect.value);
    if (rewardsVal) {
      rewardsVal.textContent = `${currentCurrency}${cardData.estimatedAnnualCashback.toLocaleString()}/year`;
    }

    grid.innerHTML = cardData.recommendedCards.map(c => `
      <div class="credit-card-item p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between shadow-sm">
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">${c.badge}</span>
            <span class="text-[11px] font-extrabold text-emerald-600">${c.annualBenefit}/yr</span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 mb-1">${c.name}</h4>
          <p class="text-xs text-slate-500 mb-3">${c.cashbackRate}</p>
          <ul class="space-y-1 text-[11px] text-slate-600 mb-4">
            ${c.features.map(f => `<li class="flex items-center gap-1.5"><span class="text-emerald-500 font-bold">✓</span> ${f}</li>`).join('')}
          </ul>
        </div>
        <a href="${c.applyUrl}" target="_blank" rel="noopener sponsored" class="w-full text-center py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm">
          Apply Now (Check Eligibility) →
        </a>
      </div>
    `).join('');
  }

  // 3. Loan Prepayment & EMI Slash Handler
  function updateLoanPrepayment() {
    const principalInput = document.getElementById('loan-prep-principal');
    const rateInput = document.getElementById('loan-prep-rate');
    const tenureInput = document.getElementById('loan-prep-tenure');

    if (!principalInput || !rateInput || !tenureInput) return;

    const principal = Number(principalInput.value) || 0;
    const rate = Number(rateInput.value) || 8.5;
    const tenure = Number(tenureInput.value) || 20;

    const prepData = FinanceEngine.calculateLoanPrepayment(principal, rate, tenure, 1);

    const normalIntEl = document.getElementById('loan-prep-normal-int');
    const savedIntEl = document.getElementById('loan-prep-saved-int');
    const yearsSavedEl = document.getElementById('loan-prep-years-saved');
    const newTenureEl = document.getElementById('loan-prep-new-tenure');
    const badgeEl = document.getElementById('prep-interest-saved-badge');

    if (normalIntEl) normalIntEl.textContent = `${currentCurrency}${prepData.normalTotalInterest.toLocaleString()}`;
    if (savedIntEl) savedIntEl.textContent = `${currentCurrency}${prepData.interestSaved.toLocaleString()}`;
    if (yearsSavedEl) yearsSavedEl.textContent = `${prepData.yearsSaved} Years`;
    if (newTenureEl) newTenureEl.textContent = `${prepData.revisedTenureYears} Years`;
    if (badgeEl) badgeEl.textContent = `Saves ${prepData.interestSavedPct}% Interest (1 Extra EMI/yr)`;
  }

  // 4. Old vs. New Tax Regime Handler
  function updateTaxOptimizer(annualIncome) {
    const newTaxEl = document.getElementById('tax-val-new');
    const oldTaxEl = document.getElementById('tax-val-old');
    const pillEl = document.getElementById('tax-recommended-pill');
    const newCard = document.getElementById('tax-card-new');
    const oldCard = document.getElementById('tax-card-old');

    if (!newTaxEl || !oldTaxEl) return;

    const taxData = FinanceEngine.calculateTaxRegime(annualIncome, currencySelect.value);

    newTaxEl.textContent = `${currentCurrency}${taxData.newRegimeTax.toLocaleString()}`;
    oldTaxEl.textContent = `${currentCurrency}${taxData.oldRegimeTax.toLocaleString()}`;

    if (pillEl) {
      pillEl.textContent = `${taxData.recommended} Regime Recommended (Saves ${currentCurrency}${taxData.taxDifference.toLocaleString()})`;
    }

    if (newCard && oldCard) {
      if (taxData.recommended === 'NEW') {
        newCard.className = 'p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 relative shadow-sm';
        oldCard.className = 'p-4 rounded-xl border border-slate-200 bg-white relative';
      } else {
        oldCard.className = 'p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 relative shadow-sm';
        newCard.className = 'p-4 rounded-xl border border-slate-200 bg-white relative';
      }
    }
  }

  // 5. AI Portfolio Doctor Handler
  function updatePortfolioDoctor(portfolio) {
    const gradeEl = document.getElementById('port-doctor-grade');
    const labelEl = document.getElementById('port-doctor-risk-label');
    const findingsEl = document.getElementById('port-doctor-findings');

    const barStocks = document.getElementById('bar-stocks');
    const barFunds = document.getElementById('bar-funds');
    const barCash = document.getElementById('bar-cash');
    const barRetirement = document.getElementById('bar-retirement');

    const pctStocks = document.getElementById('pct-stocks');
    const pctFunds = document.getElementById('pct-funds');
    const pctCash = document.getElementById('pct-cash');
    const pctRetirement = document.getElementById('pct-retirement');

    if (!gradeEl) return;

    const doctorResult = FinanceEngine.auditPortfolioRisk(portfolio);

    gradeEl.textContent = doctorResult.diversificationGrade;
    if (labelEl) {
      labelEl.textContent = doctorResult.riskLabel;
      labelEl.className = `font-bold ${doctorResult.statusColor}`;
    }

    const { stocksPct, fundsPct, cashPct, retirementPct } = doctorResult.breakdown;

    if (barStocks) barStocks.style.width = `${stocksPct}%`;
    if (barFunds) barFunds.style.width = `${fundsPct}%`;
    if (barCash) barCash.style.width = `${cashPct}%`;
    if (barRetirement) barRetirement.style.width = `${retirementPct}%`;

    if (pctStocks) pctStocks.textContent = `${stocksPct}%`;
    if (pctFunds) pctFunds.textContent = `${fundsPct}%`;
    if (pctCash) pctCash.textContent = `${cashPct}%`;
    if (pctRetirement) pctRetirement.textContent = `${retirementPct}%`;

    if (findingsEl) {
      findingsEl.innerHTML = doctorResult.findings.map(f => `
        <div class="flex items-start gap-2">
          <span class="text-blue-500 font-bold shrink-0">•</span>
          <span>${f}</span>
        </div>
      `).join('');
    }
  }

  // 6. Weekly Newsletter & CSV Export Handler
  function wireNewsletterAndExport() {
    const newsletterForm = document.getElementById('newsletter-form');
    const emailInput = document.getElementById('newsletter-email-input');

    if (newsletterForm && emailInput) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim().toLowerCase();

        if (!email || !email.includes('@') || !email.includes('.')) {
          showToast('Please enter a valid email address.', 'error');
          return;
        }

        try {
          const key = 'smartfinance_subscribers';
          const existing = JSON.parse(localStorage.getItem(key) || '[]');
          
          if (!existing.some(sub => sub.email === email)) {
            existing.push({
              email,
              subscribedAt: new Date().toISOString()
            });
            localStorage.setItem(key, JSON.stringify(existing));
          }

          emailInput.value = '';
          showToast('🎉 You are subscribed! Check your inbox this Sunday for the AI Wealth Briefing.', 'success');
        } catch (err) {
          showToast('Subscribed successfully!', 'success');
        }
      });
    }

    const exportBtn = document.getElementById('export-subscribers-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const key = 'smartfinance_subscribers';
        const subscribers = JSON.parse(localStorage.getItem(key) || '[]');

        if (subscribers.length === 0) {
          showToast('No subscribers recorded yet in this browser.', 'error');
          return;
        }

        let csv = 'Email,SubscribedAt\n';
        subscribers.forEach(s => {
          csv += `"${s.email}","${s.subscribedAt}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `smartfinance_subscribers_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(`Exported ${subscribers.length} subscribers to CSV!`, 'success');
      });
    }
  }

  function populateDashboard(results) {
    const { budget, runway, debt, portfolio, healthScore, aiReport } = results;

    // Health Score
    document.getElementById('health-score-val').textContent = healthScore.score;
    document.getElementById('health-grade-val').textContent = healthScore.grade;
    document.getElementById('health-label-val').textContent = healthScore.gradeLabel;
    document.getElementById('health-grade-val').className = `text-4xl font-extrabold ${healthScore.colorClass}`;

    // Metric Badges
    document.getElementById('metric-income').textContent = `${currentCurrency}${budget.totalIncome.toLocaleString()}/mo`;
    document.getElementById('metric-savings').textContent = `${currentCurrency}${budget.actual.savings.toLocaleString()}/mo`;
    document.getElementById('metric-runway').textContent = `${runway.months} Months`;
    document.getElementById('metric-runway-status').textContent = runway.status;
    document.getElementById('metric-runway-status').className = `text-xs font-semibold ${runway.color}`;

    // Net Worth & Portfolio Highlights Block
    if (portfolio) {
      document.getElementById('stat-total-invested').textContent = `${currentCurrency}${portfolio.totalInvested.toLocaleString()}`;
      document.getElementById('stat-monthly-sip').textContent = `${currentCurrency}${portfolio.monthlyContribution.toLocaleString()}/mo`;
      document.getElementById('stat-liquid-retirement').textContent = `${currentCurrency}${(portfolio.liquid + portfolio.retirement).toLocaleString()}`;

      const netWorthEl = document.getElementById('stat-net-worth');
      if (portfolio.netWorth < 0) {
        netWorthEl.textContent = `-${currentCurrency}${Math.abs(portfolio.netWorth).toLocaleString()}`;
        netWorthEl.className = 'text-lg font-bold text-red-600';
      } else {
        netWorthEl.textContent = `${currentCurrency}${portfolio.netWorth.toLocaleString()}`;
        netWorthEl.className = 'text-lg font-bold text-gradient';
      }

      const netWorthBadge = document.getElementById('net-worth-badge');
      if (portfolio.isPositiveNetWorth) {
        netWorthBadge.textContent = 'Positive Net Worth 🚀';
        netWorthBadge.className = 'text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold';
      } else {
        netWorthBadge.textContent = 'Debt Exceeds Assets ⚠️';
        netWorthBadge.className = 'text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold';
      }
    }

    // Executive Summary
    document.getElementById('executive-summary-text').innerHTML = marked(aiReport.executiveSummary);

    // Debt Payoff Card Highlights
    if (debt?.hasDebt) {
      document.getElementById('debt-summary-block').classList.remove('hidden');
      document.getElementById('stat-total-debt').textContent = `${currentCurrency}${debt.totalBalance.toLocaleString()}`;
      document.getElementById('stat-debt-months').textContent = `${debt.avalanche.months} Months`;
      document.getElementById('stat-interest-saved').textContent = `${currentCurrency}${debt.interestSaved.toLocaleString()}`;
      document.getElementById('stat-faster').textContent = `${debt.monthsFaster} Months`;
    } else {
      document.getElementById('debt-summary-block').classList.add('hidden');
    }

    // Render AI Roadmap Phases
    renderRoadmapPhase('phase-1-container', aiReport.phase1);
    renderRoadmapPhase('phase-2-container', aiReport.phase2);
    renderRoadmapPhase('phase-3-container', aiReport.phase3);

    // Initialize/Update 6 Revenue Monetization Tools
    // Sync SIP slider with user's Step 4 monthly investment if available
    const monthlyContrib = Number(document.getElementById('inv-monthly-contrib')?.value) || 500;
    const sipSlider = document.getElementById('sip-monthly-slider');
    if (sipSlider && Number(sipSlider.value) === 500 && monthlyContrib > 0) {
      sipSlider.value = monthlyContrib;
    }

    updateSIPCalculator();
    updateCreditCards(results.budget.actual);
    
    // Sync Loan Prepayment with user's debt balance if available
    if (debt?.hasDebt && debt.totalBalance > 0) {
      const loanPrincInput = document.getElementById('loan-prep-principal');
      if (loanPrincInput) loanPrincInput.value = debt.totalBalance;
    }
    updateLoanPrepayment();

    updateTaxOptimizer(budget.totalIncome * 12);
    if (portfolio) {
      updatePortfolioDoctor(portfolio);
    }
  }

  function renderRoadmapPhase(containerId, phase) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let actionsHtml = phase.actions.map(a => `
      <div class="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 flex items-start gap-3 transition hover:bg-slate-50">
        <div class="p-2 bg-emerald-100 text-emerald-700 rounded-lg mt-0.5 shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-1 mb-1">
            <h5 class="text-sm font-semibold text-slate-900">${a.title}</h5>
            <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">${a.urgency}</span>
          </div>
          <p class="text-xs text-slate-600 leading-relaxed">${a.detail}</p>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div>
          <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">${phase.badge}</span>
          <h4 class="text-base font-bold text-slate-900">${phase.title}</h4>
        </div>
      </div>
      <p class="text-xs text-slate-500 mb-4 leading-relaxed">${phase.description}</p>
      <div class="space-y-2.5">${actionsHtml}</div>
    `;
  }

  // Affiliate Card Rendering
  async function renderAffiliateCards(results) {
    const container = document.getElementById('affiliates-cards-container');
    if (!container) return;

    let affiliates = [
      {
        id: "hysa_savings",
        category: "High-Yield Savings",
        badge: "High Priority",
        title: "High-Yield Cash Reserve (4.5% - 5.1% APY)",
        description: "Standard checking accounts pay 0.01%. Transferring your emergency fund to a top-tier HYSA earns risk-free interest annually with full deposit insurance.",
        ctaText: "Compare Top 5% APY Accounts",
        affiliateUrl: "https://example.com/affiliate-hysa?ref=aifinance",
        tag: "Zero Risk • High Yield"
      },
      {
        id: "debt_consolidation",
        category: "Debt Relief",
        badge: "Save Interest",
        title: "Low-Rate Personal Consolidation Loan",
        description: "If your credit card interest is 20-28% APR, consolidating into a single fixed loan at 7-11% APR can slash monthly finance fees and save thousands.",
        ctaText: "Check Pre-Qualified Rates",
        affiliateUrl: "https://example.com/affiliate-refinance?ref=aifinance",
        tag: "Single-Digit Fixed APR"
      },
      {
        id: "budget_tracker",
        category: "Smart Budgeting",
        badge: "Free Tool",
        title: "Automated Budget & Subscription Tracker",
        description: "Cancel forgotten subscriptions and automatically categorize your monthly expenses with a secure, zero-friction financial dashboard.",
        ctaText: "Get Free Tracker App",
        affiliateUrl: "https://example.com/affiliate-budget-app?ref=aifinance",
        tag: "100% Free Plan"
      },
      {
        id: "brokerage_invest",
        category: "Wealth Building",
        badge: "Long Term",
        title: "Zero-Commission Automated Investing",
        description: "Put your long-term savings to work with fractional shares, index funds, and automatic dividend reinvesting with bonus welcome incentives.",
        ctaText: "Claim Free Stock & Start",
        affiliateUrl: "https://example.com/affiliate-brokerage?ref=aifinance",
        tag: "Zero Commission"
      }
    ];

    // Try fetching custom config if available via web server
    try {
      const res = await fetch('affiliates-config.json');
      if (res.ok) {
        const json = await res.json();
        if (json.affiliates) affiliates = json.affiliates;
      }
    } catch (e) {
      // Fallback works automatically
    }

    container.innerHTML = affiliates.map(item => `
      <div class="glass-card glass-card-interactive p-5 flex flex-col justify-between bg-white border border-slate-200">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full badge-emerald">${item.category}</span>
            <span class="text-[10px] font-medium text-slate-500">${item.tag}</span>
          </div>
          <h4 class="text-base font-bold text-slate-900 mb-2">${item.title}</h4>
          <p class="text-xs text-slate-600 leading-relaxed mb-4">${item.description}</p>
        </div>
        <div>
          <a href="${item.affiliateUrl}" target="_blank" rel="noopener noreferrer" 
             class="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide transition shadow-sm hover:shadow">
            <span>${item.ctaText}</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </a>
          <p class="text-[10px] text-slate-400 text-center mt-2 font-medium">Free to explore • Verified partner</p>
        </div>
      </div>
    `).join('');
  }

  // Restart & Recalculate
  restartBtn.addEventListener('click', () => {
    resultsDashboard.classList.add('hidden');
    intakeSection.classList.remove('hidden');
    currentStep = 1;
    updateWizardUI();
  });

  // Print / Save as PDF
  printPdfBtn.addEventListener('click', () => {
    window.print();
  });

  // Minimal Markdown parser helper
  function marked(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-slate-700">$1</em>')
      .replace(/\n\n/g, '<br><br>');
  }

  // Legal Modals Handling (Production Readiness)
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  };

  // Live Stock Tracker Initialization & Modal Wire-ups
  const openAddStockBtn = document.getElementById('open-add-stock-modal-btn');
  if (openAddStockBtn) {
    openAddStockBtn.addEventListener('click', () => window.openModal('add-stock-modal'));
  }

  const openStockFromStep4Btn = document.getElementById('open-stock-modal-from-step4-btn');
  if (openStockFromStep4Btn) {
    openStockFromStep4Btn.addEventListener('click', () => window.openModal('add-stock-modal'));
  }

  document.querySelectorAll('.open-add-stock-btn').forEach(btn => {
    btn.addEventListener('click', () => window.openModal('add-stock-modal'));
  });

  // Wire Interactive Listeners for 6 Revenue Tools
  const sipMonthlySlider = document.getElementById('sip-monthly-slider');
  const sipRateSlider = document.getElementById('sip-rate-slider');
  const sipYearsSlider = document.getElementById('sip-years-slider');

  if (sipMonthlySlider) sipMonthlySlider.addEventListener('input', updateSIPCalculator);
  if (sipRateSlider) sipRateSlider.addEventListener('input', updateSIPCalculator);
  if (sipYearsSlider) sipYearsSlider.addEventListener('input', updateSIPCalculator);

  const loanPrepPrinc = document.getElementById('loan-prep-principal');
  const loanPrepRate = document.getElementById('loan-prep-rate');
  const loanPrepTenure = document.getElementById('loan-prep-tenure');

  if (loanPrepPrinc) loanPrepPrinc.addEventListener('input', updateLoanPrepayment);
  if (loanPrepRate) loanPrepRate.addEventListener('input', updateLoanPrepayment);
  if (loanPrepTenure) loanPrepTenure.addEventListener('input', updateLoanPrepayment);

  wireNewsletterAndExport();

  // Initialize Stock Tracker Module
  if (window.StockTracker) {
    window.StockTracker.init();
    window.StockTracker.setCurrency(currentCurrency, currencySelect.value);

    // Sync stock changes to Step 4 input and Dashboard Net Worth
    window.StockTracker.onPortfolioChange((val) => {
      const invStocksInput = document.getElementById('inv-stocks');
      if (invStocksInput && val.count > 0) {
        invStocksInput.value = val.totalCurrentValue;
      }

      // If results dashboard is active, re-calculate and re-populate Net Worth
      if (calculationResults && calculationResults.portfolio) {
        const currentStocks = val.count > 0 ? val.totalCurrentValue : (Number(invStocksInput?.value) || 0);
        calculationResults.portfolio.stocks = currentStocks;
        const totalInvested = currentStocks + calculationResults.portfolio.mutualFunds + calculationResults.portfolio.retirement + calculationResults.portfolio.otherAssets;
        calculationResults.portfolio.totalInvested = totalInvested;
        calculationResults.portfolio.netWorth = (calculationResults.portfolio.liquidSavings + totalInvested) - calculationResults.portfolio.totalDebt;
        
        populateDashboard(calculationResults);
      }
    });
  }
});
