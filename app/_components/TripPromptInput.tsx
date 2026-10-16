"use client";
import { useEffect, useState } from "react";
import { TRIP_SUGGESTIONS } from "@/lib/trip-suggestions";

/** Only this small component rerenders per letter; the form value is independent. */
export default function TripPromptInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(TRIP_SUGGESTIONS[0]);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (focused || value) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout>;
    let index = 0,
      length = 0,
      deleting = false;
    const tick = () => {
      const sentence =
        TRIP_SUGGESTIONS[index] || "Tell us about your dream trip...";
      length += deleting ? -1 : 1;
      setText(sentence.slice(0, length));
      let delay = deleting ? 40 : 75;
      if (!deleting && length === sentence.length) {
        deleting = true;
        delay = 2000;
      } else if (deleting && length === 0) {
        deleting = false;
        index = (index + 1) % TRIP_SUGGESTIONS.length;
        delay = 300;
      }
      timer = setTimeout(tick, delay);
    };
    const start = () => {
      clearTimeout(timer);
      setTyping(!media.matches);
      setText(TRIP_SUGGESTIONS[0]);
      if (!media.matches) {
        index = 0;
        length = TRIP_SUGGESTIONS[0].length;
        deleting = true;
        timer = setTimeout(tick, 2000);
      }
    };
    start();
    media.addEventListener("change", start);
    return () => {
      clearTimeout(timer);
      media.removeEventListener("change", start);
    };
  }, [focused, value]);
  return (
    <div className="tc-trip-input">
      <input
        id="trip-request"
        name="trip"
        aria-label="Describe your dream trip"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete="off"
        required
        placeholder={focused ? "Where would you like to go?" : ""}
      />
      {!focused && !value && (
        <span className="tc-typewriter" aria-hidden="true">
          <span>{text}</span>
          {typing && <i />}
        </span>
      )}
    </div>
  );
}
