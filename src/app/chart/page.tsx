"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- ECharts 为 CDN 加载的无类型库 */
import { useEffect, useRef, useState, type ReactElement } from "react";

// 实时看盘页面 — 客户端组件（ECharts + 币安行情）
// 蓝本为旧静态站 chart.html：实时K线/行情栏/画图工具；按需求删除回测，币种支持手动输入

const API = "/api/binance";

const PRESETS: [string, string][] = [
  ["BTCUSDT", "BTC/USDT"],
  ["ETHUSDT", "ETH/USDT"],
  ["SOLUSDT", "SOL/USDT"],
  ["BNBUSDT", "BNB/USDT"],
  ["DOGEUSDT", "DOGE/USDT"],
  ["XRPUSDT", "XRP/USDT"],
  ["AVAXUSDT", "AVAX/USDT"],
  ["LINKUSDT", "LINK/USDT"],
];

const INTERVALS: [string, string][] = [
  ["1m", "1分钟"], ["3m", "3分钟"], ["5m", "5分钟"],
  ["15m", "15分钟"], ["30m", "30分钟"], ["1h", "1小时"],
  ["2h", "2小时"], ["4h", "4小时"], ["6h", "6小时"],
  ["8h", "8小时"], ["12h", "12小时"], ["1d", "日线"],
  ["3d", "3日线"], ["1w", "周线"], ["1M", "月线"],
];

type Tool = "none" | "trendline" | "hline" | "fibonacci" | "rect";
interface DrawPoint { pixel: number[]; data: (string | number)[] }
interface Drawing { type: string; price?: number; p1?: (string | number)[]; p2?: (string | number)[] }

const TOOL_ICONS: Record<Tool | "clear", ReactElement> = {
  none: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" /></svg>,
  trendline: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="20" x2="20" y2="4" /></svg>,
  hline: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /></svg>,
  fibonacci: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  rect: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="1" /></svg>,
  clear: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6" /></svg>,
};

const TOOL_TITLES: Record<Tool | "clear", string> = {
  none: "选择", trendline: "趋势线", hline: "水平线", fibonacci: "斐波那契", rect: "矩形", clear: "清除",
};

