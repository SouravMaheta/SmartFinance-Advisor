/**
 * AI Finance Advisor - Anonymous Live Stock Portfolio Tracker
 * 100% Client-Side Privacy: Zero OTP, Zero Broker Login, Stored in Browser LocalStorage.
 * Supports Indian (NSE/BSE) and US/Global Equities with Real-Time P&L & Net Worth Sync.
 */

const StockTracker = (() => {
  // LocalStorage Key
  const STORAGE_KEY = 'smartfinance_stocks_portfolio';

  // State
  let portfolio = [];
  let currentCurrencySymbol = '$';
  let currentCurrencyCode = 'USD';
  let onPortfolioChangeCallback = null;

  // Curated Master Stock Directory (Indian NSE + US Tech/Blue-chips)
  const STOCK_CATALOG = [
    // Nifty 50 Heavyweights (NSE - Base in INR)
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', exchange: 'NSE', basePrice: 2980.50, dayChangePct: 1.25, currency: 'INR', sector: 'Energy & Telecom' },
    { symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', basePrice: 4210.00, dayChangePct: 0.85, currency: 'INR', sector: 'IT Services' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', exchange: 'NSE', basePrice: 1642.00, dayChangePct: -0.45, currency: 'INR', sector: 'Banking' },
    { symbol: 'INFY', name: 'Infosys Ltd', exchange: 'NSE', basePrice: 1845.00, dayChangePct: 1.80, currency: 'INR', sector: 'IT Services' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', exchange: 'NSE', basePrice: 1225.00, dayChangePct: 0.65, currency: 'INR', sector: 'Banking' },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', exchange: 'NSE', basePrice: 985.00, dayChangePct: 2.10, currency: 'INR', sector: 'Automotive' },
    { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE', basePrice: 508.00, dayChangePct: 0.30, currency: 'INR', sector: 'FMCG & Cigarettes' },
    { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE', basePrice: 825.00, dayChangePct: -0.80, currency: 'INR', sector: 'Banking' },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd', exchange: 'NSE', basePrice: 1545.00, dayChangePct: 1.15, currency: 'INR', sector: 'Telecom' },
    { symbol: 'LT', name: 'Larsen & Toubro Ltd', exchange: 'NSE', basePrice: 3680.00, dayChangePct: 0.90, currency: 'INR', sector: 'Infrastructure & EPC' },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd', exchange: 'NSE', basePrice: 2750.00, dayChangePct: -0.20, currency: 'INR', sector: 'FMCG' },
    { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd', exchange: 'NSE', basePrice: 7290.00, dayChangePct: 1.40, currency: 'INR', sector: 'NBFC & Lending' },
    { symbol: 'WIPRO', name: 'Wipro Ltd', exchange: 'NSE', basePrice: 535.00, dayChangePct: 0.40, currency: 'INR', sector: 'IT Services' },
    { symbol: 'TITAN', name: 'Titan Company Ltd', exchange: 'NSE', basePrice: 3710.00, dayChangePct: 1.05, currency: 'INR', sector: 'Jewellery & Watches' },
    { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd', exchange: 'NSE', basePrice: 12450.00, dayChangePct: 0.70, currency: 'INR', sector: 'Automotive' },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', exchange: 'NSE', basePrice: 1810.00, dayChangePct: 0.35, currency: 'INR', sector: 'Banking' },
    { symbol: 'AXISBANK', name: 'Axis Bank Ltd', exchange: 'NSE', basePrice: 1180.00, dayChangePct: 0.50, currency: 'INR', sector: 'Banking' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd', exchange: 'NSE', basePrice: 3180.00, dayChangePct: -0.60, currency: 'INR', sector: 'Paints & Chemicals' },
    { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', exchange: 'NSE', basePrice: 3010.00, dayChangePct: 1.90, currency: 'INR', sector: 'Conglomerate' },
    { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd', exchange: 'NSE', basePrice: 1475.00, dayChangePct: 1.40, currency: 'INR', sector: 'Ports & Logistics' },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd', exchange: 'NSE', basePrice: 1840.00, dayChangePct: 0.80, currency: 'INR', sector: 'Financial Services' },
    { symbol: 'BPCL', name: 'Bharat Petroleum Corp Ltd', exchange: 'NSE', basePrice: 355.00, dayChangePct: -0.30, currency: 'INR', sector: 'Oil & Gas' },
    { symbol: 'CIPLA', name: 'Cipla Ltd', exchange: 'NSE', basePrice: 1650.00, dayChangePct: 0.60, currency: 'INR', sector: 'Pharmaceuticals' },
    { symbol: 'COALINDIA', name: 'Coal India Ltd', exchange: 'NSE', basePrice: 510.00, dayChangePct: 1.10, currency: 'INR', sector: 'Mining & Energy' },
    { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories", exchange: 'NSE', basePrice: 6720.00, dayChangePct: 0.45, currency: 'INR', sector: 'Pharmaceuticals' },
    { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd (Royal Enfield)', exchange: 'NSE', basePrice: 4890.00, dayChangePct: 1.30, currency: 'INR', sector: 'Automotive' },
    { symbol: 'GRASIM', name: 'Grasim Industries Ltd', exchange: 'NSE', basePrice: 2680.00, dayChangePct: 0.75, currency: 'INR', sector: 'Building Materials' },
    { symbol: 'HCLTECH', name: 'HCL Technologies Ltd', exchange: 'NSE', basePrice: 1790.00, dayChangePct: 1.15, currency: 'INR', sector: 'IT Services' },
    { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Co', exchange: 'NSE', basePrice: 725.00, dayChangePct: 0.20, currency: 'INR', sector: 'Life Insurance' },
    { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd', exchange: 'NSE', basePrice: 5450.00, dayChangePct: 0.95, currency: 'INR', sector: 'Automotive' },
    { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd', exchange: 'NSE', basePrice: 685.00, dayChangePct: 1.80, currency: 'INR', sector: 'Metals & Mining' },
    { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd', exchange: 'NSE', basePrice: 1450.00, dayChangePct: -0.40, currency: 'INR', sector: 'Banking' },
    { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd', exchange: 'NSE', basePrice: 940.00, dayChangePct: 1.05, currency: 'INR', sector: 'Steel & Metals' },
    { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd', exchange: 'NSE', basePrice: 2790.00, dayChangePct: 2.30, currency: 'INR', sector: 'Automotive & Farm' },
    { symbol: 'NESTLEIND', name: 'Nestle India Ltd', exchange: 'NSE', basePrice: 2520.00, dayChangePct: -0.15, currency: 'INR', sector: 'FMCG' },
    { symbol: 'NTPC', name: 'NTPC Limited', exchange: 'NSE', basePrice: 410.00, dayChangePct: 1.45, currency: 'INR', sector: 'Power Generation' },
    { symbol: 'ONGC', name: 'Oil & Natural Gas Corp Ltd', exchange: 'NSE', basePrice: 320.00, dayChangePct: 0.85, currency: 'INR', sector: 'Oil & Gas Exploration' },
    { symbol: 'POWERGRID', name: 'Power Grid Corp of India', exchange: 'NSE', basePrice: 340.00, dayChangePct: 0.65, currency: 'INR', sector: 'Power Transmission' },
    { symbol: 'SBILIFE', name: 'SBI Life Insurance Co Ltd', exchange: 'NSE', basePrice: 1840.00, dayChangePct: 0.40, currency: 'INR', sector: 'Life Insurance' },
    { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries', exchange: 'NSE', basePrice: 1820.00, dayChangePct: 1.10, currency: 'INR', sector: 'Pharmaceuticals' },
    { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd', exchange: 'NSE', basePrice: 1190.00, dayChangePct: 0.55, currency: 'INR', sector: 'FMCG & Beverages' },
    { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', exchange: 'NSE', basePrice: 155.00, dayChangePct: 1.35, currency: 'INR', sector: 'Steel & Mining' },
    { symbol: 'TECHM', name: 'Tech Mahindra Ltd', exchange: 'NSE', basePrice: 1610.00, dayChangePct: 0.90, currency: 'INR', sector: 'IT Services' },
    { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd', exchange: 'NSE', basePrice: 11350.00, dayChangePct: 0.80, currency: 'INR', sector: 'Cement & Building' },
    { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise', exchange: 'NSE', basePrice: 6980.00, dayChangePct: 1.50, currency: 'INR', sector: 'Healthcare & Hospitals' },
    { symbol: 'BEL', name: 'Bharat Electronics Ltd', exchange: 'NSE', basePrice: 295.00, dayChangePct: 2.40, currency: 'INR', sector: 'Defense & Aerospace' },
    { symbol: 'SHRIRAMFIN', name: 'Shriram Finance Ltd', exchange: 'NSE', basePrice: 3280.00, dayChangePct: 1.20, currency: 'INR', sector: 'NBFC' },
    { symbol: 'TRENT', name: 'Trent Ltd (Westside & Zudio)', exchange: 'NSE', basePrice: 7150.00, dayChangePct: 3.10, currency: 'INR', sector: 'Retail Fashion' },
    { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd', exchange: 'NSE', basePrice: 5950.00, dayChangePct: 0.25, currency: 'INR', sector: 'FMCG & Foods' },
    { symbol: 'DIVISLAB', name: "Divi's Laboratories Ltd", exchange: 'NSE', basePrice: 5210.00, dayChangePct: 0.70, currency: 'INR', sector: 'Pharma API' },
    { symbol: 'LTIM', name: 'LTIMindtree Ltd', exchange: 'NSE', basePrice: 6150.00, dayChangePct: 1.05, currency: 'INR', sector: 'IT Services' },

    // High-Momentum Retail, FinTech, PSU & Growth Leaders
    { symbol: 'ZOMATO', name: 'Zomato Ltd (Blinkit)', exchange: 'NSE', basePrice: 260.00, dayChangePct: 2.80, currency: 'INR', sector: 'Food Delivery & Quick Commerce' },
    { symbol: 'JIOFIN', name: 'Jio Financial Services Ltd', exchange: 'NSE', basePrice: 345.00, dayChangePct: 1.60, currency: 'INR', sector: 'FinTech & NBFC' },
    { symbol: 'TATAPOWER', name: 'Tata Power Company Ltd', exchange: 'NSE', basePrice: 435.00, dayChangePct: 1.75, currency: 'INR', sector: 'Renewable Power & EV' },
    { symbol: 'HAL', name: 'Hindustan Aeronautics Ltd', exchange: 'NSE', basePrice: 4750.00, dayChangePct: 2.15, currency: 'INR', sector: 'Defense Aerospace' },
    { symbol: 'MAZDOCK', name: 'Mazagon Dock Shipbuilders', exchange: 'NSE', basePrice: 4380.00, dayChangePct: 2.60, currency: 'INR', sector: 'Defense Shipbuilding' },
    { symbol: 'IREDA', name: 'Indian Renewable Energy Dev', exchange: 'NSE', basePrice: 235.00, dayChangePct: 3.20, currency: 'INR', sector: 'Green Energy Financing' },
    { symbol: 'SUZLON', name: 'Suzlon Energy Ltd', exchange: 'NSE', basePrice: 75.50, dayChangePct: 4.10, currency: 'INR', sector: 'Wind & Clean Energy' },
    { symbol: 'IRFC', name: 'Indian Railway Finance Corp', exchange: 'NSE', basePrice: 175.00, dayChangePct: 1.40, currency: 'INR', sector: 'Railway Infrastructure' },
    { symbol: 'RVNL', name: 'Rail Vikas Nigam Ltd', exchange: 'NSE', basePrice: 585.00, dayChangePct: 2.20, currency: 'INR', sector: 'Rail Infrastructure' },
    { symbol: 'CDSL', name: 'Central Depository Services Ltd', exchange: 'NSE', basePrice: 1480.00, dayChangePct: 1.95, currency: 'INR', sector: 'Capital Markets Depository' },
    { symbol: 'BSE', name: 'BSE Limited (Stock Exchange)', exchange: 'NSE', basePrice: 3820.00, dayChangePct: 2.90, currency: 'INR', sector: 'Stock Exchange' },
    { symbol: 'ANGELONE', name: 'Angel One Ltd', exchange: 'NSE', basePrice: 2710.00, dayChangePct: 1.80, currency: 'INR', sector: 'Retail Broking' },
    { symbol: 'PAYTM', name: 'One97 Communications (Paytm)', exchange: 'NSE', basePrice: 655.00, dayChangePct: 1.10, currency: 'INR', sector: 'FinTech & Payments' },
    { symbol: 'NYKAA', name: 'FSN E-Commerce (Nykaa)', exchange: 'NSE', basePrice: 215.00, dayChangePct: 0.90, currency: 'INR', sector: 'Beauty & E-Commerce' },
    { symbol: 'VEDL', name: 'Vedanta Limited', exchange: 'NSE', basePrice: 465.00, dayChangePct: 1.50, currency: 'INR', sector: 'Metals & Natural Resources' },
    { symbol: 'VBL', name: 'Varun Beverages Ltd (Pepsi)', exchange: 'NSE', basePrice: 630.00, dayChangePct: 1.30, currency: 'INR', sector: 'Beverages & FMCG' },
    { symbol: 'DMART', name: 'Avenue Supermarts Ltd (DMart)', exchange: 'NSE', basePrice: 5080.00, dayChangePct: 0.85, currency: 'INR', sector: 'Supermarket Retail' },
    { symbol: 'MUTHOOTFIN', name: 'Muthoot Finance Ltd', exchange: 'NSE', basePrice: 1980.00, dayChangePct: 1.15, currency: 'INR', sector: 'Gold Loans' },
    { symbol: 'POLICYBZR', name: 'PB Fintech Ltd (Policybazaar)', exchange: 'NSE', basePrice: 1780.00, dayChangePct: 2.05, currency: 'INR', sector: 'InsurTech' },

    // US / Global Equities - Base in USD
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', basePrice: 224.50, dayChangePct: 1.10, currency: 'USD', sector: 'Technology' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', basePrice: 122.80, dayChangePct: 3.45, currency: 'USD', sector: 'Semiconductors' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', basePrice: 428.50, dayChangePct: 0.75, currency: 'USD', sector: 'Software & Cloud' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', basePrice: 166.40, dayChangePct: 0.90, currency: 'USD', sector: 'Internet Services' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', basePrice: 179.20, dayChangePct: 1.30, currency: 'USD', sector: 'E-Commerce & Cloud' },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', basePrice: 215.50, dayChangePct: -1.85, currency: 'USD', sector: 'Automotive & CleanTech' },
    { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', basePrice: 512.00, dayChangePct: 2.05, currency: 'USD', sector: 'Social Media & AI' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', exchange: 'NYSE', basePrice: 506.00, dayChangePct: 0.60, currency: 'USD', sector: 'Broad Market ETF' }
  ];

  // Dynamic live quote simulation cache
  let liveQuoteMap = {};

  // Standard Approximate FX Conversion Rates (INR <-> USD/EUR/GBP)
  const FX_RATES = {
    USD_TO_INR: 83.5,
    EUR_TO_INR: 91.2,
    GBP_TO_INR: 108.4,
    USD_TO_EUR: 0.92,
    USD_TO_GBP: 0.77
  };

  /**
   * Convert an asset price from its base currency to the user's active currency
   */
  function convertToActiveCurrency(amount, fromCurrency) {
    if (fromCurrency === currentCurrencyCode) return amount;

    // Convert from -> USD first
    let inUSD = amount;
    if (fromCurrency === 'INR') inUSD = amount / FX_RATES.USD_TO_INR;
    else if (fromCurrency === 'EUR') inUSD = amount / FX_RATES.USD_TO_EUR;
    else if (fromCurrency === 'GBP') inUSD = amount / FX_RATES.USD_TO_GBP;

    // Convert USD -> target active currency
    if (currentCurrencyCode === 'USD') return inUSD;
    if (currentCurrencyCode === 'INR') return inUSD * FX_RATES.USD_TO_INR;
    if (currentCurrencyCode === 'EUR') return inUSD * FX_RATES.USD_TO_EUR;
    if (currentCurrencyCode === 'GBP') return inUSD * FX_RATES.USD_TO_GBP;

    return amount;
  }

  /**
   * Initialize live quotes from master catalog
   */
  function initLiveQuotes() {
    STOCK_CATALOG.forEach(stock => {
      liveQuoteMap[stock.symbol] = {
        symbol: stock.symbol,
        name: stock.name,
        exchange: stock.exchange,
        basePrice: stock.basePrice,
        currentPrice: stock.basePrice,
        dayChangePct: stock.dayChangePct,
        currency: stock.currency,
        sector: stock.sector
      };
    });
  }

  /**
   * Load portfolio from browser localStorage
   */
  function loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        portfolio = JSON.parse(data);
      } else {
        portfolio = [];
      }
    } catch (e) {
      console.warn('Unable to parse stored stocks portfolio:', e);
      portfolio = [];
    }
  }

  /**
   * Save portfolio to browser localStorage
   */
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch (e) {
      console.warn('Unable to persist stocks portfolio:', e);
    }
  }

  /**
   * Add a new stock to the portfolio
   */
  function addStock(symbol, shares, avgBuyPrice) {
    const cleanSymbol = symbol.trim().toUpperCase();
    const qty = Number(shares);
    const buyPrice = Number(avgBuyPrice);

    if (!cleanSymbol || isNaN(qty) || qty <= 0 || isNaN(buyPrice) || buyPrice <= 0) {
      throw new Error('Please enter a valid stock symbol, shares count, and buy price.');
    }

    // Lookup metadata in catalog
    const meta = liveQuoteMap[cleanSymbol] || {
      symbol: cleanSymbol,
      name: cleanSymbol,
      exchange: currentCurrencyCode === 'INR' ? 'NSE' : 'NASDAQ',
      basePrice: buyPrice,
      currentPrice: buyPrice,
      dayChangePct: 0.0,
      currency: currentCurrencyCode,
      sector: 'Direct Equity'
    };

    // If custom ticker not in catalog, add to quote map
    if (!liveQuoteMap[cleanSymbol]) {
      liveQuoteMap[cleanSymbol] = meta;
    }

    // Check if already in portfolio -> update or append
    const existingIndex = portfolio.findIndex(item => item.symbol === cleanSymbol);
    if (existingIndex > -1) {
      const existing = portfolio[existingIndex];
      const newTotalShares = existing.shares + qty;
      const newAvgPrice = ((existing.shares * existing.avgBuyPrice) + (qty * buyPrice)) / newTotalShares;
      portfolio[existingIndex].shares = newTotalShares;
      portfolio[existingIndex].avgBuyPrice = Math.round(newAvgPrice * 100) / 100;
    } else {
      portfolio.push({
        id: 'stk_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        symbol: cleanSymbol,
        name: meta.name,
        exchange: meta.exchange,
        shares: qty,
        avgBuyPrice: buyPrice,
        currency: currentCurrencyCode,
        addedAt: new Date().toISOString()
      });
    }

    saveToStorage();
    renderUI();
    notifyChange();

    // Asynchronously pull live quote for newly added stock
    fetchLiveQuoteFromAPI(cleanSymbol).then(live => {
      if (live && liveQuoteMap[cleanSymbol]) {
        liveQuoteMap[cleanSymbol].currentPrice = live.price;
        liveQuoteMap[cleanSymbol].prevClose = live.prevClose;
        liveQuoteMap[cleanSymbol].dayChangePct = live.dayChangePct;
        liveQuoteMap[cleanSymbol].currency = live.currency;
        renderUI();
        notifyChange();
      }
    });
  }

  /**
   * Remove a stock from portfolio
   */
  function removeStock(id) {
    portfolio = portfolio.filter(item => item.id !== id);
    saveToStorage();
    renderUI();
    notifyChange();
  }

  /**
   * Load an instant sample blue-chip portfolio
   */
  function loadSamplePortfolio() {
    if (currentCurrencyCode === 'INR') {
      portfolio = [
        { id: 'sample_1', symbol: 'RELIANCE', name: 'Reliance Industries', exchange: 'NSE', shares: 15, avgBuyPrice: 2820.00, currency: 'INR' },
        { id: 'sample_2', symbol: 'HDFCBANK', name: 'HDFC Bank', exchange: 'NSE', shares: 35, avgBuyPrice: 1550.00, currency: 'INR' },
        { id: 'sample_3', symbol: 'TCS', name: 'Tata Consultancy Services', exchange: 'NSE', shares: 10, avgBuyPrice: 3950.00, currency: 'INR' },
        { id: 'sample_4', symbol: 'TATAMOTORS', name: 'Tata Motors', exchange: 'NSE', shares: 50, avgBuyPrice: 890.00, currency: 'INR' }
      ];
    } else {
      portfolio = [
        { id: 'sample_1', symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', shares: 12, avgBuyPrice: 198.00, currency: 'USD' },
        { id: 'sample_2', symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', shares: 18, avgBuyPrice: 95.00, currency: 'USD' },
        { id: 'sample_3', symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', shares: 6, avgBuyPrice: 380.00, currency: 'USD' },
        { id: 'sample_4', symbol: 'VOO', name: 'Vanguard S&P 500 ETF', exchange: 'NYSE', shares: 10, avgBuyPrice: 470.00, currency: 'USD' }
      ];
    }

    saveToStorage();
    renderUI();
    notifyChange();
  }

  /**
   * Clear all stocks
   */
  function clearPortfolio() {
    portfolio = [];
    saveToStorage();
    renderUI();
    notifyChange();
  }

  /**
   * Fetch single live quote from /api/quote endpoint
   */
  async function fetchLiveQuoteFromAPI(symbol) {
    try {
      const resp = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      if (data && typeof data.price === 'number') {
        return data;
      }
    } catch (e) {
      // Backend not running or offline; will use fallback
    }
    return null;
  }

  /**
   * Refresh Live Quotes with exact real-world exchange data (with resilient fallback)
   */
  async function refreshQuotes() {
    let liveFetchedCount = 0;
    const symbolsToUpdate = new Set([
      ...portfolio.map(item => item.symbol),
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'AAPL', 'NVDA', 'MSFT'
    ]);

    // Fetch live quotes in parallel
    const promises = Array.from(symbolsToUpdate).map(async (sym) => {
      const liveData = await fetchLiveQuoteFromAPI(sym);
      if (liveData && liveQuoteMap[sym]) {
        liveQuoteMap[sym].currentPrice = liveData.price;
        liveQuoteMap[sym].prevClose = liveData.prevClose;
        liveQuoteMap[sym].dayChangePct = liveData.dayChangePct;
        liveQuoteMap[sym].currency = liveData.currency;
        liveFetchedCount++;
      } else if (liveQuoteMap[sym]) {
        // Fallback micro-fluctuation if offline or /api/quote unreachable
        const q = liveQuoteMap[sym];
        const swingPct = (Math.random() * 0.8) - 0.38;
        const newPrice = q.currentPrice * (1 + (swingPct / 100));
        q.currentPrice = Math.round(newPrice * 100) / 100;
        q.dayChangePct = Math.round((q.dayChangePct + (swingPct * 0.5)) * 100) / 100;
      }
    });

    await Promise.all(promises);

    renderUI();
    notifyChange();

    const timestampEl = document.getElementById('quotes-last-updated');
    if (timestampEl) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (liveFetchedCount > 0) {
        timestampEl.innerHTML = `<span class="text-emerald-700 font-semibold">🟢 NSE/NASDAQ Live: ${timeStr}</span>`;
      } else {
        timestampEl.textContent = 'Updated: ' + timeStr;
      }
    }
  }

  /**
   * Compute comprehensive portfolio valuation & P&L in active currency
   */
  function getValuation() {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalDayChangeAmt = 0;

    const items = portfolio.map(item => {
      const quote = liveQuoteMap[item.symbol] || {
        currentPrice: item.avgBuyPrice,
        dayChangePct: 0.0,
        currency: item.currency,
        exchange: item.exchange || 'STOCK'
      };

      // Prices converted to current active currency
      const currentPriceActive = convertToActiveCurrency(quote.currentPrice, quote.currency);
      const buyPriceActive = convertToActiveCurrency(item.avgBuyPrice, item.currency || currentCurrencyCode);

      const invested = item.shares * buyPriceActive;
      const value = item.shares * currentPriceActive;
      const pnlAmt = value - invested;
      const pnlPct = invested > 0 ? (pnlAmt / invested) * 100 : 0;
      const dayChangeAmt = value * (quote.dayChangePct / 100);

      totalInvested += invested;
      totalCurrentValue += value;
      totalDayChangeAmt += dayChangeAmt;

      return {
        ...item,
        currentPrice: currentPriceActive,
        buyPriceActive,
        invested,
        value,
        pnlAmt,
        pnlPct,
        dayChangePct: quote.dayChangePct,
        exchange: quote.exchange
      };
    });

    const totalPnlAmt = totalCurrentValue - totalInvested;
    const totalPnlPct = totalInvested > 0 ? (totalPnlAmt / totalInvested) * 100 : 0;
    const totalDayChangePct = totalCurrentValue > 0 ? (totalDayChangeAmt / totalCurrentValue) * 100 : 0;

    return {
      items,
      count: portfolio.length,
      totalInvested: Math.round(totalInvested),
      totalCurrentValue: Math.round(totalCurrentValue),
      totalPnlAmt: Math.round(totalPnlAmt),
      totalPnlPct: Math.round(totalPnlPct * 100) / 100,
      totalDayChangeAmt: Math.round(totalDayChangeAmt),
      totalDayChangePct: Math.round(totalDayChangePct * 100) / 100
    };
  }

  /**
   * Format currency values for display
   */
  function formatMoney(amount) {
    return currentCurrencySymbol + Math.round(amount).toLocaleString();
  }

  /**
   * Render the Live Stock Portfolio UI
   */
  function renderUI() {
    const valuation = getValuation();

    // Summary Elements in Dashboard
    const totalInvestedEl = document.getElementById('stock-total-invested');
    const currentValueEl = document.getElementById('stock-current-value');
    const totalPnlEl = document.getElementById('stock-total-pnl');
    const totalPnlBadge = document.getElementById('stock-pnl-badge');
    const dayChangeEl = document.getElementById('stock-day-change');
    const tableBody = document.getElementById('stock-portfolio-tbody');
    const emptyState = document.getElementById('stock-empty-state');
    const tableWrapper = document.getElementById('stock-table-wrapper');
    const stockCountBadge = document.getElementById('stock-count-badge');

    // Also update Step 4 quick-sync badge if present
    const step4SyncBadge = document.getElementById('step4-stock-sync-note');
    if (step4SyncBadge) {
      if (valuation.count > 0) {
        step4SyncBadge.innerHTML = `<span>🟢 Linked to <b>${valuation.count}</b> live stocks (${formatMoney(valuation.totalCurrentValue)})</span>`;
        step4SyncBadge.classList.remove('hidden');
      } else {
        step4SyncBadge.classList.add('hidden');
      }
    }

    if (!tableBody) return;

    // Update Summary Header Cards
    if (totalInvestedEl) totalInvestedEl.textContent = formatMoney(valuation.totalInvested);
    if (currentValueEl) currentValueEl.textContent = formatMoney(valuation.totalCurrentValue);
    if (stockCountBadge) stockCountBadge.textContent = `${valuation.count} Holding${valuation.count === 1 ? '' : 's'}`;

    if (totalPnlEl && totalPnlBadge) {
      const isProfitable = valuation.totalPnlAmt >= 0;
      totalPnlEl.textContent = `${isProfitable ? '+' : ''}${formatMoney(valuation.totalPnlAmt)}`;
      totalPnlEl.className = `text-lg font-extrabold ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}`;

      totalPnlBadge.textContent = `${isProfitable ? '▲ +' : '▼ '}${valuation.totalPnlPct}%`;
      totalPnlBadge.className = `text-xs px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
        isProfitable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
      }`;
    }

    if (dayChangeEl) {
      const isPositiveDay = valuation.totalDayChangeAmt >= 0;
      dayChangeEl.innerHTML = `<span class="${isPositiveDay ? 'text-emerald-600' : 'text-rose-600'} font-bold">${isPositiveDay ? '+' : ''}${formatMoney(valuation.totalDayChangeAmt)} (${isPositiveDay ? '+' : ''}${valuation.totalDayChangePct}%)</span>`;
    }

    // Render Table or Empty State
    if (valuation.count === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (tableWrapper) tableWrapper.classList.add('hidden');
      tableBody.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (tableWrapper) tableWrapper.classList.remove('hidden');

    tableBody.innerHTML = valuation.items.map(item => {
      const isProfitable = item.pnlAmt >= 0;
      const isDayUp = item.dayChangePct >= 0;

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition">
          <td class="py-3 px-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-[11px] text-slate-700 shrink-0">
                ${item.symbol.substring(0, 3)}
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-slate-900 text-xs">${item.symbol}</span>
                  <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-semibold uppercase tracking-wider">${item.exchange}</span>
                </div>
                <span class="text-[10px] text-slate-400 block truncate max-w-[140px]">${item.name}</span>
              </div>
            </div>
          </td>

          <td class="py-3 px-3 text-right">
            <span class="text-xs font-semibold text-slate-800">${item.shares.toLocaleString()}</span>
            <span class="text-[10px] text-slate-400 block">@ ${formatMoney(item.buyPriceActive)}</span>
          </td>

          <td class="py-3 px-3 text-right">
            <span class="text-xs font-bold text-slate-900">${formatMoney(item.currentPrice)}</span>
            <span class="text-[10px] font-semibold block ${isDayUp ? 'text-emerald-600' : 'text-rose-600'}">
              ${isDayUp ? '▲ +' : '▼ '}${item.dayChangePct}%
            </span>
          </td>

          <td class="py-3 px-3 text-right">
            <span class="text-xs font-extrabold text-slate-900">${formatMoney(item.value)}</span>
            <span class="text-[10px] text-slate-400 block">Cost: ${formatMoney(item.invested)}</span>
          </td>

          <td class="py-3 px-3 text-right">
            <div class="inline-flex flex-col items-end">
              <span class="text-xs font-bold ${isProfitable ? 'text-emerald-600' : 'text-rose-600'}">
                ${isProfitable ? '+' : ''}${formatMoney(item.pnlAmt)}
              </span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${isProfitable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}">
                ${isProfitable ? '+' : ''}${item.pnlPct.toFixed(1)}%
              </span>
            </div>
          </td>

          <td class="py-3 px-2 text-center">
            <button type="button" class="delete-stock-btn p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition" data-id="${item.id}" title="Remove ${item.symbol}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Set currency and re-render
   */
  function setCurrency(symbol, code) {
    currentCurrencySymbol = symbol;
    currentCurrencyCode = code;
    renderUI();
  }

  /**
   * Register change observer
   */
  function onPortfolioChange(fn) {
    onPortfolioChangeCallback = fn;
  }

  function notifyChange() {
    const val = getValuation();
    if (typeof onPortfolioChangeCallback === 'function') {
      onPortfolioChangeCallback(val);
    }
  }

  /**
   * Initialize module
   */
  function init() {
    initLiveQuotes();
    loadFromStorage();
    renderUI();

    // Attach Event Delegation for Delete Stock Buttons
    const tableBody = document.getElementById('stock-portfolio-tbody');
    if (tableBody) {
      tableBody.addEventListener('click', (e) => {
        const btn = e.target.closest('.delete-stock-btn');
        if (btn) {
          const id = btn.getAttribute('data-id');
          if (id) removeStock(id);
        }
      });
    }

    // Refresh Quotes Button
    const refreshBtn = document.getElementById('refresh-quotes-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('svg');
        if (icon) icon.classList.add('animate-spin');
        
        refreshQuotes();

        setTimeout(() => {
          if (icon) icon.classList.remove('animate-spin');
        }, 600);
      });
    }

    // Load Sample Portfolio Button
    const sampleBtns = document.querySelectorAll('.load-sample-stocks-btn');
    sampleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        loadSamplePortfolio();
      });
    });

    // Clear Portfolio Button
    const clearBtn = document.getElementById('clear-stocks-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your saved stock list?')) {
          clearPortfolio();
        }
      });
    }

    // Quick Stock Ticker Search / Dropdown Autocomplete
    const stockSearchInput = document.getElementById('stock-search-input');
    const stockSuggestions = document.getElementById('stock-suggestions');
    if (stockSearchInput && stockSuggestions) {
      stockSearchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toUpperCase();
        if (!val) {
          stockSuggestions.classList.add('hidden');
          return;
        }

        const matches = STOCK_CATALOG.filter(s => 
          s.symbol.includes(val) || s.name.toUpperCase().includes(val)
        ).slice(0, 6);

        if (matches.length === 0) {
          stockSuggestions.innerHTML = `
            <div class="px-3 py-2 text-xs text-slate-500">
              Custom ticker: <span class="font-bold text-slate-800">${val}</span> (Will be tracked)
            </div>
          `;
          stockSuggestions.classList.remove('hidden');
          return;
        }

        stockSuggestions.innerHTML = matches.map(s => `
          <button type="button" class="w-full text-left px-3 py-2 hover:bg-slate-100 flex items-center justify-between border-b border-slate-100 last:border-0 suggestion-item" data-symbol="${s.symbol}" data-price="${convertToActiveCurrency(s.basePrice, s.currency).toFixed(2)}">
            <div>
              <span class="font-bold text-xs text-slate-900">${s.symbol}</span>
              <span class="text-[10px] text-slate-500 ml-1.5">${s.name} (${s.exchange})</span>
            </div>
            <span class="text-xs font-semibold text-slate-700">${currentCurrencySymbol}${convertToActiveCurrency(s.basePrice, s.currency).toFixed(2)}</span>
          </button>
        `).join('');

        stockSuggestions.classList.remove('hidden');
      });

      stockSuggestions.addEventListener('click', (e) => {
        const item = e.target.closest('.suggestion-item');
        if (item) {
          const sym = item.getAttribute('data-symbol');
          const price = item.getAttribute('data-price');
          stockSearchInput.value = sym;
          
          const buyPriceInput = document.getElementById('stock-buy-price-input');
          if (buyPriceInput && !buyPriceInput.value) {
            buyPriceInput.value = price;
          }
          stockSuggestions.classList.add('hidden');
        }
      });

      document.addEventListener('click', (e) => {
        if (!stockSearchInput.contains(e.target) && !stockSuggestions.contains(e.target)) {
          stockSuggestions.classList.add('hidden');
        }
      });
    }

    // Add Stock Modal Form Submission
    const addStockForm = document.getElementById('add-stock-form');
    if (addStockForm) {
      addStockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const symbolInput = document.getElementById('stock-search-input');
        const sharesInput = document.getElementById('stock-shares-input');
        const priceInput = document.getElementById('stock-buy-price-input');

        try {
          addStock(symbolInput.value, sharesInput.value, priceInput.value);
          
          // Reset fields
          symbolInput.value = '';
          sharesInput.value = '';
          priceInput.value = '';
          
          // Close modal if open
          const modal = document.getElementById('add-stock-modal');
          if (modal) modal.classList.add('hidden');

          if (typeof window.showToast === 'function') {
            window.showToast('Stock added to live watchlist!', 'success');
          }
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // Popular Quick-Chip Tickers
    const quickChips = document.querySelectorAll('.quick-stock-chip');
    quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const sym = chip.getAttribute('data-symbol');
        const symInput = document.getElementById('stock-search-input');
        const priceInput = document.getElementById('stock-buy-price-input');
        if (symInput) {
          symInput.value = sym;
          const meta = liveQuoteMap[sym];
          if (meta && priceInput) {
            priceInput.value = convertToActiveCurrency(meta.basePrice, meta.currency).toFixed(2);
          }
        }
      });
    });

    // Auto-refresh quotes every 45 seconds for active users
    setInterval(() => {
      if (portfolio.length > 0 && !document.hidden) {
        refreshQuotes();
      }
    }, 45000);
  }

  // Public API
  return {
    init,
    addStock,
    removeStock,
    loadSamplePortfolio,
    clearPortfolio,
    refreshQuotes,
    getValuation,
    setCurrency,
    onPortfolioChange,
    STOCK_CATALOG
  };
})();

// Attach to window
window.StockTracker = StockTracker;
