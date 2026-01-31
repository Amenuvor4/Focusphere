import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

const RateLimitCountdown = ({ retryAfterSeconds, onComplete }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(retryAfterSeconds);

  useEffect(() => {
    setSecondsRemaining(retryAfterSeconds);
  }, [retryAfterSeconds]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onComplete]);

  if (secondsRemaining <= 0) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeDisplay =
    minutes > 0
      ? `${minutes}:${seconds.toString().padStart(2, "0")}`
      : `${seconds}s`;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-sm">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>AI resting. Ready in</span>
      <span className="font-mono font-bold">{timeDisplay}</span>
      <Clock className="h-4 w-4 animate-pulse" />
    </div>
  );
};

export default RateLimitCountdown;
