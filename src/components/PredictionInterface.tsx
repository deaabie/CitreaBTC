
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
  
  // Use refs to prevent unnecessary re-renders
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Fetch price with caching
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

  // Check round status with caching
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

  // Initial data fetch
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

  // Manual round transition
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
        // Force check for auto transition
        if (isAutoMode) {
          forceCheck?.();
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [currentRound, roundNeedsTransition, isAutoMode, forceCheck]);

  // Reduced frequency data updates
  useEffect(() => {
    if (!isConnected || isInitializing) {
      setLoading(true);
      return;
    }

    initializeData();

    // Background updates with reduced frequency
    intervalRef.current = setInterval(async () => {
      const now = Date.now();
      
      if (now - lastUpdateRef.current < 15000) return; // Minimum 15 seconds
      lastUpdateRef.current = now;
      
      try {
        await Promise.all([
          fetchPrice(),
          checkRounds()
        ]);
      } catch (error) {
        console.warn('Background update failed:', error);
      }
    }, 45000); // Reduced to 45 seconds
    
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
      {/* Auto Mode Toggle */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-blue-300 font-medium">Auto Round Management</h3>
            <p className="text-blue-200 text-sm">
              {isAutoMode ? 'Rounds will transition automatically' : 'Manual round transition required'}
            </p>
          </div>
          <button
            onClick={() => setIsAutoMode(!isAutoMode)}
            className={`px-4 py-2 rounded font-medium ${
              isAutoMode 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            {isAutoMode ? 'AUTO ON' : 'AUTO OFF'}
          </button>
        </div>
      </div>

      {/* Live Price Display */}
      <PriceDisplay currentPrice={currentPrice} previousPrice={previousPrice} />

      {/* Manual Round Transition (only show if auto mode is off) */}
      {!isAutoMode && roundNeedsTransition && (
        <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-300 font-medium">Round #{roundId} has ended</p>
              <p className="text-orange-200 text-sm">Click to start the next round manually</p>
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
            disabled={!isRoundActive || (roundNeedsTransition && !isAutoMode)}
          />
        </div>
      )}

      {/* Rewards Section */}
      <RewardsClaim />

      {/* Debug Info for Development */}
      {process.env.NODE_ENV === 'development' && (
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
      )}
    </div>
  );
};

export default PredictionInterface;
