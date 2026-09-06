// Vercel / Netlify Serverless Function for Live Stock Quotes
export default async function handler(req, res) {
  const { symbol } = req.query;
  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol parameter' });
  }

  const cleanSym = symbol.trim().toUpperCase();
  const indianMap = {
    RELIANCE: 'RELIANCE.NS',
    TCS: 'TCS.NS',
    HDFCBANK: 'HDFCBANK.NS',
    INFY: 'INFY.NS',
    ICICIBANK: 'ICICIBANK.NS',
    TATAMOTORS: 'TATAMOTORS.NS',
    ITC: 'ITC.NS',
    SBIN: 'SBIN.NS',
    BHARTIARTL: 'BHARTIARTL.NS',
    LT: 'LT.NS',
    HINDUNILVR: 'HINDUNILVR.NS',
    BAJFINANCE: 'BAJFINANCE.NS',
    WIPRO: 'WIPRO.NS',
    TITAN: 'TITAN.NS'
  };

  const querySym = indianMap[cleanSym] || cleanSym;
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
