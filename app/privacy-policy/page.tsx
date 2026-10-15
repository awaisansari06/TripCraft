"use client";

import Link from "next/link";
import {
  Shield,
  Database,
  Lock,
  UserCheck,
  Mail,
  ArrowRight,
} from "lucide-react";
import SiteFooter from "../_components/SiteFooter";
import type { ReactNode } from "react";

export default function PrivacyPolicy() {
  return (
    <main className="tc-page tc-legal" data-page-motion>
      {/* ===== HERO ===== */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 -z-10" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your privacy matters. We collect only what’s necessary to make your
            trips smarter and better.
          </p>
        </div>
      </section>

      {/* ===== TL;DR ===== */}
      <section className="max-w-4xl mx-auto px-6 -mt-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 grid md:grid-cols-3 gap-6">
          <div className="flex gap-3">
            <Shield className="text-green-600 w-6 h-6" />
            <p className="text-sm text-gray-700">
              We never sell your personal data
            </p>
          </div>
          <div className="flex gap-3">
            <Lock className="text-blue-600 w-6 h-6" />
            <p className="text-sm text-gray-700">Industry-standard security</p>
          </div>
          <div className="flex gap-3">
            <UserCheck className="text-purple-600 w-6 h-6" />
            <p className="text-sm text-gray-700">
              You control your data anytime
            </p>
          </div>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-[220px_1fr] gap-12">
        {/* Sidebar */}
        <aside className="hidden md:block sticky top-28 text-sm text-gray-600 space-y-4">
          <a href="#collect" className="block hover:text-orange-600">
            Information we collect
          </a>
          <a href="#use" className="block hover:text-orange-600">
            How we use data
          </a>
          <a href="#services" className="block hover:text-orange-600">
            Third-party services
          </a>
          <a href="#security" className="block hover:text-orange-600">
            Security
          </a>
          <a href="#rights" className="block hover:text-orange-600">
            Your rights
          </a>
          <a href="#contact" className="block hover:text-orange-600">
            Contact
          </a>
        </aside>

        {/* Sections */}
        <div className="space-y-10">
          <Section
            id="collect"
            icon={<Database />}
            title="Information we collect"
          >
            Account info (name, email), trip preferences, saved itineraries, and
            usage data to improve your experience.
          </Section>

          <Section id="use" icon={<Shield />} title="How we use your data">
            <ul className="list-disc ml-5 space-y-2">
              <li>Generate personalized trip plans</li>
              <li>Improve AI recommendations</li>
              <li>Provide customer support</li>
              <li>Maintain platform security</li>
            </ul>
          </Section>

          <Section
            id="services"
            icon={<UserCheck />}
            title="Third-party services"
          >
            We use trusted providers (authentication, payments, maps, AI). They
            only receive what’s required to function.
          </Section>

          <Section id="security" icon={<Lock />} title="Data security">
            We apply industry-standard protections. No system is perfect, but
            your data is handled with care.
          </Section>

          <Section id="rights" icon={<Shield />} title="Your rights">
            You can request access, correction, or deletion of your data
            anytime.
          </Section>

          <Section id="contact" icon={<Mail />} title="Contact us">
            Questions about privacy?
            <Link
              href="/contact-us"
              className="text-orange-600 font-semibold ml-1"
            >
              Contact our support team
            </Link>
          </Section>
        </div>
      </section>

      {/* CTA */}
      <GradientCTA />
      <SiteFooter />
    </main>
  );
}

/* ---------- Components ---------- */

function Section({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      data-reveal
      id={id}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8"
    >
      <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-3">
        {icon}
        {title}
      </h2>
      <div className="text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}

function GradientCTA() {
  return (
    <section className="tc-container tc-page-cta">
      <h2 className="text-3xl font-bold mb-4">Plan smarter. Travel better.</h2>
      <Link href="/create-new-trip" className="tc-button">
        Start Planning <ArrowRight className="ml-2 w-5 h-5" />
      </Link>
    </section>
  );
}
