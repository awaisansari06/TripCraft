"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Navigation renders immediately; only the useful back-to-top control remains. */
export default function PageLoader() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const update = () => setShowScrollTop(window.scrollY > 380);
    window.addEventListener("scroll", update, { passive: true });
    const frame = requestAnimationFrame(update);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", update); };
  }, []);

  return (
    <button type="button" className="tc-back-to-top" data-visible={showScrollTop}
      tabIndex={showScrollTop ? 0 : -1} aria-hidden={!showScrollTop}
      onClick={() => window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
      aria-label="Scroll back to top" title="Scroll to top">
      <ArrowUp size={18} aria-hidden="true" />
    </button>
  );
}
