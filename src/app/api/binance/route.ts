import { NextRequest, NextResponse } from "next/server";

// 币安行情代理（移植自旧静态站 api/binance.js）：多镜像容错
const BINANCE_HOSTS = [
  "https://data-api.binance.vision",
  "https://api1.binance.com",
  "https://api2.binance.com",
  "https://api3.binance.com",
  "https://api4.binance.com",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint") || "klines";
  const symbol = (searchParams.get("symbol") || "BTCUSDT").toUpperCase();
  const interval = searchParams.get("interval") || "1d";
  const limit = searchParams.get("limit") || "300";

  let lastError = "unknown";

  for (const host of BINANCE_HOSTS) {
    const url =
      endpoint === "ticker"
        ? `${host}/api/v3/ticker/24hr?symbol=${symbol}`
        : `${host}/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });

      if (!resp.ok) {
        lastError = `HTTP ${resp.status}`;
        continue;
      }

      const data = await resp.json();

      if (data && data.code) {
        lastError = data.msg || `code ${data.code}`;
        continue;
      }

      if (endpoint === "ticker") {
        return NextResponse.json({
          symbol: data.symbol,
          price: parseFloat(data.lastPrice),
          change: parseFloat(data.priceChangePercent),
          high: parseFloat(data.highPrice),
          low: parseFloat(data.lowPrice),
          volume: parseFloat(data.volume),
        });
      }

      if (!Array.isArray(data)) {
        lastError = "unexpected format";
        continue;
      }

      const klines = data.map((d: (string | number)[]) => ({
        open_time: new Date(Number(d[0])).toISOString(),
        open: parseFloat(String(d[1])),
        high: parseFloat(String(d[2])),
        low: parseFloat(String(d[3])),
        close: parseFloat(String(d[4])),
        volume: parseFloat(String(d[5])),
      }));

      return NextResponse.json(klines);
    } catch (e) {
      lastError = e instanceof Error ? e.message : "fetch failed";
    }
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}
