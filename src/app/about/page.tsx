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
          <p>你好，欢迎来到Giles的博客</p>
          <p>
            这里记录了我的市场分析、经济解读和一些教学内容
          </p>
          <p>本博客所有内容均为个人观点分享，不构成任何投资建议，据此操作风险自负</p>
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
          <span className="about-stat-label">经济解读</span>
        </div>
        <div className="about-stat-item">
          <span className="about-stat-num">{stats.daily}+</span>
          <span className="about-stat-label">市场分析</span>
        </div>
        <div className="about-stat-item">
          <span className="about-stat-num">{stats.teaching}+</span>
          <span className="about-stat-label">教学分享</span>
        </div>
      </div>

      <div className="about-contact">
        <a href="/admin/login">后台管理</a>
      </div>
    </div>
  );
}
