"use client";
import { Calendar, Wallet2, Users } from "lucide-react";
import { motion, useMotionValue } from "motion/react";
import React, { useEffect, useRef } from "react";
import { TripInfo } from "@/app/create-new-trip/_components/types";

interface TimelineEntry { title: string; content: React.ReactNode; }

export const Timeline = ({ data, scrollContainer, tripData }: {
  data: TimelineEntry[];
  scrollContainer?: React.RefObject<HTMLDivElement | null>;
  tripData: TripInfo;
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(32);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const scroller = scrollContainer?.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = track.getBoundingClientRect();
      const viewport = scroller?.getBoundingClientRect();
      const focus = (viewport?.top ?? 0) + (scroller?.clientHeight ?? window.innerHeight) * 0.55;
      progress.set(reduced.matches ? track.scrollHeight : Math.min(track.scrollHeight, Math.max(32, focus - bounds.top)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    observer.observe(track);
    if (scroller) observer.observe(scroller);
    const target = scroller ?? window;
    target.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    reduced.addEventListener("change", schedule);
    update();
    return () => {
      observer.disconnect();
      target.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reduced.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
    };
  }, [scrollContainer, progress, data.length]);

  return (
    <div className="trip-timeline">
      <header className="trip-timeline-heading">
        <h2>Your Trip Itinerary from <strong>{tripData.origin}</strong> to <strong>{tripData.destination}</strong> is Ready</h2>
        <div className="trip-facts">
          <span><Calendar size={18} />{tripData.duration}</span>
          <span><Wallet2 size={18} />{tripData.budget}</span>
          <span><Users size={18} />{tripData.group_size}</span>
        </div>
      </header>
      <div ref={trackRef} className="trip-timeline-track">
        <div className="trip-timeline-rail" aria-hidden="true">
          <motion.div className="trip-timeline-glow" style={{ height: progress }} />
        </div>
        {data.map(item => (
          <section key={item.title} id={item.title.toLowerCase().replace(/\s/g, "-")} className="trip-timeline-entry">
            <h3><span aria-hidden="true" />{item.title}</h3>
            <div className="trip-timeline-content">{item.content}</div>
          </section>
        ))}
      </div>
    </div>
  );
};
