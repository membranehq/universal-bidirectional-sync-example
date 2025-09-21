import { useState, useEffect } from "react";

interface PullCountdownProps {
  nextPullTime: number;
  pullInterval: number;
}

export function PullCountdown({ nextPullTime, pullInterval }: PullCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [nextPull, setNextPull] = useState<number>(nextPullTime);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Date.now();
      const diff = nextPull - now;

      if (diff <= 0) {
        // Time has passed, update to next interval
        const newNextPull = nextPull + (pullInterval * 1000);
        setNextPull(newNextPull);
        setTimeLeft(pullInterval * 1000);
      } else {
        setTimeLeft(diff);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [nextPull, pullInterval]);

  const hours = Math.floor(timeLeft / 3600000);
  const minutes = Math.floor((timeLeft % 3600000) / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <span className="font-medium">
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </span>
  );
} 