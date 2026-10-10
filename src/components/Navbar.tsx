"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useLayoutEffect } from "react";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/daily", label: "今日盘解" },
  { href: "/chart", label: "实时看盘" },
  { href: "/about", label: "关于我" },
];

export function Navbar() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  // dev 模式 Strict Mode 重挂载会清掉 html 上的 data-theme，paint 前恢复（与初始化脚本同源）
  useLayoutEffect(() => {
    let t = localStorage.getItem("theme");
    if (t !== "dark" && t !== "light") {
      t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ position: "relative" }}>
        <Link href="/" className="logo">
          Giles<span>博客</span>
        </Link>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="切换深浅色主题"
        >
          <svg className="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm9 7a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1zM5 12a1 1 0 1 1 0 2H4a1 1 0 1 1 0-2h1zm12.07 6.07a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zM7.05 6.34a1 1 0 0 1 0 1.41l-.71.71A1 1 0 0 1 4.93 7.05l.71-.71a1 1 0 0 1 1.41 0zm11.32-1.41a1 1 0 0 1 0 1.41l-.71.71a1 1 0 1 1-1.41-1.41l.71-.71a1 1 0 0 1 1.41 0zM7.05 17.66a1 1 0 0 1-1.41 0l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41z" />
          </svg>
          <svg className="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
          </svg>
        </button>
        <button
          className="menu-toggle"
          onClick={() => setShowMenu(!showMenu)}
          aria-label="切换菜单"
        >
          ☰
        </button>
        <ul className={`nav-links${showMenu ? " show" : ""}`}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={isActive(item.href) ? "active" : ""}
                onClick={() => setShowMenu(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
