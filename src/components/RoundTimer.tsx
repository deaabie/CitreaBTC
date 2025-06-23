
import React, { useState, useEffect } from 'react';

interface RoundTimerProps {
  endTime: number;
}

const RoundTimer: React.FC<RoundTimerProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  const minutes = Math.floor(timeLeft / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const isExpiringSoon = timeLeft < 60000; // Less than 1 minute

  return (
    <div className="text-center">
      <p className="text-gray-400 text-sm mb-2">Time Remaining</p>
      <div className={`text-2xl font-mono font-bold ${
        isExpiringSoon ? 'text-red-400' : 'text-orange-400'
      }`}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      {isExpiringSoon && (
        <p className="text-red-400 text-xs mt-1 animate-pulse">
          Round ending soon!
        </p>
      )}
    </div>
  );
};

export default RoundTimer;
