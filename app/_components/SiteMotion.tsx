"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";

export default function SiteMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    const root = ref.current;
    if (!root || !window.IntersectionObserver) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animations = new Set<Animation>();
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return;
          observer.unobserve(target);
          target.classList.add("tc-revealed");
          if (reduced.matches) return;
          const index = Number((target as HTMLElement).dataset.stagger || 0);
          const animation = target.animate(
            [
              { opacity: 0, translate: "0 20px" },
              { opacity: 1, translate: "0 0" },
            ],
            {
              duration: 750,
              delay: Math.min(index, 4) * 80,
              easing: "cubic-bezier(.16,1,.3,1)",
              fill: "backwards",
            },
          );
          animations.add(animation);
          animation.onfinish = () => animations.delete(animation);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -20px 0px" },
    );
    const observe = () =>
      root
        .querySelectorAll(
          "[data-reveal], [data-page-motion] > section, .tc-legal section[id]",
        )
        .forEach((target) => {
          if (!seen.has(target)) {
            seen.add(target);
            observer.observe(target);
          }
        });
    observe();
    const mutations = new MutationObserver(records => {
      if (records.some(record => Array.from(record.addedNodes).some(node => node.nodeType === Node.ELEMENT_NODE))) observe();
    });
    mutations.observe(root, { childList: true, subtree: true });
    const stop = () => {
      if (reduced.matches)
        animations.forEach((animation) => animation.cancel());
    };
    reduced.addEventListener("change", stop);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
      reduced.removeEventListener("change", stop);
    };
  }, [pathname]);
  return (
    <MotionConfig reducedMotion="user">
      <div ref={ref} id="main-content" tabIndex={-1}>
        {children}
      </div>
    </MotionConfig>
  );
}
