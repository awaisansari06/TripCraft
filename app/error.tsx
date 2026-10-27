"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PageError]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Oops, something broke
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We ran into an issue loading this page. Your trips and data are safe.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 font-mono bg-muted px-3 py-1.5 rounded-lg inline-block">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="gap-2"
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
    </div>
  );
}
