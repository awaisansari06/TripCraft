"use client";
import Link from "next/link";
import { useState } from "react";
import Brand from "./Brand";
import s from "./SiteFooter.module.css";
export default function SiteFooter() {
  const [newsletterMessage, setNewsletterMessage] = useState("");
  return (
    <footer className={`tc-footer ${s.footer}`}>
      <div className={s.inner}>
      <div className={s.grid}>
        <div className={s.brand}>
          <Brand />
          <p>Thoughtful trips. Beautiful memories.</p>
        </div>
        <nav aria-label="Product">
          <h3>Product</h3>
          <Link href="/">Home</Link>
          <Link href="/#features">Features</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <nav aria-label="Explore"><h3>Explore</h3>
          <Link href="/#destinations">Destinations</Link>
          <Link href="/#templates">Trip templates</Link>
        </nav>
        <nav aria-label="Legal"><h3>Legal</h3>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-of-service">Terms</Link>
        </nav>
        <div className={s.newsletter}>
          <label htmlFor="travel-email">Travel inspiration, occasionally</label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setNewsletterMessage("Newsletter sign-ups are coming soon.");
            }}
          >
            <input
              id="travel-email"
              type="email"
              required
              placeholder="Your email address"
            />
            <button className="tc-button" type="submit">Subscribe</button>
          </form>
          <p role="status">{newsletterMessage}</p>
        </div>
      </div>
      <div className={s.copyright}>
        © {new Date().getFullYear()} TripCraft. All rights reserved.
      </div>
      </div>
    </footer>
  );
}
