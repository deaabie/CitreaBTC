
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Bitcoin, Wallet, Clock, Trophy, Users } from 'lucide-react';
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

  const DemoInterface = () => (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500">
            <Bitcoin className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Bitcoin Price Prediction</h1>
            <p className="text-xl text-orange-300">Predict Bitcoin price movements every 5 minutes on Citrea Testnet</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">5-Minute Rounds</h3>
              <p className="text-gray-300">Fast-paced prediction rounds every 5 minutes</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Win Rewards</h3>
              <p className="text-gray-300">Earn cBTC rewards for correct predictions</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Community Pool</h3>
              <p className="text-gray-300">Join other traders in prediction pools</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Current Price Display */}
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bitcoin className="w-8 h-8 text-orange-400" />
              <h2 className="text-3xl font-bold text-white">Bitcoin Price (Demo)</h2>
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

      {/* Demo Round Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-orange-400">Current Round #{currentRound.id} (Demo)</CardTitle>
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

        <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-orange-400">How to Play</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">1</div>
                <p className="text-gray-300">Connect your MetaMask wallet to Citrea Testnet</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">2</div>
                <p className="text-gray-300">Choose UP or DOWN for Bitcoin price prediction</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">3</div>
                <p className="text-gray-300">Place your bet with cBTC tokens</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">4</div>
                <p className="text-gray-300">Wait 5 minutes for round to end and claim rewards</p>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet to Start
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Network Info */}
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-orange-400">Citrea Testnet Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-gray-400">Chain ID:</p>
              <p className="text-white font-mono">5115 (0x13FB)</p>
              
              <p className="text-gray-400">Currency:</p>
              <p className="text-white font-mono">cBTC</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400">RPC URL:</p>
              <p className="text-white font-mono text-sm">https://rpc.testnet.citrea.xyz</p>
              
              <p className="text-gray-400">Explorer:</p>
              <p className="text-white font-mono text-sm">https://explorer.testnet.citrea.xyz/</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Rounds */}
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-orange-400">Recent Rounds (Demo)</CardTitle>
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

  if (!isConnected) {
    return <DemoInterface />;
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
