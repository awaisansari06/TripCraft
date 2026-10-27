"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

import {
  ArrowRight,
  Bookmark,
  Building,
  Coins,
  Gem,
  Map,
  MapPin,
  MessageSquare,
  Plane,
  Users,
} from "lucide-react";
import s from "./home.module.css";
import { useHomepageMotion } from "./_components/useHomepageMotion";
import SiteFooter from "./_components/SiteFooter";
import Hero from "@/components/Hero";
import { travelArtworkSrc, travelArtworkAlt } from "@/lib/travel-artwork";

const MotionLink = motion.create(Link);

function Photo({
  asset,
  className = "",
  priority = false,
}: {
  asset: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState({ light: false, dark: false });
  return (
    <span className={`${s.photo} ${className}`}>
      <Image
        src={failed.light ? '/image-fallback.svg' : travelArtworkSrc(asset)}
        alt={travelArtworkAlt(asset)} fill sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 40vw"
        priority={priority} loading={priority ? undefined : "eager"} className={s.lightPhoto}
        onError={() => setFailed(previous => ({ ...previous, light: true }))}
      />
      <Image
        src={failed.dark ? '/image-fallback.svg' : travelArtworkSrc(asset, 'dark')}
        alt={travelArtworkAlt(asset)} fill sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 40vw"
        priority={priority} loading={priority ? undefined : "eager"} className={s.darkPhoto}
        onError={() => setFailed(previous => ({ ...previous, dark: true }))}
      />
    </span>
  );
}

const templates = [
  ["02-beach-weekend", "Beach Weekend", "Plan a relaxing beach weekend trip"],
  ["03-food-tour", "Food Tour", "Plan a food tour trip"],
  ["04-mountain-escape", "Mountain Escape", "Plan a mountain escape trip"],
];
const destinations = [
  ["05-paris", "Paris, France"],
  ["06-new-york", "New York, USA"],
  ["07-tokyo", "Tokyo, Japan"],
  ["08-rome", "Rome, Italy"],
  ["09-dubai", "Dubai, UAE"],
  ["10-agra", "Agra, India"],
];
const tripLink = (query: string) =>
  `/create-new-trip?query=${encodeURIComponent(query)}`;

function Leaves({ className = "" }: { className?: string }) {
  return (
    <div className={`${s.leaves} ${className}`} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <i
          key={i}
          style={{ transform: `rotate(${i * 31 - 125}deg)`, top: `${i * 7}px` }}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const homeRef = useRef<HTMLElement>(null);
  useHomepageMotion(homeRef);

  return (
    <main className={`${s.home} tripcraft-landing`} ref={homeRef}>
      <div className={s.scrollProgress} aria-hidden="true" />
      <Hero />
      <section className={`${s.container} ${s.templates}`} id="templates">
        <div className={s.sectionHeading} data-reveal>
          <div>
            <h2>
              Start with a little <em>inspiration</em>
            </h2>
            <p>Choose a template and we’ll customize it for you.</p>
          </div>
          <Link href="/create-new-trip">
            View all templates <ArrowRight />
          </Link>
        </div>
        <div className={s.threeGrid}>
          {templates.map(([asset, title, prompt], index) => (
            <MotionLink
              className={s.templateCard}
              data-depth
              href={tripLink(prompt)}
              key={asset}
              data-reveal
              data-stagger={index}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: .2, ease: "easeOut" }}
            >
              <Photo asset={asset} />
              <div>
                <h3>{title}</h3>
                <span>
                  Try this trip <ArrowRight />
                </span>
              </div>
            </MotionLink>
          ))}
        </div>
      </section>
      <section className={s.how}>
        <Leaves />
        <div className={s.container}>
          <div className={s.centerHeading} data-reveal>
            <h2>
              From idea to <em>itinerary</em>
            </h2>
            <p>Three simple steps to your next adventure.</p>
          </div>
          <div className={s.steps}>
            <svg
              viewBox="0 0 900 80"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M60 40 Q160 -5 260 40 T460 40 T660 40 T850 40" />
            </svg>
            {[
              {
                Icon: MessageSquare,
                title: "Tell us your trip idea",
                text: "Share where you want to go, who you’re traveling with, and what you love.",
              },
              {
                Icon: Map,
                title: "Shape your itinerary and budget",
                text: "Our AI builds a personalized plan with the best places, stays and experiences.",
              },
              {
                Icon: MapPin,
                title: "Explore your map and save",
                text: "View your trip on an interactive map and save it for later.",
              },
            ].map(({ Icon, title, text }, i) => (
              <motion.article
                key={title}
                data-reveal
                data-stagger={i}
                whileHover={{ y: -2 }}
                transition={{ duration: .2, ease: "easeOut" }}
              >
                <div className={s.stepTop}>
                  <motion.span
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: .2, ease: "easeOut" }}
                  >
                    <Icon />
                  </motion.span>
                  <motion.b whileHover={{ scale: 1.03 }}>0{i + 1}</motion.b>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </motion.article>
            ))}
            <Plane className={s.stepPlane} aria-hidden="true" />
          </div>
        </div>
      </section>
      <section className={`${s.container} ${s.features}`} id="features">
        <div className={s.centerHeading} data-reveal>
          <h2>
            Everything <em>your trip needs</em>
          </h2>
          <p>From hotels and activities to budgets, maps, and more.</p>
        </div>
        <div className={s.featureGrid}>
          <div className={s.featureColumn}>
            <Feature
              Icon={Building}
              title="Hotel recommendations"
              text="Get personalized stay suggestions for your style and budget."
            />
            <Feature
              Icon={Gem}
              stagger={1}
              title="Hidden gems"
              text="Discover unique places you won’t find in typical guidebooks."
            />
          </div>
          <motion.article
            className={s.itinerary}
            data-reveal
            data-depth
            whileHover={{ y: -2 }}
            transition={{ duration: .2, ease: "easeOut" }}
          >
            <div className={s.builderTitle}>
              <motion.span
                className={s.icon}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: .2, ease: "easeOut" }}
              >
                <Map />
              </motion.span>
              <div>
                <h3>Smart itinerary builder</h3>
                <p>
                  Get a day-by-day plan with the best places, times and routes.
                </p>
              </div>
            </div>
            <div className={s.sample}>
              <div className={s.sampleBanner}>
                <Photo asset="01-amalfi-hero" />
                <div className={s.miniMap}>
                  <svg viewBox="0 0 150 100" aria-hidden="true">
                    <path d="M10 5 L55 10 75 35 50 60 90 100 M100 0 L85 25 140 60 130 100" />
                    <path d="M30 40 Q90 10 100 70" />
                  </svg>
                  <MapPin />
                  <MapPin />
                  <MapPin />
                </div>
              </div>
              <h4>Sample itinerary</h4>
              {[
                [
                  "11-naples-itinerary",
                  "Arrive in Naples",
                  "Explore the historic center",
                ],
                [
                  "01-amalfi-hero",
                  "Amalfi Coast Drive",
                  "Positano, Amalfi, Ravello",
                ],
                [
                  "12-capri-itinerary",
                  "Capri Island",
                  "Boat tour and blue grotto",
                ],
              ].map(([asset, title, text], i) => (
                <motion.div
                  className={s.day}
                  key={title}
                  whileHover={{ x: 2 }}
                  transition={{ duration: .2, ease: "easeOut" }}
                >
                  <Photo asset={asset} />
                  <b>Day {i + 1}</b>
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.article>
          <div className={s.featureColumn}>
            <Feature
              Icon={Coins}
              title="Budget planning"
              text="Keep track of estimated costs and plan a trip that fits your budget."
            />
            <Feature
              Icon={Users}
              stagger={1}
              title="Group trip planning"
              text="Plan together with friends and family, all in one place."
            />
            <Feature
              Icon={Bookmark}
              stagger={2}
              title="Save trips for later"
              text="Keep your favorite trips and come back to them anytime."
            />
          </div>
        </div>
        <Leaves />
      </section>
      <section className={`${s.container} ${s.destinations}`} id="destinations">
        <div className={s.sectionHeading} data-reveal>
          <div>
            <h2>
              Where will you <em>go next?</em>
            </h2>
            <p>Find inspiration for your next escape.</p>
          </div>
          <Link href="/create-new-trip">
            Explore all destinations <ArrowRight />
          </Link>
        </div>
        <div className={s.threeGrid}>
          {destinations.map(([asset, title], index) => (
            <DestinationCard key={asset} asset={asset} title={title} stagger={index % 3} />
          ))}
        </div>
      </section>
      <section className={s.cta} data-reveal>
        <Photo
          asset="12-capri-itinerary"
        />
        <div>
          <h2>
            Your next chapter
            <br />
            <em>starts here.</em>
          </h2>
          <p>A great trip begins with an idea.</p>
          <MotionLink
            href="/create-new-trip"
            data-magnetic
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: .2, ease: "easeOut" }}
          >
            Start planning free <ArrowRight size={18} />
          </MotionLink>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}

function Feature({
  Icon,
  title,
  text,
  stagger = 0,
}: {
  Icon: typeof Map;
  title: string;
  text: string;
  stagger?: number;
}) {
  return (
    <motion.article
      className={s.feature}
      data-reveal
      data-depth
      data-stagger={stagger}
      whileHover={{ y: -2 }}
      transition={{ duration: .2, ease: "easeOut" }}
    >
      <motion.span
        className={s.icon}
        whileHover={{ scale: 1.15, rotate: -8 }}
        transition={{ duration: .2, ease: "easeOut" }}
      >
        <Icon />
      </motion.span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </motion.article>
  );
}

function DestinationCard({ asset, title, stagger }: { asset: string; title: string; stagger: number }) {
  return (
    <MotionLink
      href={tripLink(`Trip to ${title}`)}
      className={s.destinationCard}
      data-depth
      data-reveal
      data-stagger={stagger}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: .2, ease: "easeOut" }}
    >
      <Photo asset={asset} />
      <h3>{title} <ArrowRight aria-hidden="true" /></h3>
    </MotionLink>
  );
}
