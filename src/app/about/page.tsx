import { getStats } from "@/lib/articles";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我",
  description: "了解 Giles 和这个博客",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const stats = await getStats();

  return (
    <div className="container">
      <div className="about-section">
        <div className="about-title">
          <span className="about-number" aria-hidden="true">
            01
          </span>
          <h2>关于我</h2>
          <div className="about-accent" />
        </div>
        <div className="about-body">
          <p>你好，欢迎来到我的博客。</p>
          <p>
            这里记录了我的每日市场盘解、交易操作记录和一些交易心得文章。
          </p>
          <p>本博客仅供个人记录和学习交流，不构成任何投资建议。</p>
          <h3>联系方式</h3>
          <p>如果你有任何问题或想交流，可以通过以下方式联系我：</p>
          <ul>
            <li>微信：giles86888</li>
            <li>邮箱：giles8688@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* 格言卡片 */}
      <div className="about-quote">
        <p>
          <span className="quote-highlight">知行合一，顺势而为</span>
          ——交易的本质不是预测，而是跟随
        </p>
      </div>

      {/* 数据亮点 */}
      <div className="about-stats">
        <div className="about-stat-item">
          <span className="about-stat-num">{stats.articles}+</span>
          <span className="about-stat-label">交易经验</span>
        </div>
        <div className="about-stat-item">
          <span className="about-stat-num">{stats.daily}+</span>
          <span className="about-stat-label">盘解记录</span>
        </div>
        <div className="about-stat-item">
          <span className="about-stat-num">{stats.operations}+</span>
          <span className="about-stat-label">操作复盘</span>
        </div>
      </div>

      <div className="about-contact">
        <a href="/admin/login">后台管理</a>
      </div>
    </div>
  );
}
