"use client";
import Link from "next/link";
import { useState } from "react";
import Brand from "./Brand";
import s from "../home.module.css";
export default function SiteFooter() {
  const [newsletterMessage, setNewsletterMessage] = useState("");
  return (
    <footer className={`tc-footer ${s.container} ${s.footer}`} data-reveal>
      <div className={s.footerGrid}>
        <div>
          <Brand className={s.brand} />
          <p>Thoughtful trips. Beautiful memories.</p>
        </div>
        <div>
          <h3>Product</h3>
          <Link href="/">Home</Link>
          <Link href="/#features">Features</Link>
          <Link href="/pricing">Pricing</Link>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/#destinations">Destinations</Link>
          <Link href="/#templates">Trip templates</Link>
        </div>
        <div>
          <h3>Legal</h3>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-of-service">Terms</Link>
        </div>
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
            <button>Subscribe</button>
          </form>
          <p role="status">{newsletterMessage}</p>
        </div>
      </div>
      <div className={s.copyright}>
        © {new Date().getFullYear()} TripCraft. All rights reserved.
      </div>
    </footer>
  );
}
