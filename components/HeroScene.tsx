"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";

/** Both grades share one timeline and geometry; theme changes only opacity. */
export default function HeroScene() {
  const dayRef = useRef<HTMLVideoElement>(null);
  const nightRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const day = dayRef.current;
    const night = nightRef.current;
    if (!day || !night) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    const sync = () => {
      if (night.readyState >= 2 && Math.abs(night.currentTime - day.currentTime) > 0.08) {
        night.currentTime = day.currentTime;
      }
    };
    const playback = () => {
      if (disposed) return;
      if (reduced.matches || document.hidden) {
        day.pause();
        night.pause();
        if (reduced.matches) { day.currentTime = 0; night.currentTime = 0; }
      } else if (day.readyState >= 2 && night.readyState >= 2) {
        sync();
        void Promise.allSettled([day.play(), night.play()]);
      }
    };
    day.addEventListener("loadeddata", playback);
    night.addEventListener("loadeddata", playback);
    day.addEventListener("timeupdate", sync);
    reduced.addEventListener("change", playback);
    document.addEventListener("visibilitychange", playback);
    playback();
    return () => {
      disposed = true;
      day.pause(); night.pause();
      day.removeEventListener("loadeddata", playback);
      night.removeEventListener("loadeddata", playback);
      day.removeEventListener("timeupdate", sync);
      reduced.removeEventListener("change", playback);
      document.removeEventListener("visibilitychange", playback);
    };
  }, []);

  return (
    <div className={styles.scene} aria-hidden="true">
      <video ref={dayRef} className={styles.dayScene} poster="/hero/day-poster.webp" muted loop playsInline preload="auto">
        <source src="/hero/day.webm" type="video/webm" />
        <source src="/hero/day.mp4" type="video/mp4" />
      </video>
      <video ref={nightRef} className={styles.nightScene} poster="/hero/night-poster.webp" muted loop playsInline preload="auto">
        <source src="/hero/night.webm" type="video/webm" />
        <source src="/hero/night.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
