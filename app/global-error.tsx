"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Something went wrong
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              An unexpected error occurred. Don&apos;t worry — your trips are safe.
              Try refreshing the page or going back home.
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 font-mono bg-muted px-3 py-1.5 rounded-lg inline-block">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={reset}
              className="gap-2 bg-gradient-to-r from-orange-500 to-pink-600 text-white hover:from-orange-600 hover:to-pink-700 border-none"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" className="gap-2 flex items-center">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
