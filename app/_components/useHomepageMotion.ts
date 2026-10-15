"use client";

import { useEffect, type RefObject } from "react";

/** Pointer depth and scroll atmosphere without rerendering the page on movement. */
export function useHomepageMotion(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let dispose = () => {};

    const setup = () => {
      dispose();
      if (reduced.matches) return;
      const controller = new AbortController();
      const { signal } = controller;
      const cleanups: (() => void)[] = [];
      let scrollFrame = 0;
      const updateScroll = () => {
        scrollFrame = 0;
        const distance =
          document.documentElement.scrollHeight - window.innerHeight;
        root.style.setProperty(
          "--scroll-progress",
          String(distance > 0 ? Math.min(1, window.scrollY / distance) : 0),
        );
        root.style.setProperty(
          "--hero-shift",
          `${Math.min(window.scrollY, 600) * 0.09}px`,
        );
      };
      const onScroll = () => {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
      };
      window.addEventListener("scroll", onScroll, { passive: true, signal });
      window.addEventListener("resize", onScroll, { passive: true, signal });
      updateScroll();

      if (finePointer.matches) {
        root
          .querySelectorAll<HTMLElement>("[data-depth], [data-magnetic]")
          .forEach((element) => {
            let frame = 0;
            let x = 0,
              y = 0,
              targetX = 0,
              targetY = 0;
            const magnetic = element.hasAttribute("data-magnetic");
            const tick = () => {
              x += (targetX - x) * 0.16;
              y += (targetY - y) * 0.16;
              element.style.setProperty("--pointer-x", `${x}`);
              element.style.setProperty("--pointer-y", `${y}`);
              if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.002) {
                frame = requestAnimationFrame(tick);
              } else {
                frame = 0;
              }
            };
            const start = () => {
              if (!frame) frame = requestAnimationFrame(tick);
            };
            element.addEventListener(
              "pointermove",
              (event) => {
                const bounds = element.getBoundingClientRect();
                targetX = Math.max(
                  -1,
                  Math.min(
                    1,
                    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
                  ),
                );
                targetY = Math.max(
                  -1,
                  Math.min(
                    1,
                    ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
                  ),
                );
                if (!magnetic) element.dataset.hovering = "true";
                start();
              },
              { passive: true, signal },
            );
            element.addEventListener(
              "pointerleave",
              () => {
                targetX = targetY = 0;
                delete element.dataset.hovering;
                start();
              },
              { signal },
            );
            cleanups.push(() => {
              cancelAnimationFrame(frame);
              element.style.removeProperty("--pointer-x");
              element.style.removeProperty("--pointer-y");
              delete element.dataset.hovering;
            });
          });
      }
      dispose = () => {
        controller.abort();
        cancelAnimationFrame(scrollFrame);
        cleanups.forEach((cleanup) => cleanup());
        root.style.removeProperty("--scroll-progress");
        root.style.removeProperty("--hero-shift");
      };
    };
    setup();
    reduced.addEventListener("change", setup);
    finePointer.addEventListener("change", setup);
    return () => {
      dispose();
      reduced.removeEventListener("change", setup);
      finePointer.removeEventListener("change", setup);
    };
  }, [ref]);
}
