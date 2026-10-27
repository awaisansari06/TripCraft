"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MessageSquare,
  Lightbulb,
  Handshake,
  Shield,
  Clock,
  Sparkles,
  Plane,
  Copy,
  Check,
} from "lucide-react";
import SiteFooter from "../_components/SiteFooter";
import PageIntro from "../_components/PageIntro";

const topics = [
  {
    title: "Support",
    description: "Need help with a trip or your account?",
    Icon: MessageSquare,
  },
  {
    title: "Feedback",
    description: "Share ideas to improve TripCraft.",
    Icon: Lightbulb,
  },
  {
    title: "Partnerships",
    description: "Let’s build something together.",
    Icon: Handshake,
  },
];
export default function Contact() {
  const [topic, setTopic] = useState("Support");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(
      "Your message is ready, but online sending isn’t available yet. Your draft is still here; you can copy it below.",
    );
  };
  const copyDraft = async () => {
    try {
      await navigator.clipboard.writeText(
        `Topic: ${topic}\nName: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
      );
      setCopied(true);
      setStatus("Message copied. Nothing has been sent.");
    } catch {
      setStatus(
        "Copying isn’t available in this browser. You can select and copy your message manually.",
      );
    }
  };
  return (
    <main className="tc-page tc-warm-page" data-page-motion>
      <PageIntro icon={<MessageSquare size={16} aria-hidden="true" />} eyebrow="A little help along the way"
        description="We’re here to help you plan better trips. Questions, feedback, or ideas? Our team would love to hear from you.">
        Better trips start with<br />{" "}<em>a conversation.</em>
      </PageIntro>
      <section
        className="tc-container tc-contact-topics"
        aria-label="Ways we can help"
      >
        {topics.map(({ title, description, Icon }, i) => (
          <a
            href="#contact-form"
            key={title}
            data-reveal
            data-stagger={i}
            className="tc-surface tc-topic"
            onClick={() => {
              setTopic(title);
              document
                .getElementById("contact-name")
                ?.focus({ preventScroll: true });
            }}
          >
            <span className="tc-feature-icon">
              <Icon />
            </span>
            <h2>{title}</h2>
            <p>{description}</p>
            <span className="tc-text-link">
              Get in touch <ArrowRight size={16} />
            </span>
          </a>
        ))}
      </section>
      <section className="tc-container tc-contact-layout" id="contact-form">
        <aside className="tc-contact-aside">
          <span className="tc-eyebrow">Thoughtful support</span>
          <h2>
            Every great journey
            <br />
            starts with <em>an idea.</em>
          </h2>
          <p>
            Tell us what’s on your mind. Whether you’re planning a first
            adventure or improving your next itinerary, we’re listening.
          </p>
          <div className="tc-support-detail">
            <Clock />
            <div>
              <strong>Fast response</strong>
              <p>
                Our aim is to reply within 24 hours once messaging is available.
              </p>
            </div>
          </div>
          <div className="tc-support-detail">
            <Shield />
            <div>
              <strong>Privacy first</strong>
              <p>Your draft stays in this form until you choose to copy it.</p>
            </div>
          </div>
          <div className="tc-support-detail">
            <Sparkles />
            <div>
              <strong>Human + AI</strong>
              <p>
                Many trip questions can be explored with our AI Trip Assistant.
              </p>
            </div>
          </div>
          <Link href="/create-new-trip" className="tc-text-link">
            Explore the trip assistant <ArrowRight size={16} />
          </Link>
        </aside>
        <form className="tc-surface tc-contact-form" onSubmit={submit}>
          <h2>Send us a message</h2>
          <p className="tc-muted">
            Online sending is coming soon. You can prepare and copy your message
            here.
          </p>
          <div className="tc-form-row">
            <label htmlFor="contact-name">
              Your name
              <input
                className="tc-field"
                id="contact-name"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(e) => {
                  setCopied(false);
                  setForm({ ...form, name: e.target.value });
                }}
                placeholder="Alex Morgan"
              />
            </label>
            <label htmlFor="contact-email">
              Email address
              <input
                className="tc-field"
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={form.email}
                onChange={(e) => {
                  setCopied(false);
                  setForm({ ...form, email: e.target.value });
                }}
                placeholder="you@example.com"
              />
            </label>
          </div>
          <label htmlFor="contact-topic">
            How can we help?
            <select
              className="tc-field"
              id="contact-topic"
              value={topic}
              onChange={(e) => {
                setCopied(false);
                setTopic(e.target.value);
              }}
            >
              {topics.map((item) => (
                <option key={item.title}>{item.title}</option>
              ))}
            </select>
          </label>
          <label htmlFor="contact-message">
            Your message
            <textarea
              className="tc-field"
              id="contact-message"
              name="message"
              required
              minLength={10}
              maxLength={5000}
              rows={6}
              value={form.message}
              onChange={(e) => {
                setCopied(false);
                setForm({ ...form, message: e.target.value });
              }}
              placeholder="Tell us how we can help…"
              aria-describedby="message-help"
            />
          </label>
          <small id="message-help">
            Please leave out passwords, payment details, and other sensitive
            information.
          </small>
          <button className="tc-button" type="submit">
            Prepare message <ArrowRight size={17} />
          </button>
          {status && (
            <div className="tc-form-status">
              <p role="status">{status}</p>
              <button
                type="button"
                className="tc-secondary-button"
                onClick={copyDraft}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy message"}
              </button>
            </div>
          )}
        </form>
      </section>
      <section className="tc-container tc-page-cta">
        <Plane aria-hidden="true" />
        <h2>
          Ready to plan your <em>next trip?</em>
        </h2>
        <p>Let TripCraft build your itinerary in seconds.</p>
        <Link href="/create-new-trip" className="tc-button">
          Create new trip <ArrowRight size={18} />
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
