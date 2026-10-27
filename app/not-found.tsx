import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { MapPin, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Animated Map Pin */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-purple-100 dark:from-orange-900/30 dark:to-purple-900/30 flex items-center justify-center animate-pulse">
              <MapPin className="w-12 h-12 text-orange-500" />
            </div>
            {/* Compass floating */}
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center border border-border">
              <Compass className="w-5 h-5 text-purple-500 animate-spin" style={{ animationDuration: "4s" }} />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-orange-500 tracking-widest uppercase">
            404 — Lost in Transit
          </p>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
            Destination not found
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
            Looks like this route is off the map. Head back home and we&apos;ll
            help you plan a real adventure.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 border-none px-6"
          >
            <Link href="/">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/create-new-trip" className="gap-2 flex items-center">
              Plan a New Trip
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
