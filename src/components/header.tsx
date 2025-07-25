"use client";

import Image from "next/image";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { ArrowRight, X, Blocks, Github } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="sticky top-0 z-50 w-full">
      {showBanner && (
        <div className="relative overflow-hidden bg-[var(--primary)] border-b border-[color:var(--primary)]">
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:text-[var(--primary-foreground)] transition-colors text-lg font-bold px-2 py-1 rounded focus:outline-none"
            aria-label="Close banner"
            onClick={() => setShowBanner(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="whitespace-nowrap py-2 text-center text-sm font-semibold text-white">
            <span className="inline-flex items-center">
              <Blocks className="w-4 h-4 mr-2 align-text-bottom" aria-hidden="true" />
              Start building universal integrations with {"  "}
              <a
                href="https://integration.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-[var(--primary-foreground)] transition-colors font-bold ml-1"
              >
                Membrane
                <ArrowRight className="w-4 h-4 ml-1 inline" aria-hidden="true" />
              </a>{" "}
            </span>
          </div>
        </div>
      )}
      <header className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 sm:pl-6 lg:pl-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image src="/logo.svg" alt="Logo" width={32} height={32} />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/membranehq/membrane-biderectional-sync"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
                aria-label="View on GitHub"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
