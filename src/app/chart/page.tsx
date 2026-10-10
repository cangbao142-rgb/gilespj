"use client";

import { useEffect, useRef, useState } from "react";
import type { Metadata } from "next";

// 实时看盘页面 — 客户端组件（需要实时数据交互）
export default function ChartPage() {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsRef = useRef<any>(null);
  const [price, setPrice] = useState("--");
  const [change, setChange] = useState("--");
  const [changeClass, setChangeClass] = useState("");

  useEffect(() => {
    // 动态加载 ECharts
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js";
    script.onload = () => {
      if (chartRef.current && (window as any).echarts) {
        echartsRef.current = (window as any).echarts.init(chartRef.current);
        // 初始化一个空的 K 线图
        echartsRef.current.setOption({
          backgroundColor: "transparent",
          grid: { top: 60, right: 80, bottom: 60, left: 60 },
          xAxis: {
            type: "category",
            data: [],
            axisLine: { lineStyle: { color: "rgba(60,60,60,0.1)" } },
            axisLabel: { color: "rgba(33,53,71,0.5)" },
          },
          yAxis: {
            type: "value",
            scale: true,
            axisLine: { lineStyle: { color: "rgba(60,60,60,0.1)" } },
            axisLabel: { color: "rgba(33,53,71,0.5)" },
            splitLine: { lineStyle: { color: "rgba(60,60,60,0.06)" } },
          },
          series: [
            {
              type: "candlestick",
              data: [],
              itemStyle: {
                color: "#16a34a",
                color0: "#dc2626",
                borderColor: "#16a34a",
                borderColor0: "#dc2626",
              },
            },
          ],
          tooltip: {
            trigger: "axis",
            axisPointer: { type: "cross" },
          },
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      echartsRef.current?.dispose();
    };
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* 行情信息栏 */}
      <div className="ticker-bar">
        <span className="ticker-sym">BTC/USDT</span>
        <span className="ticker-price">{price}</span>
        <span className={`ticker-chg ${changeClass}`}>{change}</span>
        <div className="ticker-extra">
          <span>24h 高: --</span>
          <span>24h 低: --</span>
          <span>成交量: --</span>
        </div>
      </div>

      {/* K 线图 */}
      <div className="chart-wrapper">
        <div className="chart-area">
          <div ref={chartRef} id="kline-chart" style={{ width: "100%", height: "100%" }} />
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="ctrl-bar">
        <div className="ctrl-row">
          <div className="cg">
            <label>周期</label>
            <select defaultValue="1d">
              <option value="1m">1分钟</option>
              <option value="5m">5分钟</option>
              <option value="15m">15分钟</option>
              <option value="1h">1小时</option>
              <option value="4h">4小时</option>
              <option value="1d">日线</option>
              <option value="1w">周线</option>
            </select>
          </div>
          <div className="cg">
            <label>指标</label>
            <select defaultValue="ma">
              <option value="ma">MA</option>
              <option value="ema">EMA</option>
              <option value="boll">BOLL</option>
            </select>
          </div>
          <div className="divider" />
          <button className="pri">回测</button>
          <button>重置</button>
        </div>
      </div>
    </div>
  );
}
