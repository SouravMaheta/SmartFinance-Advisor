"""
AI Finance Advisor - Local Development & Live Stock Quotes Server
Serves static frontend files and proxies real-time exchange quotes from NSE & NASDAQ with zero CORS issues.
No extra pip packages required - uses Python standard library.
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import json
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Standard symbol mappings for Indian equities
INDIAN_STOCKS = {
    'RELIANCE': 'RELIANCE.NS',
    'TCS': 'TCS.NS',
    'HDFCBANK': 'HDFCBANK.NS',
    'INFY': 'INFY.NS',
    'ICICIBANK': 'ICICIBANK.NS',
    'TATAMOTORS': 'TATAMOTORS.NS',
    'ITC': 'ITC.NS',
    'SBIN': 'SBIN.NS',
    'BHARTIARTL': 'BHARTIARTL.NS',
    'LT': 'LT.NS',
    'HINDUNILVR': 'HINDUNILVR.NS',
    'BAJFINANCE': 'BAJFINANCE.NS',
    'WIPRO': 'WIPRO.NS',
    'TITAN': 'TITAN.NS',
    'MARUTI': 'MARUTI.NS',
    'KOTAKBANK': 'KOTAKBANK.NS'
}

def fetch_live_quote(symbol):
    clean_sym = symbol.strip().upper()
    
    # Check if Indian stock without extension
    if clean_sym in INDIAN_STOCKS:
        query_sym = INDIAN_STOCKS[clean_sym]
    elif not ('.' in clean_sym or '=' in clean_sym or '^' in clean_sym) and clean_sym.endswith('NS'):
        query_sym = clean_sym
    else:
        query_sym = clean_sym

    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{urllib.parse.quote(query_sym)}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    with urllib.request.urlopen(req, timeout=5) as response:
        data = json.loads(response.read().decode('utf-8'))
        result = data.get('chart', {}).get('result', [])
        if not result:
            raise ValueError(f"No market data found for {symbol}")
        
        meta = result[0].get('meta', {})
        current_price = meta.get('regularMarketPrice', 0.0)
        prev_close = meta.get('chartPreviousClose', current_price)
        currency = meta.get('currency', 'USD')

        day_change_amt = current_price - prev_close
        day_change_pct = (day_change_amt / prev_close * 100) if prev_close > 0 else 0.0

        return {
            'symbol': clean_sym,
            'querySymbol': query_sym,
            'price': round(current_price, 2),
            'prevClose': round(prev_close, 2),
            'dayChangeAmt': round(day_change_amt, 2),
            'dayChangePct': round(day_change_pct, 2),
            'currency': currency,
            'timestamp': meta.get('regularMarketTime'),
            'source': 'Live Exchange'
        }

class LiveFinanceHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # Handle /api/quote?symbol=XYZ
        if parsed.path == '/api/quote':
            query_params = urllib.parse.parse_qs(parsed.query)
            symbol = query_params.get('symbol', [''])[0]
            
            if not symbol:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': 'Missing symbol parameter'}).encode('utf-8'))
                return

            try:
                quote_data = fetch_live_quote(symbol)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps(quote_data).encode('utf-8'))
            except Exception as e:
                self.send_response(502)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e), 'symbol': symbol}).encode('utf-8'))
            return

        # Default static file serving
        return super().do_GET()

if __name__ == '__main__':
    if sys.platform == 'win32':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    with socketserver.TCPServer(("", PORT), LiveFinanceHandler) as httpd:
        print(f"============================================================")
        print(f"[+] AI Finance Advisor Live Server running at http://localhost:{PORT}")
        print(f"[+] Live Quotes Proxy active at http://localhost:{PORT}/api/quote?symbol=TCS")
        print(f"Press Ctrl+C to stop the server.")
        print(f"============================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped cleanly.")
            sys.exit(0)
