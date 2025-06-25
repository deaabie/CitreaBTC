
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Bitcoin, Wallet, Clock, Trophy, Users } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import { BLOCKSENSE_CONFIG } from '@/config/contracts';
import BetForm from './BetForm';
import RoundTimer from './RoundTimer';
import RewardsClaim from './RewardsClaim';

const PredictionInterface = () => {
  const { isConnected } = useWallet();
  const { getLatestPrice, getCurrentRound, getCurrentRoundId } = useContract();
  
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [roundId, setRoundId] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Fetch real-time data from Blocksense
  useEffect(() => {
    if (!isConnected) return;

    const fetchData = async () => {
      try {
        const [price, round, id] = await Promise.all([
          getLatestPrice(),
          getCurrentRound(),
          getCurrentRoundId()
        ]);
        
        setPreviousPrice(currentPrice);
        setCurrentPrice(price);
        setCurrentRound(round);
        setRoundId(Number(id));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching real-time data:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Update every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isConnected, getLatestPrice, getCurrentRound, getCurrentRoundId, currentPrice]);

  const priceDirection = currentPrice > previousPrice ? 'up' : 'down';
  const priceChange = previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2) : '0.00';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

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
            <p className="text-xl text-orange-300">Predict Bitcoin price movements every 15 minutes on Citrea Testnet</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">15-Minute Rounds</h3>
              <p className="text-gray-300">Prediction rounds every 15 minutes using Blocksense data</p>
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

      {/* Current Price Display - Demo */}
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bitcoin className="w-8 h-8 text-orange-400" />
              <h2 className="text-3xl font-bold text-white">Bitcoin Price (Demo)</h2>
            </div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl font-mono font-bold text-white">
                $45,000.00
              </span>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                <ArrowUp className="w-4 h-4" />
                <span className="font-mono">+2.5%</span>
              </div>
            </div>
            <p className="text-gray-400 mt-2">Connect wallet to see live Blocksense data</p>
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
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
              <p className="text-gray-300">Wait 15 minutes for round to end and claim rewards</p>
            </div>
          </div>
          <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet to Start
          </Button>
        </CardContent>
      </Card>

      {/* Network Info */}
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-orange-400">Citrea Testnet & Blocksense Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-gray-400">Chain ID:</p>
              <p className="text-white font-mono">5115 (0x13FB)</p>
              
              <p className="text-gray-400">Currency:</p>
              <p className="text-white font-mono">cBTC</p>
              
              <p className="text-gray-400">Round Duration:</p>
              <p className="text-white font-mono">15 minutes</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400">Price Feed:</p>
              <p className="text-white font-mono text-sm">Blocksense BTC/USDT</p>
              
              <p className="text-gray-400">Feed Address:</p>
              <p className="text-white font-mono text-sm">{BLOCKSENSE_CONFIG.BTC_USDT_FEED.address}</p>
              
              <p className="text-gray-400">Explorer:</p>
              <p className="text-white font-mono text-sm">https://explorer.testnet.citrea.xyz/</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!isConnected) {
    return <DemoInterface />;
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500">
              <Bitcoin className="w-12 h-12 text-white animate-spin" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Loading...</h1>
              <p className="text-xl text-orange-300">Fetching live data from Blocksense</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Live Price Display */}
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bitcoin className="w-8 h-8 text-orange-400" />
              <h2 className="text-3xl font-bold text-white">Bitcoin Price (Live from Blocksense)</h2>
            </div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl font-mono font-bold text-white">
                {formatPrice(currentPrice)}
              </span>
              {previousPrice > 0 && (
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  priceDirection === 'up' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {priceDirection === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  <span className="font-mono">{priceChange}%</span>
                </div>
              )}
            </div>
            <p className="text-gray-400 mt-2">Real-time BTC/USDT price from Blocksense oracle</p>
          </div>
        </CardContent>
      </Card>

      {/* Current Round Info */}
      {currentRound && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-orange-400">Current Round #{roundId}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RoundTimer endTime={Number(currentRound.endTime) * 1000} />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Start Price</p>
                  <p className="text-white font-mono">{formatPrice(Number(currentRound.startPrice) / 100000000)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current Price</p>
                  <p className="text-white font-mono">{formatPrice(currentPrice)}</p>
                </div>
              </div>
              <div className="text-center p-2 bg-blue-500/20 rounded">
                <p className="text-blue-400">Round Status</p>
                <p className="text-white font-mono">{currentRound.finalized ? 'Finalized' : 'Active'}</p>
              </div>
            </CardContent>
          </Card>

          <BetForm roundId={roundId} />
        </div>
      )}

      {/* Rewards Section */}
      <RewardsClaim />
    </div>
  );
};

export default PredictionInterface;
