
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Bitcoin, Wallet } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import BetForm from './BetForm';
import RoundTimer from './RoundTimer';
import RewardsClaim from './RewardsClaim';

const PredictionInterface = () => {
  const { isConnected } = useWallet();
  const [currentPrice, setCurrentPrice] = useState(45000);
  const [previousPrice, setPreviousPrice] = useState(44800);
  const [currentRound, setCurrentRound] = useState({
    id: 1,
    startTime: Date.now(),
    endTime: Date.now() + 5 * 60 * 1000, // 5 minutes
    startPrice: 44800,
    totalUpBets: 1.2,
    totalDownBets: 0.8,
    isActive: true
  });

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviousPrice(currentPrice);
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * 1000;
        return Math.max(prev + change, 30000);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const priceDirection = currentPrice > previousPrice ? 'up' : 'down';
  const priceChange = ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2);

  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <div className="p-6 rounded-full bg-gradient-to-r from-orange-500/20 to-yellow-500/20 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Wallet className="w-12 h-12 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">Connect your wallet to start predicting Bitcoin prices</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Current Price Display */}
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bitcoin className="w-8 h-8 text-orange-400" />
              <h2 className="text-3xl font-bold text-white">Bitcoin Price</h2>
            </div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl font-mono font-bold text-white">
                ${currentPrice.toLocaleString()}
              </span>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                priceDirection === 'up' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {priceDirection === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="font-mono">{priceChange}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Round Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-orange-400">Current Round #{currentRound.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RoundTimer endTime={currentRound.endTime} />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Start Price</p>
                <p className="text-white font-mono">${currentRound.startPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Current Price</p>
                <p className="text-white font-mono">${currentPrice.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-2 bg-green-500/20 rounded">
                <p className="text-green-400">UP Pool</p>
                <p className="text-white font-mono">{currentRound.totalUpBets} cBTC</p>
              </div>
              <div className="text-center p-2 bg-red-500/20 rounded">
                <p className="text-red-400">DOWN Pool</p>
                <p className="text-white font-mono">{currentRound.totalDownBets} cBTC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <BetForm roundId={currentRound.id} />
      </div>

      {/* Rewards Section */}
      <RewardsClaim />

      {/* Recent Rounds */}
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-orange-400">Recent Rounds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                <span className="text-gray-400">Round #{currentRound.id - i - 1}</span>
                <div className="flex items-center gap-4">
                  <span className="text-white font-mono">$44,{800 + i * 100}</span>
                  <span className="text-white font-mono">→</span>
                  <span className="text-white font-mono">$44,{900 + i * 100}</span>
                  <div className={`px-2 py-1 rounded text-xs ${
                    i % 2 === 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {i % 2 === 0 ? 'UP' : 'DOWN'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionInterface;
