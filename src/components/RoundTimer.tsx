
import React, { useState, useEffect } from 'react';

interface RoundTimerProps {
  endTime: number; // Unix timestamp in seconds
}

const RoundTimer: React.FC<RoundTimerProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isExpiringSoon = timeLeft < 60 && timeLeft > 0; // Less than 1 minute but not ended
  const hasEnded = timeLeft === 0;

  return (
    <div className="text-center">
      <p className="text-gray-400 text-sm mb-2">Time Remaining</p>
      <div className={`text-2xl font-mono font-bold ${
        hasEnded ? 'text-red-500' :
        isExpiringSoon ? 'text-red-400' : 'text-orange-400'
      }`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      {isExpiringSoon && !hasEnded && (
        <p className="text-red-400 text-xs mt-1 animate-pulse">
          Round ending soon!
        </p>
      )}
      {hasEnded && (
        <p className="text-red-500 text-xs mt-1 font-medium">
          Round ended - New round starting...
        </p>
      )}
    </div>
  );
};

export default RoundTimer;
