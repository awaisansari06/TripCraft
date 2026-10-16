"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ArrowUp, Sparkles } from "lucide-react";

export default function PageLoader() {
  const pathname = usePathname();
  // Starts true so the loading splash is immediately visible on refresh from the very first frame
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [topBarVisible, setTopBarVisible] = useState(false);
  const [topBarProgress, setTopBarProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll passively via requestAnimationFrame (completely unblocks the scroll thread)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setShowScrollTop(window.scrollY > 380);
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Initial page refresh / load splash animation
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const quickHide = setTimeout(() => setSplashVisible(false), 0);
      return () => clearTimeout(quickHide);
    }

    // Apply smooth page entrance to main
    const main = document.getElementById("main-content");
    let cleanupTimer: ReturnType<typeof setTimeout> | undefined;
    if (main) {
      main.classList.remove("tc-page-smoothing-load");
      void main.offsetWidth;
      main.classList.add("tc-page-smoothing-load");
      cleanupTimer = setTimeout(() => {
        main.classList.remove("tc-page-smoothing-load");
      }, 1500);
    }

    // Visible, premium loading splash sequence on refresh (1.1s visible, then dissolves)
    const fadeTimer = setTimeout(() => {
      setSplashFading(true);
    }, 1100);

    const removeTimer = setTimeout(() => {
      setSplashVisible(false);
      setSplashFading(false);
    }, 1450);

    return () => {
      clearTimeout(cleanupTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Top progress bar on route navigation
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const t0 = setTimeout(() => {
      setTopBarVisible(true);
      setTopBarProgress(25);
    }, 0);

    const t1 = setTimeout(() => setTopBarProgress(65), 90);
    const t2 = setTimeout(() => setTopBarProgress(95), 220);
    const t3 = setTimeout(() => setTopBarProgress(100), 380);
    const t4 = setTimeout(() => {
      setTopBarVisible(false);
      setTopBarProgress(0);
    }, 620);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [pathname]);

  return (
    <>
      {/* 🌟 Luxury Loading Splash on Page Refresh */}
      {splashVisible && (
        <div
          className={`tc-loading-splash ${splashFading ? "tc-splash-fade" : ""}`}
          role="status"
          aria-live="polite"
          aria-label="Loading TripCraft"
        >
          <div className="tc-splash-content">
            <div className="tc-splash-emblem">
              <Image
                src="/brand/tripcraft-symbol.png"
                alt="TripCraft"
                width={64}
                height={64}
                priority
                className="tc-splash-logo"
              />
              <div className="tc-splash-glow" />
            </div>
            <div className="tc-splash-text">
              <span className="tc-splash-brand">TripCraft</span>
              <p className="tc-splash-sub">
                <Sparkles size={13} className="tc-splash-sparkle" /> Crafting your journey…
              </p>
            </div>
            <div className="tc-splash-bar-track">
              <div className="tc-splash-bar-fill" />
            </div>
          </div>
        </div>
      )}

      {/* Top glowing progress bar on route navigation */}
      <div
        className="tc-page-progress-container"
        aria-hidden="true"
        style={{
          opacity: topBarVisible ? 1 : 0,
          pointerEvents: "none",
        }}
      >
        <div
          className="tc-page-progress-bar"
          style={{
            width: `${topBarProgress}%`,
            opacity: topBarVisible ? 1 : 0,
          }}
        />
      </div>

      {/* Floating smooth Back-to-Top button */}
      <button
        type="button"
        className="tc-back-to-top"
        data-visible={showScrollTop}
        onClick={scrollToTop}
        aria-label="Scroll back to top"
        title="Scroll to top"
      >
        <ArrowUp size={18} aria-hidden="true" />
      </button>
    </>
  );
}
