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

    const onEnded = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  // 浏览器要求先有用户操作才能出声：首次点击/按键后自动开始播放
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const start = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
      document.removeEventListener("click", start);
      document.removeEventListener("keydown", start);
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
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
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