export default function ChartPage() {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsRef = useRef<any>(null);
  const klineDataRef = useRef<any[]>([]);
  const toolRef = useRef<Tool>("none");
  const drawPtsRef = useRef<DrawPoint[]>([]);
  const drawingsRef = useRef<Drawing[]>([]);

  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setIntr] = useState("1d");
  const [tool, setTool] = useState<Tool>("none");
  const [ticker, setTicker] = useState({ price: "--", high: "--", low: "--", vol: "--", chg: "--", up: true });

  // ===== 绘图（移植自旧版） =====
  const addHLine = (price: number) => {
    const chart = echartsRef.current;
    if (!chart) return;
    const opt = chart.getOption();
    if (!opt.series[0].markLine) opt.series[0].markLine = { data: [], silent: true, lineStyle: { color: "#0095ff", width: 1, type: "dashed" } };
    opt.series[0].markLine.data.push({ yAxis: price, label: { formatter: price.toFixed(2), position: "end", color: "#0095ff", fontSize: 11 } });
    chart.setOption(opt);
    drawingsRef.current.push({ type: "hline", price });
  };

  const addTrend = (p1: DrawPoint, p2: DrawPoint) => {
    const chart = echartsRef.current;
    if (!chart) return;
    const opt = chart.getOption();
    if (!opt.series[0].markLine) opt.series[0].markLine = { data: [], silent: true, lineStyle: { color: "#7c3aed", width: 1.5 } };
    opt.series[0].markLine.data.push([
      { coord: [p1.data[0], p1.data[1]], symbol: "circle", symbolSize: 4 },
      { coord: [p2.data[0], p2.data[1]], symbol: "circle", symbolSize: 4 },
    ]);
    chart.setOption(opt);
    drawingsRef.current.push({ type: "trendline", p1: p1.data, p2: p2.data });
  };

  const addFib = (p1: DrawPoint, p2: DrawPoint) => {
    const chart = echartsRef.current;
    if (!chart) return;
    const opt = chart.getOption();
    const y1 = Number(p1.data[1]), y2 = Number(p2.data[1]), diff = y2 - y1;
    const levels = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
    const colors = ["#16a34a", "#0095ff", "#7c3aed", "#a855f7", "#ea580c", "#dc2626", "#ef4444"];
    if (!opt.series[0].markLine) opt.series[0].markLine = { data: [], silent: true, lineStyle: { width: 1 } };
    levels.forEach((l, i) => {
      const p = y1 + diff * l;
      opt.series[0].markLine.data.push({ yAxis: p, lineStyle: { color: colors[i], type: "dashed" }, label: { formatter: `${(l * 100).toFixed(1)}% ${p.toFixed(2)}`, position: "end", color: colors[i], fontSize: 10 } });
    });
    chart.setOption(opt);
    drawingsRef.current.push({ type: "fibonacci", p1: p1.data, p2: p2.data });
  };

  const addRect = (p1: DrawPoint, p2: DrawPoint) => {
    const chart = echartsRef.current;
    if (!chart) return;
    const opt = chart.getOption();
    const px1 = chart.convertToPixel({ seriesIndex: 0 }, [p1.data[0], p1.data[1]]);
    const px2 = chart.convertToPixel({ seriesIndex: 0 }, [p2.data[0], p2.data[1]]);
    const g = opt.graphic || [];
    g.push({
      type: "rect",
      shape: { x: Math.min(px1[0], px2[0]), y: Math.min(px1[1], px2[1]), width: Math.abs(px2[0] - px1[0]), height: Math.abs(px2[1] - px1[1]) },
      style: { fill: "rgba(0,149,255,0.06)", stroke: "#0095ff", lineWidth: 1 },
      z: 100,
    });
    opt.graphic = g;
    chart.setOption(opt);
    drawingsRef.current.push({ type: "rect", p1: p1.data, p2: p2.data });
  };

  const clearDraw = () => {
    const chart = echartsRef.current;
    if (!chart) return;
    drawingsRef.current = [];
    drawPtsRef.current = [];
    const opt = chart.getOption();
    opt.series[0].markLine = { data: [] };
    opt.graphic = [];
    chart.setOption(opt);
  };

  const redrawAll = () => {
    const saved = [...drawingsRef.current];
    drawingsRef.current = [];
    saved.forEach((d) => {
      if (d.type === "hline") addHLine(d.price!);
      else if (d.type === "trendline") addTrend({ pixel: [], data: d.p1! }, { pixel: [], data: d.p2! });
      else if (d.type === "fibonacci") addFib({ pixel: [], data: d.p1! }, { pixel: [], data: d.p2! });
      else if (d.type === "rect") addRect({ pixel: [], data: d.p1! }, { pixel: [], data: d.p2! });
    });
  };

  const onChartClick = (e: { offsetX: number; offsetY: number }) => {
    const chart = echartsRef.current;
    if (!chart || toolRef.current === "none") return;
    const pt = [e.offsetX, e.offsetY];
    const dp = chart.convertFromPixel({ seriesIndex: 0 }, pt);
    if (!dp) return;
    drawPtsRef.current.push({ pixel: pt, data: dp });

    if (toolRef.current === "hline") { addHLine(Number(dp[1])); drawPtsRef.current = []; }
    else if (drawPtsRef.current.length === 2) {
      const [a, b] = drawPtsRef.current;
      if (toolRef.current === "trendline") addTrend(a, b);
      else if (toolRef.current === "fibonacci") addFib(a, b);
      else if (toolRef.current === "rect") addRect(a, b);
      drawPtsRef.current = [];
    }
  };

  // ===== 渲染 K 线 =====
  const renderChart = (data: any[]) => {
    const chart = echartsRef.current;
    if (!chart) return;
    const dates = data.map((d) => d.time);
    const ohlc = data.map((d) => [d.open, d.close, d.low, d.high]);
    const vols = data.map((d) => d.volume);

    chart.setOption({
      backgroundColor: "transparent",
      animation: false,
      tooltip: { trigger: "axis", axisPointer: { type: "cross", lineStyle: { color: "rgba(0,0,0,0.08)" } }, backgroundColor: "rgba(255,255,255,0.95)", borderColor: "rgba(0,0,0,0.08)", textStyle: { color: "#213547", fontSize: 12 } },
      grid: [{ left: 60, right: 15, top: 20, bottom: "28%" }, { left: 60, right: 15, top: "78%", bottom: 30 }],
      xAxis: [
        { type: "category", data: dates, gridIndex: 0, axisLabel: { color: "#94a3b8", fontSize: 11 }, axisLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } }, splitLine: { show: false } },
        { type: "category", data: dates, gridIndex: 1, axisLabel: { show: false }, axisLine: { lineStyle: { color: "rgba(0,0,0,0.06)" } }, splitLine: { show: false } },
      ],
      yAxis: [
        { scale: true, gridIndex: 0, axisLabel: { color: "#94a3b8", fontSize: 11 }, splitLine: { lineStyle: { color: "rgba(0,0,0,0.04)" } }, axisLine: { show: false } },
        { scale: true, gridIndex: 1, axisLabel: { color: "#94a3b8", fontSize: 11 }, splitLine: { lineStyle: { color: "rgba(0,0,0,0.04)" } }, axisLine: { show: false } },
      ],
      dataZoom: [
        { type: "inside", xAxisIndex: [0, 1], start: 60, end: 100 },
        { type: "slider", xAxisIndex: [0, 1], start: 60, end: 100, height: 15, bottom: 8, borderColor: "transparent", backgroundColor: "rgba(0,0,0,0.02)", fillerColor: "rgba(0,149,255,0.1)", handleStyle: { color: "#0095ff" }, textStyle: { color: "#94a3b8" } },
      ],
      series: [
        {
          type: "candlestick",
          data: ohlc,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: { color: "#16a34a", color0: "#dc2626", borderColor: "#16a34a", borderColor0: "#dc2626" },
          markLine: { data: [] },
        },
        {
          type: "bar",
          data: vols,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: { color: (p: { dataIndex: number }) => { const d = ohlc[p.dataIndex]; return d[1] >= d[0] ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.25)"; } },
        },
      ],
    }, true);
    redrawAll();
  };

  // ===== 数据获取 =====
  const updateTickerFromKlines = (data: any[], sym: string) => {
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    if (!last) return;
    const fmt = (n: number) => "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2 });
    const last24 = data.slice(-24);
    const next = {
      price: fmt(last.close),
      high: fmt(Math.max(...last24.map((d) => d.high))),
      low: fmt(Math.min(...last24.map((d) => d.low))),
      vol: (last24.reduce((s, d) => s + d.volume, 0) / 1e6).toFixed(1) + "M",
      chg: "--",
      up: true,
    };
    if (prev) {
      const chg = ((last.close - prev.close) / prev.close) * 100;
      next.chg = (chg >= 0 ? "+" : "") + chg.toFixed(2) + "%";
      next.up = chg >= 0;
    }
    void sym;
    setTicker(next);
  };

  const loadAll = async (sym: string, intv: string) => {
    try {
      const resp = await fetch(`${API}?endpoint=klines&symbol=${sym}&interval=${intv}&limit=300`);
      const raw = await resp.json();
      if (raw.error || !Array.isArray(raw)) return;
      const kdata = raw.map((d: { open_time: string; open: number; high: number; low: number; close: number; volume: number }) => ({
        time: d.open_time.split("T")[0],
        open: d.open, high: d.high, low: d.low, close: d.close, volume: d.volume,
      }));
      klineDataRef.current = kdata;
      renderChart(kdata);
      updateTickerFromKlines(kdata, sym);
    } catch (e) {
      console.error("Fetch klines failed:", e);
    }

    try {
      const resp = await fetch(`${API}?endpoint=ticker&symbol=${sym}`);
      const d = await resp.json();
      if (d.error) return;
      const fmt = (n: number) => "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2 });
      setTicker({
        price: fmt(d.price),
        high: fmt(d.high),
        low: fmt(d.low),
        vol: (d.volume / 1e6).toFixed(1) + "M",
        chg: (d.change >= 0 ? "+" : "") + d.change.toFixed(2) + "%",
        up: d.change >= 0,
      });
    } catch (e) {
      console.error("Fetch ticker failed:", e);
    }
  };

  // ===== 初始化 ECharts =====
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js";
    script.onload = () => {
      if (chartRef.current && (window as any).echarts) {
        echartsRef.current = (window as any).echarts.init(chartRef.current);
        echartsRef.current.setOption({
          backgroundColor: "transparent",
          xAxis: { type: "category", data: [], axisLabel: { color: "rgba(33,53,71,0.5)" } },
          yAxis: { type: "value", scale: true },
          series: [{ type: "candlestick", data: [] }],
        });
        echartsRef.current.getZr().on("click", onChartClick);
      }
    };
    document.head.appendChild(script);

    const onResize = () => echartsRef.current && echartsRef.current.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      echartsRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 币种/周期变化后拉取数据（300ms 合并连续输入）
  useEffect(() => {
    const t = setTimeout(() => loadAll(symbol, interval), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval]);

  const pickTool = (t: Tool) => {
    toolRef.current = t;
    drawPtsRef.current = [];
    setTool(t);
  };

  return (
    <>
      {/* 行情信息栏 */}
      <div className="ticker-bar">
        <span className="ticker-sym">{symbol.replace("USDT", "/USDT")}</span>
        <span className="ticker-price">{ticker.price}</span>
        <span className={`ticker-chg ${ticker.up ? "up" : "down"}`}>{ticker.chg}</span>
        <div className="ticker-extra">
          <div>24h高 <span>{ticker.high}</span></div>
          <div>24h低 <span>{ticker.low}</span></div>
          <div>24h量 <span>{ticker.vol}</span></div>
        </div>
      </div>

      {/* K线图 */}
      <div className="chart-wrapper">
        <div className="chart-area">
          <div id="kline-chart" ref={chartRef} />
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="ctrl-bar">
        <div className="ctrl-row">
          <div className="cg">
            <label>币种</label>
            <input
              list="symbol-presets"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              spellCheck={false}
              placeholder="选择或输入，如 BTCUSDT"
            />
            <datalist id="symbol-presets">
              {PRESETS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </datalist>
          </div>
          <div className="cg">
            <label>周期</label>
            <select value={interval} onChange={(e) => setIntr(e.target.value)}>
              {INTERVALS.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          <div className="divider" />

          <div className="draw-tools">
            {(["none", "trendline", "hline", "fibonacci", "rect"] as Tool[]).map((t) => (
              <div
                key={t}
                className={`tb${tool === t ? " on" : ""}`}
                title={TOOL_TITLES[t]}
                onClick={() => pickTool(t)}
              >
                {TOOL_ICONS[t]}
              </div>
            ))}
            <div className="tb" title="清除" onClick={clearDraw}>
              {TOOL_ICONS.clear}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
