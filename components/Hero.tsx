"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Upload } from "lucide-react";
import styles from "./Hero.module.css";
import HeroScene from "./HeroScene";

const example = "I'm planning a 7-day trip to Japan in October. I love food, hidden cafes, scenic hikes, and want to avoid crowds....";

const examples = [
  example,
  "Plan a relaxing weekend in Goa for two. We love quiet beaches, seafood, and sunset walks. Budget: ₹20,000.",
  "I'd love 5 days in Italy with local food, art, and hidden streets. Include Rome and Florence at an easy pace.",
  "Help me plan a 4-day mountain escape in Himachal with scenic hikes, cozy stays, and beautiful views.",
];

export default function Hero() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState("");
  const [fileName, setFileName] = useState("");
  const [focused, setFocused] = useState(false);
  const [typedExample, setTypedExample] = useState("");
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (focused || query) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let exampleIndex = 0;
    let character = 0;
    let deleting = false;
    const tick = () => {
      if (media.matches) {
        setTypedExample(example);
        return;
      }
      const current = examples[exampleIndex];
      character += deleting ? -1 : 1;
      setTypedExample(current.slice(0, character));
      let delay = deleting ? 18 : 38;
      if (!deleting && character === current.length) {
        deleting = true;
        delay = 2600;
      } else if (deleting && character === 0) {
        deleting = false;
        exampleIndex = (exampleIndex + 1) % examples.length;
        delay = 450;
      }
      timer = setTimeout(tick, delay);
    };
    const restart = () => {
      clearTimeout(timer);
      timer = setTimeout(tick, 80);
    };
    restart();
    media.addEventListener("change", restart);
    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", restart);
    };
  }, [focused, query]);

  function planTrip() {
    const destination = `/create-new-trip?query=${encodeURIComponent(query.trim() || example)}`;
    router.push(user ? destination : `/sign-in?redirect_url=${encodeURIComponent(destination)}`);
  }

  return (
    <section className={`relative w-full overflow-hidden ${styles.hero}`} aria-labelledby="wandor-title">
      <HeroScene />
      <div className={`pointer-events-none absolute inset-x-0 top-0 z-[1] h-[687px] ${styles.topFade}`} />
      <div className="relative z-[2] mx-auto max-w-[1360px]">
        <div className={styles.body}>
          <h1 id="wandor-title">Where <span className={styles.headlineAccent}>will you</span> go next?</h1>
          <p className={styles.subtitle}>Tell our AI where you&apos;re going and what you love. We&apos;ll create a personalized itinerary for you.</p>
          <form className={styles.card} onSubmit={(event) => { event.preventDefault(); planTrip(); }}>
            <label className={styles.promptLabel} htmlFor="dream-trip">Describe your dream trip... <span>(e.g. 7 days Bali trip, mountains, budget, activities)</span></label>
            <textarea id="dream-trip" ref={promptRef} className={styles.prompt} aria-label="Describe your dream trip" placeholder={focused ? "Where would you like to go?" : typedExample} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} value={query} onChange={(event) => setQuery(event.target.value)} />
            <button type="submit" className={styles.plan}>Plan my trip <ArrowRight size={18} aria-hidden="true" /></button>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} />
            <button type="button" className={styles.upload} aria-label="Upload inspiration" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-[18px] w-[18px] shrink-0" />
            </button>
            {fileName && <span className={styles.fileName} role="status" title={fileName}>{fileName} selected</span>}
          </form>
        </div>
      </div>
    </section>
  );
}
