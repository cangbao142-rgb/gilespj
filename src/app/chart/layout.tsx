// 实时看盘页强制保持浅色：.chart-page-lock 存在时全局暗色变量失效、
// 主题切换按钮隐藏（见 globals.css），保证该页与暗色模式上线前完全一致。
export default function ChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="chart-page-lock">{children}</div>;
}
