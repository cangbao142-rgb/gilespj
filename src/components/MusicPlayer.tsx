"use client";

import { useRef, useState, useEffect } from "react";

const MUSIC_URL = "/music/bgm.mp3";

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.3;
    audio.loop = true;

    // 状态跟随播放器真实事件，加载中/连点都不会失真
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  // 浏览器要求先有用户操作才能出声：首次点击/按键后自动开始播放
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const start = (e: Event) => {
      // 无论是否触发播放，监听只生效一次
      document.removeEventListener("click", start);
      document.removeEventListener("keydown", start);
      // 音乐按钮自己的点击交给 toggle 处理，避免双重触发
      if (e.target instanceof Element && e.target.closest(".music-player-btn")) return;
      audio.play().catch(() => {});
    };
    document.addEventListener("click", start);
    document.addEventListener("keydown", start);
    return () => {
      document.removeEventListener("click", start);
      document.removeEventListener("keydown", start);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    // 以元素真实状态为准：加载中点击也能立刻暂停
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  };

  return (
    <>
      <audio ref={audioRef} src={MUSIC_URL} preload="none" />
      <button
        className="music-player-btn"
        onClick={toggle}
        aria-label={playing ? "暂停音乐" : "播放音乐"}
      >
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </>
  );
}
