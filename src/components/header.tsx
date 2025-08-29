"use client";

import Image from "next/image";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { Github } from "lucide-react";
import Banner from "./banner";

export function Header() {
  return (
    <div className="sticky top-0 z-50 w-full border-gray-50">
     <Banner/>
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
