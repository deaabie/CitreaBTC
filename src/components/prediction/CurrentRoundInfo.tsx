
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CurrentRoundInfoProps {
  roundId: number;
  currentRound: any;
  currentPrice: number;
  timeLeft?: number;
}

const CurrentRoundInfo: React.FC<CurrentRoundInfoProps> = ({ 
  roundId, 
  currentRound, 
  currentPrice, 
  timeLeft 
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const displayTimeLeft = timeLeft !== undefined ? timeLeft : Math.max(0, currentRound.endTime - Math.floor(Date.now() / 1000));
  const isExpiringSoon = displayTimeLeft < 60 && displayTimeLeft > 0;
  const hasEnded = displayTimeLeft === 0;

  return (
    <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-orange-400">Current Round #{roundId}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timer */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Time Remaining</p>
          <div className={`text-2xl font-mono font-bold ${
            hasEnded ? 'text-red-500' :
            isExpiringSoon ? 'text-red-400' : 'text-orange-400'
          }`}>
            {formatTime(displayTimeLeft)}
          </div>
          {isExpiringSoon && !hasEnded && (
            <p className="text-red-400 text-xs mt-1 animate-pulse">
              Round ending soon!
            </p>
          )}
          {hasEnded && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              Round ended - Awaiting next round
            </p>
          )}
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Start Price</p>
            <p className="text-white font-mono">{formatPrice(currentRound.startPrice / 100000000)}</p>
          </div>
          <div>
            <p className="text-gray-400">Current Price</p>
            <p className="text-white font-mono">{formatPrice(currentPrice)}</p>
          </div>
        </div>

        {/* Round Status */}
        <div className="text-center p-2 bg-blue-500/20 rounded">
          <p className="text-blue-400">Round Status</p>
          <p className="text-white font-mono">
            {currentRound.finalized ? 'Finalized' : 
             hasEnded ? 'Ended (Awaiting Transition)' : 'Active'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentRoundInfo;
