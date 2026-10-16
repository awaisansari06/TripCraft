"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { animate, MotionConfig } from "framer-motion";

/** Butter-smooth, GPU-accelerated scroll reveals for scrolling down and up without jitter. */
export default function SiteMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const root = ref.current;
    if (!root || !window.IntersectionObserver) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const landing = pathname === "/";
    const active = new Map<HTMLElement, () => void>();
    const seen = new WeakSet<Element>();
    const inside = new WeakSet<Element>();

    // Debounced passive scroll tracking via requestAnimationFrame (zero scroll thread jank)
    let lastScrollY = window.scrollY;
    let scrollDirection: "down" | "up" = "down";
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - lastScrollY;
          if (Math.abs(delta) >= 6) {
            scrollDirection = delta > 0 ? "down" : "up";
            lastScrollY = currentY;
          }
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(
          ({ target, isIntersecting, intersectionRatio, boundingClientRect }) => {
            // Rearm at the observer's actual exit boundary. Waiting for a
            // farther position would never receive another threshold callback.
            if (!isIntersecting) {
              if (landing) return;
                inside.delete(target);
                active.get(target as HTMLElement)?.();
              return;
            }

            // Require an authentic foothold in viewport before entrance
            if (
              !landing && intersectionRatio <
              Math.min(
                0.5,
                Math.max(0.08, 20 / Math.max(1, boundingClientRect.height)),
                (window.innerHeight / Math.max(1, boundingClientRect.height)) * 0.5
              )
            )
              return;

            // Prevent re-triggering while already inside
            if (inside.has(target)) return;
            inside.add(target);

            const element = target as HTMLElement;
            if (landing) observer.unobserve(element);
            element.dataset.revealed = "true";

            if (reduced.matches || element.contains(document.activeElement)) return;
            active.get(element)?.();

            const index = Math.max(0, Math.min(Number(element.dataset.stagger) || 0, 3));
            const isInteractiveForm = element.matches("form") || Boolean(element.querySelector("form"));
            const shouldFade = !isInteractiveForm && !element.matches('section, footer') && !element.querySelector('section');

            // Gentle, elegant 10px glide that complements scrolling rather than fighting it
            const isEnteringFromTop =
              scrollDirection === "up" || boundingClientRect.top < 0;
            // Keep landing content in place: a fade cannot shift the observer
            // boundary or compound with the cards' existing hover transforms.
            const yOffset = landing ? 0 : isEnteringFromTop ? -10 : 10;

            let cancel: (() => void) | undefined;
            let timer: ReturnType<typeof setTimeout> | undefined;
            let finished = false;

            const finish = () => {
              if (finished) return;
              finished = true;
              clearTimeout(timer);
              cancel?.();
              element.style.removeProperty("will-change");
              element.style.removeProperty("opacity");
              element.style.removeProperty("translate");
              delete element.dataset.revealing;
              active.delete(element);
            };

            try {
              element.dataset.revealing = "true";
              element.style.willChange = landing ? "opacity" : "transform, opacity";

              const controls = animate(
                element,
                {
                  ...(!landing ? { translate: [`0 ${yOffset}px`, "0 0"] } : {}),
                  ...(shouldFade ? { opacity: [landing ? 0.85 : 0.6, 1] } : {}),
                },
                {
                  duration: 0.44,
                  delay: landing ? 0 : index * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }
              );
              cancel = () => controls.stop();
              active.set(element, finish);
              timer = setTimeout(finish, 850);
              controls.then(finish, finish);
            } catch {
              finish();
            }
          }
        );
      },
      landing
        ? { threshold: 0, rootMargin: "80px 0px" }
        : { threshold: [0, 0.08, 0.25, 0.5], rootMargin: "20px 0px" }
    );

    const observe = () =>
      root
        .querySelectorAll<HTMLElement>(
          [
            "[data-reveal]",
            "[data-page-motion] > section",
            ".tc-legal section[id]",
            ".tc-auth-layout > section",
            ".planner-shell > section",
            ".dashboard-section",
            ".dashboard-trip-card",
            ".dashboard-panel",
            ".tc-topic",
            ".tc-support-detail",
            ".tc-page-cta",
            ".tc-plan-details > div",
            ".tc-pricing",
          ].join(", ")
        )
        .forEach((target) => {
          if (!seen.has(target)) {
            seen.add(target);
            // Hydration and restored scroll positions must not animate content
            // that the browser has already painted in the viewport.
            if (landing) {
              const bounds = target.getBoundingClientRect();
              if (bounds.top < window.innerHeight && bounds.bottom > 0) {
                target.dataset.revealed = "true";
                return;
              }
            }
            observer.observe(target);
          }
        });

    root
      .querySelectorAll<HTMLElement>(
        "main:not(:has([data-reveal])) > :not(style):not(script)"
      )
      .forEach((element) => {
        if (
          !element.matches(
            ".tc-auth-layout, .planner-chat-panel, .planner-explore-panel"
          )
        ) {
          element.setAttribute("data-reveal", "");
        }
      });

    observe();

    const mutations = new MutationObserver((records) => {
      if (
        records.some((record) =>
          Array.from(record.addedNodes).some(
            (node) => node.nodeType === Node.ELEMENT_NODE
          )
        )
      )
        observe();
    });
    mutations.observe(root, { childList: true, subtree: true });

    const stop = () => {
      if (reduced.matches) active.forEach((finish) => finish());
    };
    const focus = (event: FocusEvent) =>
      active.forEach((finish, target) => {
        if (event.target instanceof Node && target.contains(event.target)) finish();
      });

    reduced.addEventListener("change", stop);
    root.addEventListener("focusin", focus);

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
      mutations.disconnect();
      active.forEach((finish) => finish());
      reduced.removeEventListener("change", stop);
      root.removeEventListener("focusin", focus);
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
