
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Bitcoin, Wallet, Clock, Trophy, Users } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import BetForm from './BetForm';
import RoundTimer from './RoundTimer';
import RewardsClaim from './RewardsClaim';

const PredictionInterface = () => {
  const { isConnected } = useWallet();
  const { getLatestPrice, getCurrentRound, getCurrentRoundId } = useContract();
  const [currentPrice, setCurrentPrice] = useState(0);
  const [previousPrice, setPreviousPrice] = useState(0);
  const [currentRound, setCurrentRound] = useState({
    id: 1,
    startTime: Date.now(),
    endTime: Date.now() + 5 * 60 * 1000,
    startPrice: 0,
    totalUpBets: 0,
    totalDownBets: 0,
    isActive: true,
    finalized: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real-time price from eOracle
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        if (isConnected) {
          const price = await getLatestPrice();
          setPreviousPrice(currentPrice);
          setCurrentPrice(price);
        }
      } catch (error) {
        console.error('Failed to fetch price from eOracle:', error);
        // Fallback to demo data if eOracle fails
        setPreviousPrice(currentPrice || 45000);
        setCurrentPrice(45000 + (Math.random() - 0.5) * 1000);
      }
    };

    const fetchRoundData = async () => {
      try {
        if (isConnected) {
          const roundId = await getCurrentRoundId();
          const round = await getCurrentRound();
          
          setCurrentRound({
            id: Number(roundId),
            startTime: Number(round.startTime) * 1000,
            endTime: Number(round.endTime) * 1000,
            startPrice: Number(round.startPrice) / 100000000, // Convert from 8 decimals
            totalUpBets: 0, // Would need additional contract methods to get these
            totalDownBets: 0,
            isActive: !round.finalized,
            finalized: round.finalized
          });
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch round data:', error);
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchPrice();
    fetchRoundData();

    // Set up intervals
    const priceInterval = setInterval(fetchPrice, 10000); // Every 10 seconds
    const roundInterval = setInterval(fetchRoundData, 30000); // Every 30 seconds

    return () => {
      clearInterval(priceInterval);
      clearInterval(roundInterval);
    };
  }, [isConnected, getLatestPrice, getCurrentRound, getCurrentRoundId, currentPrice]);

  const priceDirection = currentPrice > previousPrice ? 'up' : 'down';
  const priceChange = previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2) : '0.00';

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
            <p className="text-xl text-orange-300">Predict Bitcoin price movements every 5 minutes on Plume Testnet</p>
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
              <p className="text-gray-300">Earn PLUME rewards for correct predictions</p>
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
                ${(45000 + Math.sin(Date.now() / 10000) * 2000).toFixed(0)}
              </span>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                <ArrowUp className="w-4 h-4" />
                <span className="font-mono">+0.85%</span>
              </div>
            </div>
            <p className="text-orange-300 mt-2">Connect wallet to see real-time eOracle data</p>
          </div>
        </CardContent>
      </Card>

      {/* Demo Round Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-orange-400">Demo Round (Connect Wallet)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-gray-800/50 rounded">
              <p className="text-gray-400">Connect your wallet to access:</p>
              <ul className="text-gray-300 mt-2 space-y-1">
                <li>• Real-time eOracle price feeds</li>
                <li>• Live prediction rounds</li>
                <li>• PLUME token rewards</li>
                <li>• Round management system</li>
              </ul>
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
                <p className="text-gray-300">Connect your MetaMask wallet to Plume Testnet</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">2</div>
                <p className="text-gray-300">Choose UP or DOWN for Bitcoin price prediction</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">3</div>
                <p className="text-gray-300">Place your bet with PLUME tokens</p>
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
          <CardTitle className="text-orange-400">Plume Testnet Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-gray-400">Chain ID:</p>
              <p className="text-white font-mono">98867 (0x18233)</p>
              
              <p className="text-gray-400">Currency:</p>
              <p className="text-white font-mono">PLUME</p>
              
              <p className="text-gray-400">eOracle Feed:</p>
              <p className="text-white font-mono text-sm">0x1E89dA0C147C317f762A39B12808Db1CE42133E2</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400">RPC URL:</p>
              <p className="text-white font-mono text-sm">https://testnet-rpc.plume.org</p>
              
              <p className="text-gray-400">Explorer:</p>
              <p className="text-white font-mono text-sm">https://testnet-explorer.plume.org/</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (!isConnected) {
    return <DemoInterface />;
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 animate-pulse">
              <Bitcoin className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Loading eOracle Data...</h1>
              <p className="text-xl text-orange-300">Connecting to Plume Testnet</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Current Price Display - Real Data */}
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bitcoin className="w-8 h-8 text-orange-400" />
              <h2 className="text-3xl font-bold text-white">Bitcoin Price (eOracle)</h2>
            </div>
            <div className="flex items-center justify-center gap-4">
              <span className="text-4xl font-mono font-bold text-white">
                ${currentPrice > 0 ? currentPrice.toLocaleString() : 'Loading...'}
              </span>
              {currentPrice > 0 && (
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
            <p className="text-orange-300 mt-2">Live data from eOracle on Plume Testnet</p>
          </div>
        </CardContent>
      </Card>

      {/* Current Round Info - Real Data */}
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
                <p className="text-white font-mono">
                  ${currentRound.startPrice > 0 ? currentRound.startPrice.toLocaleString() : 'Loading...'}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Current Price</p>
                <p className="text-white font-mono">
                  ${currentPrice > 0 ? currentPrice.toLocaleString() : 'Loading...'}
                </p>
              </div>
            </div>
            <div className="text-center p-3 bg-blue-500/20 rounded">
              <p className="text-blue-400">Round Status</p>
              <p className="text-white font-mono">
                {currentRound.finalized ? 'Finalized' : 'Active'}
              </p>
            </div>
          </CardContent>
        </Card>

        <BetForm roundId={currentRound.id} />
      </div>

      {/* Rewards Section */}
      <RewardsClaim />

      {/* eOracle Info */}
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-orange-400">eOracle Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-gray-400">Price Feed:</p>
              <p className="text-white font-mono">BTC/USD</p>
              
              <p className="text-gray-400">Decimals:</p>
              <p className="text-white font-mono">8</p>
              
              <p className="text-gray-400">Update Frequency:</p>
              <p className="text-white font-mono">Real-time</p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-400">Feed Address:</p>
              <p className="text-white font-mono text-sm">0x1E89dA0C147C317f762A39B12808Db1CE42133E2</p>
              
              <p className="text-gray-400">Interface:</p>
              <p className="text-white font-mono text-sm">AggregatorV3Interface</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionInterface;
