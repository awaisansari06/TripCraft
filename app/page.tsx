"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import {
  ArrowRight,
  Bookmark,
  Building,
  ChevronRight,
  Coins,
  Gem,
  Map,
  MapPin,
  MessageSquare,
  Plane,
  Send,
  Users,
} from "lucide-react";
import s from "./home.module.css";
import { useHomepageMotion } from "./_components/useHomepageMotion";
import SiteFooter from "./_components/SiteFooter";
import TripPromptInput from "./_components/TripPromptInput";

function Photo({
  asset,
  alt = "",
  className = "",
  priority = false,
}: {
  asset: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const [lightReady, setLightReady] = useState(false);
  const [darkReady, setDarkReady] = useState(false);
  return (
    <span
      className={`${s.photo} ${className}`}
      data-light-ready={lightReady}
      data-dark-ready={darkReady}
    >
      <Image
        src={`/light/${asset}-light.png`}
        alt={alt}
        fill
        sizes="(max-width: 600px) 100vw, 50vw"
        priority={priority}
        className={s.lightPhoto}
        onLoad={() => setLightReady(true)}
        onError={() => setLightReady(true)}
      />
      <Image
        src={`/dark/${asset}-dark.png`}
        alt=""
        fill
        sizes="(max-width: 600px) 100vw, 50vw"
        priority={priority}
        className={s.darkPhoto}
        onLoad={() => setDarkReady(true)}
        onError={() => setDarkReady(true)}
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
  const [query, setQuery] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const homeRef = useRef<HTMLElement>(null);
  useHomepageMotion(homeRef);

  return (
    <main className={s.home} ref={homeRef}>
      <div className={s.scrollProgress} aria-hidden="true" />
      <section className={s.hero}>
        <div className={s.heroImage}>
          <Photo
            asset="01-amalfi-hero"
            alt="The colorful villages and blue waters of the Amalfi Coast"
            priority
          />
          <span className={s.location}>
            <MapPin size={20} />
            Amalfi Coast, Italy
          </span>
        </div>
        <svg className={s.flightPath} viewBox="0 0 240 130" aria-hidden="true">
          <path d="M15 16 C130 0 85 100 230 112" />
        </svg>
        <Plane className={s.heroPlane} aria-hidden="true" />
        <div className={s.heroContent}>
          <h1>
            <span className={s.heroLine}>
              <span>Your next</span>
            </span>
            <span className={s.heroLine}>
              <span>adventure,</span>
            </span>
            <span className={`${s.heroLine} ${s.heroAccent}`}>
              <span>beautifully planned.</span>
            </span>
          </h1>
          <p>Tell us your dream trip. We’ll plan the details.</p>
          <form
            className={s.prompt}
            onSubmit={(e) => {
              e.preventDefault();
              setIsPlanning(true);
              router.push(
                user
                  ? tripLink(query)
                  : `/sign-in?redirect_url=${encodeURIComponent(tripLink(query))}`,
              );
            }}
          >
            <Plane aria-hidden="true" />
            <TripPromptInput value={query} onChange={setQuery} />
            <button type="submit" disabled={isPlanning} data-magnetic>
              {isPlanning ? (
                <span className={s.spinner} aria-hidden="true" />
              ) : (
                <Send size={20} />
              )}
              {isPlanning ? "Planning..." : "Plan my trip"}
            </button>
          </form>
          <div className={s.startLabel}>Start planning free</div>
          <div className={s.suggestions}>
            <button onClick={() => setQuery("Plan a weekend in Goa")}>
              <Photo asset="02-beach-weekend" />
              Goa weekend
              <ChevronRight size={14} />
            </button>
            <button onClick={() => setQuery("Plan a trip to Japan")}>
              <Photo asset="07-tokyo" />
              Explore Japan
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className={s.stamp} aria-hidden="true">
          ITALY
          <br />
          <span>✧</span>
          <small>POSTE ITALIANE</small>
        </div>
        <Leaves />
      </section>
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
            <Link
              className={s.templateCard}
              data-depth
              href={tripLink(prompt)}
              key={asset}
              data-reveal
              data-stagger={index}
            >
              <Photo asset={asset} alt={title} />
              <div>
                <h3>{title}</h3>
                <span>
                  Try this trip <ArrowRight />
                </span>
              </div>
            </Link>
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
                title: "Shape your itinerary & budget",
                text: "Our AI builds a personalized plan with the best places, stays and experiences.",
              },
              {
                Icon: MapPin,
                title: "Explore your map & save",
                text: "View your trip on an interactive map and save it for later.",
              },
            ].map(({ Icon, title, text }, i) => (
              <article key={title} data-reveal data-stagger={i}>
                <div className={s.stepTop}>
                  <span>
                    <Icon />
                  </span>
                  <b>0{i + 1}</b>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
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
              title="Hidden gems"
              text="Discover unique places you won’t find in typical guidebooks."
            />
          </div>
          <article className={s.itinerary} data-reveal data-depth>
            <div className={s.builderTitle}>
              <span className={s.icon}>
                <Map />
              </span>
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
                <div className={s.day} key={title}>
                  <Photo asset={asset} />
                  <b>Day {i + 1}</b>
                  <div>
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
          <div className={s.featureColumn}>
            <Feature
              Icon={Coins}
              title="Budget planning"
              text="Keep track of estimated costs and plan a trip that fits your budget."
            />
            <Feature
              Icon={Users}
              title="Group trip planning"
              text="Plan together with friends and family, all in one place."
            />
            <Feature
              Icon={Bookmark}
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
            <Link
              href={tripLink(`Trip to ${title}`)}
              className={s.destinationCard}
              data-depth
              key={asset}
              data-reveal
              data-stagger={index % 3}
            >
              <Photo asset={asset} alt={title} />
              <h3>
                {title} <ArrowRight />
              </h3>
            </Link>
          ))}
        </div>
      </section>
      <section className={s.cta} data-reveal>
        <Photo
          asset="01-amalfi-hero"
          alt="A sunny escape on the Amalfi Coast"
        />
        <div>
          <h2>
            Your next chapter
            <br />
            <em>starts here.</em>
          </h2>
          <p>A great trip begins with an idea.</p>
          <Link href="/create-new-trip" data-magnetic>
            Start planning free <ArrowRight size={18} />
          </Link>
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
}: {
  Icon: typeof Map;
  title: string;
  text: string;
}) {
  return (
    <article className={s.feature} data-reveal data-depth>
      <span className={s.icon}>
        <Icon />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}
