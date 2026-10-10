"use client";

import { useEffect, useRef } from "react";

export function BackgroundPattern() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let mouseX = 0,
      mouseY = 0;
    let curX = 0,
      curY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.style.opacity = "1";
    };

    const handleMouseLeave = () => {
      glow.style.opacity = "0";
    };

    let animId: number;
    const animate = () => {
      curX += (mouseX - curX) * 0.08;
      curY += (mouseY - curY) * 0.08;
      glow.style.left = curX + "px";
      glow.style.top = curY + "px";
      animId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    animate();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      {/* 滚动文字背景 */}
      <div className="page-pattern" aria-hidden="true">
        {Array.from({ length: 25 }).map((_, i) => (
          <div className="pattern-row" key={i}>
            {Array.from({ length: 8 }).map((_, j) => (
              <span className="pattern-text" key={j}>
                {i % 2 === 0 ? "知 行 合 一" : "顺 势 而 为"}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* 浮动渐变光球 */}
      <div className="about-orbs" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* 鼠标光晕 */}
      <div ref={glowRef} className="cursor-glow" />
    </>
  );
}
