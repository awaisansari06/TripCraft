"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const activities = [
  "Aasiya ❤️ just planned a trip to Bali ✈️",
  "Awais generated a Dubai itinerary 🏙️",
  "Maryam saved a 5-day Tokyo plan 🍜",
  "Hardik explored hidden gems in Rome 🏛️",
  "Pratham is planning a Swiss adventure 🏔️",
  "Rohan booked a weekend in Goa 🌴",
  "Sarah found a hidden cafe in Paris 🥐",
  "Arjun is exploring Kyoto's temples ⛩️",
  "Fatima planned a family trip to Kerala 🛶",
  "Liam is looking for northern lights in Iceland 🌌",
  "Neha saved a backpacking route for Vietnam 🎒",
  "Kabir is checking flights to NYC 🗽",
  "Zoya just unlocked a budget guide to Istanbul 🕌",
  "Vikram found a luxury resort in Maldives 🏖️",
  "Ananya is planning a road trip to Ladakh 🏍️",
  "David is exploring street food in Bangkok 🌶️",
  "Priya saved a cultural tour of Jaipur 🐘",
  "Omar is planning a honeymoon in Santorini 💍",
  "Sneha found a trekking guide for Manali 🌲",
  "Rahul is browsing hotels in London 🇬🇧"
];

export default function ActivityTicker() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * activities.length));

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % activities.length);
    }, 4000);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 pointer-events-none">
      <div
        className="
          relative flex items-center gap-3
          px-4 py-2.5 rounded-full
          text-xs font-medium
          text-gray-800 dark:text-gray-100
          backdrop-blur-xl
          bg-white/30 dark:bg-black/30
          border border-white/40 dark:border-white/10
          shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          before:absolute before:inset-0 before:rounded-full
          before:bg-gradient-to-br before:from-white/40 before:to-white/5
          before:opacity-60 before:pointer-events-none
          transition-transform duration-300
        "
      >
        {/* Live Pulse */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>

        {/* Animated Text */}
        <div className="min-w-[220px] max-w-[260px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="block truncate"
            >
              {activities[index]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
