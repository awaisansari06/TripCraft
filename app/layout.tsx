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
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "blockButton",
          logoImageUrl: "/brand/tripcraft-symbol.png",
        },
        variables: {
          colorPrimary: "#f97316",
          colorText: "#1f2937",
          colorTextSecondary: "#6b7280",
          colorBackground: "#ffffff",
          colorInputBackground: "#f9fafb",
          colorInputText: "#1f2937",
          fontFamily: "var(--font-outfit), sans-serif",
          borderRadius: "16px",
        },
        elements: {
          /* Backdrop */
          modalBackdrop: "bg-black/40 backdrop-blur-sm",

          /* The main UI container - using standard Clerk padding mechanics */
          card: "bg-white shadow-2xl rounded-2xl border border-gray-100/50 overflow-hidden",

          /* Hide bottom footer section completely */
          footer: "hidden",

          /* Form UI Typography */
          headerTitle: "text-gray-900 text-2xl font-bold tracking-tight",
          headerSubtitle: "text-gray-500 text-sm mt-1 mb-4",

          formFieldLabel: "text-gray-700 font-semibold text-sm mb-1.5",
          formFieldRow: "mb-4",

          /* Crisp, high-end inputs */
          formFieldInput:
            "bg-white border text-gray-800 border-gray-300 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg px-3.5 py-2.5 shadow-sm transition-all",

          /* Vibrant primary call-to-action */
          formButtonPrimary:
            "bg-gradient-to-r from-orange-500 to-purple-600 text-white font-semibold rounded-lg py-3 text-sm tracking-wide shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-[0.98] transition-all border-0",

          /* Social connectors */
          socialButtonsBlockButton:
            "border border-gray-200/80 bg-white hover:bg-gray-50 rounded-lg py-2.5 shadow-sm transition-all",
          socialButtonsBlockButtonText: "text-gray-700 font-medium",

          /* Dividers */
          dividerRow: "my-5",
          dividerLine: "bg-gray-200",
          dividerText: "text-gray-400 font-medium text-xs",

          /* Errors */
          formFieldErrorText: "text-red-500 text-xs font-medium mt-1.5",
          alert: "bg-red-50 border border-red-100 rounded-lg p-3",
          alertText: "text-red-600 font-medium",
        },
      }}
    >
      <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
        <body className={`${outfit.className} ${outfit.variable}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
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
