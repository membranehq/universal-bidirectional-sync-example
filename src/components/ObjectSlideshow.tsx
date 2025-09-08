"use client";

import { useState, useEffect } from "react";
import appObjects from "@/lib/app-objects";
import { AppObjectKey } from "@/lib/app-objects-schemas";
import pluralize from "pluralize";

interface ObjectSlideshowProps {
  className?: string;
}

export function ObjectSlideshow({ className = "" }: ObjectSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Get all app object keys
  const objectKeys = Object.keys(appObjects) as AppObjectKey[];

  // Calculate total cycles (3 full cycles through all objects)
  const totalCycles = 3;
  const totalSlides = objectKeys.length * totalCycles;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = prevIndex + 1;

          // If we've completed all cycles, stop the slideshow
          if (nextIndex >= totalSlides) {
            setIsVisible(false);
            return prevIndex;
          }

          return nextIndex;
        });
        setIsAnimating(false);
      }, 200); // Half of animation duration
    }, 2000); // Change slide every 2 seconds

    return () => clearInterval(interval);
  }, [totalSlides]);

  // Don't render if slideshow has completed
  if (!isVisible) {
    return null;
  }

  // Get the current and next objects
  const currentObjectKey = objectKeys[currentIndex % objectKeys.length];
  const currentObject = appObjects[currentObjectKey];
  const CurrentIconComponent = currentObject.icon;

  const nextObjectKey = objectKeys[(currentIndex + 1) % objectKeys.length];
  const nextObject = appObjects[nextObjectKey];
  const NextIconComponent = nextObject.icon;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative overflow-hidden h-7 w-72">
        {/* Current object sliding up and out */}
        <div className={`absolute inset-0 flex items-center gap-2 text-lg text-muted-foreground font-medium transition-transform duration-400 ease-out ${isAnimating ? 'transform -translate-y-full' : 'transform translate-y-0'
          }`}>
          <CurrentIconComponent className="h-5 w-5" />
          <span className="whitespace-nowrap">{pluralize(currentObject.label)}</span>
        </div>

        {/* Next object sliding up from below */}
        <div className={`absolute inset-0 flex items-center gap-2 text-lg text-muted-foreground font-medium transition-transform duration-400 ease-out ${isAnimating ? 'transform -translate-y-full' : 'transform translate-y-full'
          }`}>
          <NextIconComponent className="h-5" />
          <span className="whitespace-nowrap">{pluralize(nextObject.label)}</span>
        </div>
      </div>
    </div>
  );
}
