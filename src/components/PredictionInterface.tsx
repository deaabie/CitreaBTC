
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import BetForm from './BetForm';
import RewardsClaim from './RewardsClaim';
import HeroSection from './prediction/HeroSection';
import PriceDisplay from './prediction/PriceDisplay';
import HowToPlay from './prediction/HowToPlay';
import NetworkInfo from './prediction/NetworkInfo';
import LoadingState from './prediction/LoadingState';
import ErrorState from './prediction/ErrorState';
import RoundTransitionNotice from './prediction/RoundTransitionNotice';
import CurrentRoundInfo from './prediction/CurrentRoundInfo';

const PredictionInterface = () => {
  const { isConnected, connectWallet } = useWallet();
  const { 
    getLatestPriceWithFallback, 
    checkRoundStatus,
    triggerRoundTransition,
    getCurrentRoundId, 
    isInitializing
  } = useContract();
  
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [roundId, setRoundId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roundNeedsTransition, setRoundNeedsTransition] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  // Use refs to prevent unnecessary re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Separate price fetching from round management
  const fetchPrice = useCallback(async () => {
    try {
      const price = await getLatestPriceWithFallback();
      setPreviousPrice(currentPrice);
      setCurrentPrice(price);
      return price;
    } catch (error: any) {
      console.error('Error fetching price:', error);
      // Don't throw error for price fetch failures, use fallback
      return currentPrice || 95000;
    }
  }, [getLatestPriceWithFallback, currentPrice]);

  // Separate round status checking
  const checkRounds = useCallback(async () => {
    try {
      const status = await checkRoundStatus();
      const id = await getCurrentRoundId();
      
      if (status) {
        setCurrentRound(status.round);
        setRoundId(id);
        setRoundNeedsTransition(status.needsTransition);
        setTimeLeft(status.timeLeft);
      }
      
      return status;
    } catch (error: any) {
      console.error('Error checking rounds:', error);
      setError(error.message);
      return null;
    }
  }, [checkRoundStatus, getCurrentRoundId]);

  // Initial data fetch
  const initializeData = useCallback(async () => {
    if (!isConnected || isInitializing) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Initializing prediction interface...');
      
      // Fetch price and round data in parallel
      const [price] = await Promise.all([
        fetchPrice(),
        checkRounds()
      ]);
      
      console.log('Initialization complete:', {
        price: `$${price?.toLocaleString()}`,
        connected: isConnected
      });
      
      setLoading(false);
    } catch (error: any) {
      console.error('Initialization error:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [isConnected, isInitializing, fetchPrice, checkRounds]);

  // Handle manual round transition
  const handleRoundTransition = useCallback(async () => {
    try {
      setError(null);
      console.log('User triggered round transition...');
      
      await triggerRoundTransition();
      
      // Refresh data after transition
      await checkRounds();
      
      console.log('Round transition completed');
    } catch (error: any) {
      console.error('Round transition error:', error);
      setError(error.message);
    }
  }, [triggerRoundTransition, checkRounds]);

  // Timer effect for countdown
  useEffect(() => {
    if (!currentRound || currentRound.finalized) return;
    
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, currentRound.endTime - now);
      setTimeLeft(remaining);
      
      if (remaining === 0 && !roundNeedsTransition) {
        setRoundNeedsTransition(true);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentRound, roundNeedsTransition]);

  // Data fetching effect with reduced frequency
  useEffect(() => {
    if (!isConnected || isInitializing) {
      setLoading(true);
      return;
    }

    // Initial fetch
    initializeData();

    // Set up interval for data updates (reduced frequency)
    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      
      // Prevent too frequent updates
      if (now - lastUpdateRef.current < 10000) return; // Minimum 10 seconds between updates
      
      lastUpdateRef.current = now;
      
      try {
        // Only fetch price and check round status, don't auto-transition
        await Promise.all([
          fetchPrice(),
          checkRounds()
        ]);
      } catch (error) {
        console.warn('Background update failed:', error);
      }
    }, 30000); // Increased to 30 seconds to reduce UI refreshing
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected, isInitializing, initializeData, fetchPrice, checkRounds]);

  if (!isConnected) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <HeroSection />
        <PriceDisplay currentPrice={95000} previousPrice={92683} isDemo={true} />
        <HowToPlay onConnectWallet={connectWallet} />
        <NetworkInfo />
      </div>
    );
  }

  if (loading || isInitializing) {
    return <LoadingState isInitializing={isInitializing} />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState error={error} onRetry={initializeData} />
        
        {/* Show manual transition option if round needs transition */}
        {roundNeedsTransition && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-300 mb-3">
                Round has ended. Click below to start the next round:
              </p>
              <button
                onClick={handleRoundTransition}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium"
              >
                Start Next Round
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const isRoundActive = currentRound && !currentRound.finalized && timeLeft > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Live Price Display */}
      <PriceDisplay currentPrice={currentPrice} previousPrice={previousPrice} />

      {/* Round Needs Transition Notice */}
      {roundNeedsTransition && (
        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 font-medium">Round #{roundId} has ended</p>
              <p className="text-orange-200 text-sm">Click to start the next round and finalize results</p>
            </div>
            <button
              onClick={handleRoundTransition}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded font-medium"
            >
              Start Next Round
            </button>
          </div>
        </div>
      )}

      {/* Current Round Info */}
      {currentRound && (
        <div className="grid md:grid-cols-2 gap-6">
          <CurrentRoundInfo 
            roundId={roundId} 
            currentRound={currentRound} 
            currentPrice={currentPrice}
            timeLeft={timeLeft}
          />

          <BetForm 
            roundId={roundId} 
            disabled={!isRoundActive || roundNeedsTransition}
          />
        </div>
      )}

      {/* Rewards Section */}
      <RewardsClaim />

      {/* Debug Info for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-xs text-gray-400">
          <p><strong>Debug Info:</strong></p>
          <p>Round Needs Transition: {roundNeedsTransition ? 'Yes' : 'No'}</p>
          <p>Round Active: {isRoundActive ? 'Yes' : 'No'}</p>
          <p>Time Left: {timeLeft}s</p>
          <p>Current Price: ${currentPrice.toLocaleString()}</p>
          <p>Round ID: {roundId}</p>
          <p>Round Finalized: {currentRound?.finalized ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default PredictionInterface;
