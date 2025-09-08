"use client";

import Image from "next/image";
import { Github } from "lucide-react";
import Banner from "./banner";
import { useAuth } from "@/app/contexts/auth-context";
import { Avatar } from "@/components/ui/avatar";


export function Header() {
  const { user } = useAuth();

  return (
    <div className="sticky top-0 z-50 w-full border-b border-gray-50">
      <Banner />
      <header className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image src="/logo.svg" alt="Logo" width={28} height={28} className="sm:w-8 sm:h-8" />
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <a
                href="https://github.com/membranehq/unified-api-example"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-200"
                aria-label="View on GitHub"
              >
                <Github className="w-4 h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              {user && (
                <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-muted-foreground">
                  <Avatar email={user.email} size="sm" />
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
