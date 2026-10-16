import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "./tripcraft.css";
import Provider from "./provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ThemeProvider } from "next-themes";


export const metadata: Metadata = {
  title: {
    default: "TripCraft — AI Trip Planner",
    template: "%s | TripCraft",
  },
  description:
    "Plan your perfect trip in seconds with AI. TripCraft creates day-by-day itineraries, hotel picks, and local gems — all tailored to your budget and style.",
  keywords: [
    "AI trip planner",
    "travel itinerary",
    "trip craft",
    "tripcraft",
    "vacation planner",
    "hotel recommendations",
    "travel AI",
  ],
  authors: [{ name: "TripCraft" }],
  openGraph: {
    title: "TripCraft — AI Trip Planner",
    description:
      "Plan your perfect trip in seconds with AI. Day-by-day itineraries, hotels & local gems.",
    url: "https://tripcraft-v2.vercel.app/",
    siteName: "TripCraft",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TripCraft — AI Trip Planner",
    description: "Plan your perfect trip in seconds with AI.",
  },
  icons: {
    icon: "/brand/tripcraft-symbol.png",
  },
};

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-outfit",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={{
        signIn: { start: { title: 'Welcome back', titleCombined: 'Welcome back', subtitle: 'Sign in to TripCraft to continue.', subtitleCombined: 'Sign in to TripCraft to continue.' } },
        signUp: { start: { title: 'Create your account', subtitle: 'Your next adventure starts with TripCraft.' } },
      }}
      appearance={{
        layout: { socialButtonsPlacement: 'top', socialButtonsVariant: 'blockButton', logoImageUrl: '/brand/tripcraft-symbol.png' },
        variables: { fontFamily: 'var(--font-outfit), sans-serif', fontSize: '14px', borderRadius: '12px' },
      }}
    >
      <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
        <body className={`${outfit.className} ${outfit.variable}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <Provider>{children}</Provider>
            </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
