
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RoundTimer from '@/components/RoundTimer';

interface CurrentRoundInfoProps {
  roundId: number;
  currentRound: any;
  currentPrice: number;
}

const CurrentRoundInfo: React.FC<CurrentRoundInfoProps> = ({ roundId, currentRound, currentPrice }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-orange-400">Current Round #{roundId}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RoundTimer endTime={currentRound.endTime} />
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
        <div className="text-center p-2 bg-blue-500/20 rounded">
          <p className="text-blue-400">Round Status</p>
          <p className="text-white font-mono">
            {currentRound.finalized ? 'Finalized' : 
             Math.floor(Date.now() / 1000) >= currentRound.endTime ? 'Ended (Finalizing...)' : 'Active'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentRoundInfo;
