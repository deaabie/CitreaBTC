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
import CurrentRoundInfo from './prediction/CurrentRoundInfo';
import AutoModeToggle from './prediction/AutoModeToggle';
import ManualRoundTransition from './prediction/ManualRoundTransition';
import DebugInfo from './prediction/DebugInfo';
import UserBetsTable from './prediction/UserBetsTable';
import PoolBalance from './prediction/PoolBalance';

const PredictionInterface = () => {
  const { isConnected, connectWallet } = useWallet();
  const { 
    getLatestPriceWithFallback, 
    checkRoundStatus,
    triggerRoundTransition,
    getCurrentRoundId, 
    isInitializing,
    forceCheck
  } = useContract();
  
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [roundId, setRoundId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roundNeedsTransition, setRoundNeedsTransition] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isAutoMode, setIsAutoMode] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const fetchPrice = useCallback(async () => {
    try {
      const price = await getLatestPriceWithFallback();
      setPreviousPrice(prev => prev === 0 ? price : currentPrice);
      setCurrentPrice(price);
      return price;
    } catch (error: any) {
      console.error('Error fetching price:', error);
      return currentPrice || 95000;
    }
  }, [getLatestPriceWithFallback, currentPrice]);

  const checkRounds = useCallback(async () => {
    try {
      const [status, id] = await Promise.all([
        checkRoundStatus(),
        getCurrentRoundId()
      ]);
      
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

  const initializeData = useCallback(async () => {
    if (!isConnected || isInitializing) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Initializing prediction interface...');
      
      const [price] = await Promise.all([
        fetchPrice(),
        checkRounds()
      ]);
      
      console.log('Initialization complete');
      setLoading(false);
    } catch (error: any) {
      console.error('Initialization error:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [isConnected, isInitializing, fetchPrice, checkRounds]);

  const handleRoundTransition = useCallback(async () => {
    try {
      setError(null);
      console.log('Manual round transition...');
      
      await triggerRoundTransition();
      await checkRounds();
      
      console.log('Manual round transition completed');
    } catch (error: any) {
      console.error('Manual round transition error:', error);
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
        if (isAutoMode) {
          forceCheck?.();
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentRound, roundNeedsTransition, isAutoMode, forceCheck]);

  // Background data updates
  useEffect(() => {
    if (!isConnected || isInitializing) {
      setLoading(true);
      return;
    }

    initializeData();

    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      
      if (now - lastUpdateRef.current < 15000) return;
      lastUpdateRef.current = now;
      
      try {
        await Promise.all([
          fetchPrice(),
          checkRounds()
        ]);
      } catch (error) {
        console.warn('Background update failed:', error);
      }
    }, 45000);
    
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
      <AutoModeToggle 
        isAutoMode={isAutoMode} 
        onToggle={() => setIsAutoMode(!isAutoMode)} 
      />

      <PriceDisplay currentPrice={currentPrice} previousPrice={previousPrice} />

      <PoolBalance />

      <ManualRoundTransition
        isVisible={!isAutoMode && roundNeedsTransition}
        roundId={roundId}
        onTransition={handleRoundTransition}
      />

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
            disabled={!isRoundActive || (roundNeedsTransition && !isAutoMode)}
          />
        </div>
      )}

      <UserBetsTable currentRoundId={roundId} />

      <RewardsClaim />

      <DebugInfo
        isAutoMode={isAutoMode}
        roundNeedsTransition={roundNeedsTransition}
        isRoundActive={isRoundActive}
        timeLeft={timeLeft}
        currentPrice={currentPrice}
        roundId={roundId}
        currentRound={currentRound}
      />
    </div>
  );
};

export default PredictionInterface;
