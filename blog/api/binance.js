const BINANCE_HOSTS = [
  "https://data-api.binance.vision",
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
  "https://api4.binance.com",
];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { endpoint = "klines", symbol = "BTCUSDT", interval = "1d", limit = "300" } = req.query;

  let lastError;

  for (const host of BINANCE_HOSTS) {
    let url;
    if (endpoint === "ticker") {
      url = `${host}/api/v3/ticker/24hr?symbol=${symbol}`;
    } else {
      url = `${host}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    }

    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
      });

      if (!resp.ok) {
        lastError = `${resp.status}`;
        continue;
      }

      const data = await resp.json();

      if (data.code) {
        lastError = data.msg;
        continue;
      }

      if (endpoint === "ticker") {
        return res.status(200).json({
          symbol: data.symbol,
          price: parseFloat(data.lastPrice),
          change: parseFloat(data.priceChangePercent),
          high: parseFloat(data.highPrice),
          low: parseFloat(data.lowPrice),
          volume: parseFloat(data.volume),
        });
      }

      if (!Array.isArray(data)) {
        lastError = "Unexpected format";
        continue;
      }

      const klines = data.map((d) => ({
        open_time: new Date(d[0]).toISOString(),
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5]),
      }));

      return res.status(200).json(klines);
    } catch (e) {
      lastError = e.message;
      continue;
    }
  }

  return res.status(500).json({ error: `All Binance endpoints failed. Last error: ${lastError}` });
}
