import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/site-metadata";
import { Outfit } from "next/font/google";
import "./globals.css";
import "./tripcraft.css";
import "./theme.css";
import Provider from "./provider";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ThemeProvider } from "next-themes";


export const metadata: Metadata = {
  ...publicPageMetadata("TripCraft — AI Trip Planner", "Plan your perfect trip in seconds with AI. TripCraft creates day-by-day itineraries, hotel picks, and local gems — all tailored to your budget and style.", "/"),
  title: { default: "TripCraft — AI Trip Planner", template: "%s | TripCraft" },
  keywords: ["AI trip planner", "travel itinerary", "trip craft", "tripcraft", "vacation planner", "hotel recommendations", "travel AI"],
  authors: [{ name: "TripCraft" }],
  icons: { icon: "/brand/tripcraft-symbol.png" },
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
        variables: {
          fontFamily: 'var(--font-ui)', fontSize: '14px', borderRadius: '14px',
          colorPrimary: 'var(--app-action)', colorPrimaryForeground: 'var(--app-on-action)',
          colorBackground: 'var(--app-surface)', colorForeground: 'var(--app-ink)',
          colorMutedForeground: 'var(--app-muted)', colorNeutral: 'var(--app-ink)',
          colorInputBackground: 'var(--app-elevated)', colorInputForeground: 'var(--app-ink)',
        },
        elements: { userButtonPopoverCard: 'tc-account-popover', userButtonPopoverActionButton: 'tc-account-action' },
      }}
    >
      <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* eslint-disable-next-line @next/next/no-page-custom-font */}
          <link href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className={outfit.variable}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
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
