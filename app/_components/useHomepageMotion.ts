"use client";
import { useEffect, type RefObject } from "react";

/** Keep the existing scroll indicator without pointer parallax or magnetic UI. */
export function useHomepageMotion(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - innerHeight;
      root.style.setProperty("--scroll-progress", String(distance > 0 ? Math.min(1, scrollY / distance) : 0));
    };
    const onScroll = () => { if (!frame && !reduced.matches) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [ref]);
}
