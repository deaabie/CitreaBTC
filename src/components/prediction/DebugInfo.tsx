
import React from 'react';

interface DebugInfoProps {
  isAutoMode: boolean;
  roundNeedsTransition: boolean;
  isRoundActive: boolean;
  timeLeft: number;
  currentPrice: number;
  roundId: number;
  currentRound: any;
}

const DebugInfo: React.FC<DebugInfoProps> = ({
  isAutoMode,
  roundNeedsTransition,
  isRoundActive,
  timeLeft,
  currentPrice,
  roundId,
  currentRound
}) => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-xs text-gray-400">
      <p><strong>Debug Info:</strong></p>
      <p>Auto Mode: {isAutoMode ? 'ON' : 'OFF'}</p>
      <p>Round Needs Transition: {roundNeedsTransition ? 'Yes' : 'No'}</p>
      <p>Round Active: {isRoundActive ? 'Yes' : 'No'}</p>
      <p>Time Left: {timeLeft}s</p>
      <p>Current Price: ${currentPrice.toLocaleString()}</p>
      <p>Round ID: {roundId}</p>
      <p>Round Finalized: {currentRound?.finalized ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default DebugInfo;
