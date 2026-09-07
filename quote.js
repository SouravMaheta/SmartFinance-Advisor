// Vercel / Netlify Serverless Function for Live Stock Quotes
export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  const cleanSym = symbol.trim().toUpperCase();
  const indianMap = {
    // Nifty 50 Constituents
    RELIANCE: 'RELIANCE.NS', TCS: 'TCS.NS', HDFCBANK: 'HDFCBANK.NS', INFY: 'INFY.NS',
    ICICIBANK: 'ICICIBANK.NS', TATAMOTORS: 'TATAMOTORS.NS', ITC: 'ITC.NS', SBIN: 'SBIN.NS',
    BHARTIARTL: 'BHARTIARTL.NS', LT: 'LT.NS', HINDUNILVR: 'HINDUNILVR.NS', BAJFINANCE: 'BAJFINANCE.NS',
    WIPRO: 'WIPRO.NS', TITAN: 'TITAN.NS', ADANIENT: 'ADANIENT.NS', ADANIPORTS: 'ADANIPORTS.NS',
    ASIANPAINT: 'ASIANPAINT.NS', AXISBANK: 'AXISBANK.NS', BAJAJFINSV: 'BAJAJFINSV.NS', BPCL: 'BPCL.NS',
    CIPLA: 'CIPLA.NS', COALINDIA: 'COALINDIA.NS', DRREDDY: 'DRREDDY.NS', EICHERMOT: 'EICHERMOT.NS',
    GRASIM: 'GRASIM.NS', HCLTECH: 'HCLTECH.NS', HDFCLIFE: 'HDFCLIFE.NS', HEROMOTOCO: 'HEROMOTOCO.NS',
    HINDALCO: 'HINDALCO.NS', INDUSINDBK: 'INDUSINDBK.NS', JSWSTEEL: 'JSWSTEEL.NS', KOTAKBANK: 'KOTAKBANK.NS',
    'M&M': 'M&M.NS', MM: 'M&M.NS', MARUTI: 'MARUTI.NS', NESTLEIND: 'NESTLEIND.NS', NTPC: 'NTPC.NS',
    ONGC: 'ONGC.NS', POWERGRID: 'POWERGRID.NS', SBILIFE: 'SBILIFE.NS', SUNPHARMA: 'SUNPHARMA.NS',
    TATACONSUM: 'TATACONSUM.NS', TATASTEEL: 'TATASTEEL.NS', TECHM: 'TECHM.NS', ULTRACEMCO: 'ULTRACEMCO.NS',
    APOLLOHOSP: 'APOLLOHOSP.NS', BEL: 'BEL.NS', SHRIRAMFIN: 'SHRIRAMFIN.NS', TRENT: 'TRENT.NS',
    BRITANNIA: 'BRITANNIA.NS', DIVISLAB: 'DIVISLAB.NS', LTIM: 'LTIM.NS',
    
    // High-Momentum Retail, FinTech & PSU Leaders
    ZOMATO: 'ZOMATO.NS', JIOFIN: 'JIOFIN.NS', PAYTM: 'PAYTM.NS', NYKAA: 'NYKAA.NS',
    IREDA: 'IREDA.NS', SUZLON: 'SUZLON.NS', TATAPOWER: 'TATAPOWER.NS', IRFC: 'IRFC.NS',
    RVNL: 'RVNL.NS', CDSL: 'CDSL.NS', ANGELONE: 'ANGELONE.NS', BSE: 'BSE.NS',
    MAZDOCK: 'MAZDOCK.NS', HAL: 'HAL.NS', VEDL: 'VEDL.NS', VBL: 'VBL.NS',
    MUTHOOTFIN: 'MUTHOOTFIN.NS', POLICYBZR: 'POLICYBZR.NS', DMART: 'DMART.NS', MOTHERSON: 'MOTHERSON.NS'
  };

  const usKnown = new Set(['AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'VOO', 'SPY', 'QQQ']);
  let querySym = cleanSym;
  if (indianMap[cleanSym]) {
    querySym = indianMap[cleanSym];
  } else if (!cleanSym.includes('.') && !usKnown.has(cleanSym)) {
    querySym = cleanSym + '.NS';
  }
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(querySym)}`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) {
      return res.status(404).json({ error: 'Stock data not found', symbol });
    }

    const currentPrice = meta.regularMarketPrice || 0;
    const prevClose = meta.chartPreviousClose || currentPrice;
    const dayChangeAmt = currentPrice - prevClose;
    const dayChangePct = prevClose > 0 ? (dayChangeAmt / prevClose) * 100 : 0;

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      symbol: cleanSym,
      querySymbol: querySym,
      price: Math.round(currentPrice * 100) / 100,
      prevClose: Math.round(prevClose * 100) / 100,
      dayChangeAmt: Math.round(dayChangeAmt * 100) / 100,
      dayChangePct: Math.round(dayChangePct * 100) / 100,
      currency: meta.currency || 'USD',
      source: 'Live Exchange'
    });
  } catch (err) {
    return res.status(502).json({ error: err.message, symbol });
  }
}
