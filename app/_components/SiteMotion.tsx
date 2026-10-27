"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { animate, MotionConfig } from "framer-motion";

/** Visible by default. Reveals enhance content once, without delaying navigation. */
export default function SiteMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const previousPath = useRef(pathname);

  useEffect(() => {
    const root = ref.current;
    if (!root || !window.IntersectionObserver) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const observed = new WeakSet<Element>();
    const active = new Set<() => void>();
    const landing = pathname === "/";
    let frame = 0;

    const reveal = (element: HTMLElement, route = false) => {
      if (reduced.matches || element.contains(document.activeElement)) return;
      // Keep live forms, the hero, and section geometry still during interaction.
      const move = !landing && !element.matches("section, footer, form") && !element.querySelector("form, section");
      const controls = animate(element, {
        opacity: [route ? .96 : .86, 1],
        ...(move ? { translate: ["0 6px", "0 0"] } : {}),
      }, { duration: route ? .24 : .32, ease: [.22, .61, .36, 1] });
      const finish = () => {
        controls.stop();
        element.style.removeProperty("opacity");
        element.style.removeProperty("translate");
        active.delete(finish);
      };
      active.add(finish);
      controls.then(finish, finish);
    };

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        observer.unobserve(element);
        element.dataset.revealed = "true";
        reveal(element);
      }
    }, { threshold: 0, rootMargin: "40px 0px" });

    const observe = () => {
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(element => {
        if (observed.has(element)) return;
        observed.add(element);
        const bounds = element.getBoundingClientRect();
        if (bounds.top < innerHeight && bounds.bottom > 0) {
          element.dataset.revealed = "true";
        } else observer.observe(element);
      });
    };
    observe();
    if (previousPath.current !== pathname) {
      const intro = root.querySelector<HTMLElement>(".tc-page-hero");
      if (intro) reveal(intro, true);
    }
    previousPath.current = pathname;
    const mutations = new MutationObserver(records => {
      if (!records.some(record => [...record.addedNodes].some(node => node.nodeType === Node.ELEMENT_NODE))) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(observe);
    });
    mutations.observe(root, { childList: true, subtree: true });
    const finishAll = () => [...active].forEach(finish => finish());
    const onMotionChange = () => { if (reduced.matches) finishAll(); };
    root.addEventListener("focusin", finishAll);
    reduced.addEventListener("change", onMotionChange);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect(); mutations.disconnect(); finishAll();
      root.removeEventListener("focusin", finishAll);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, [pathname]);

  return <MotionConfig reducedMotion="user"><div ref={ref} id="main-content" tabIndex={-1}>{children}</div></MotionConfig>;
}
