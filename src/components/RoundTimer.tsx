
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

  const isExpiringSoon = timeLeft < 60; // Less than 1 minute

  return (
    <div className="text-center">
      <p className="text-gray-400 text-sm mb-2">Time Remaining</p>
      <div className={`text-2xl font-mono font-bold ${
        isExpiringSoon ? 'text-red-400' : 'text-orange-400'
      }`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      {isExpiringSoon && timeLeft > 0 && (
        <p className="text-red-400 text-xs mt-1 animate-pulse">
          Round ending soon!
        </p>
      )}
      {timeLeft === 0 && (
        <p className="text-gray-400 text-xs mt-1">
          Round ended
        </p>
      )}
    </div>
  );
};

export default RoundTimer;
