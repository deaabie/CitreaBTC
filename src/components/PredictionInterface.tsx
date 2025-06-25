
import React, { useState, useEffect, useCallback } from 'react';
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
    checkAndStartNewRound, 
    getCurrentRoundId, 
    isInitializing,
    forceRoundTransition
  } = useContract();
  
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [roundId, setRoundId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRoundTransitioning, setIsRoundTransitioning] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const fetchDataAndManageRounds = useCallback(async () => {
    try {
      setError(null);
      console.log('Fetching data and checking round status...');
      
      // Get latest price with fallback
      const price = await getLatestPriceWithFallback();
      setPreviousPrice(currentPrice);
      setCurrentPrice(price);
      
      // Check and manage rounds
      setIsRoundTransitioning(true);
      const round = await checkAndStartNewRound();
      const id = await getCurrentRoundId();
      
      if (round) {
        setCurrentRound(round);
        setRoundId(id);
      }
      
      setLoading(false);
      setIsRoundTransitioning(false);
      setRetryCount(0); // Reset retry count on success
      
      console.log('Data updated successfully:', {
        price: `$${price.toLocaleString()}`,
        roundId: id,
        roundFinalized: round?.finalized,
        roundEndTime: round ? new Date(round.endTime * 1000).toLocaleString() : 'N/A',
        timeLeft: round ? Math.max(0, round.endTime - Math.floor(Date.now() / 1000)) : 0
      });
    } catch (error: any) {
      console.error('Error fetching data or managing rounds:', error);
      setError(error.message || 'Failed to fetch data from contract');
      setLoading(false);
      setIsRoundTransitioning(false);
      setRetryCount(prev => prev + 1);
    }
  }, [isConnected, isInitializing, getLatestPriceWithFallback, checkAndStartNewRound, getCurrentRoundId, currentPrice]);

  const handleRetry = useCallback(() => {
    console.log('Manual retry triggered');
    setLoading(true);
    setError(null);
    fetchDataAndManageRounds();
  }, [fetchDataAndManageRounds]);

  const handleForceRoundTransition = useCallback(async () => {
    try {
      setIsRoundTransitioning(true);
      setError(null);
      console.log('Forcing round transition...');
      
      await forceRoundTransition();
      
      // Refresh data after forced transition
      await fetchDataAndManageRounds();
    } catch (error: any) {
      console.error('Error forcing round transition:', error);
      setError(error.message || 'Failed to force round transition');
      setIsRoundTransitioning(false);
    }
  }, [forceRoundTransition, fetchDataAndManageRounds]);

  // Data fetching effect
  useEffect(() => {
    if (!isConnected || isInitializing) {
      setLoading(true);
      return;
    }

    // Initial fetch
    fetchDataAndManageRounds();

    // Set up interval - use longer interval if there are repeated errors
    const intervalTime = retryCount > 3 ? 30000 : 15000; // 30s if errors, otherwise 15s
    const interval = setInterval(fetchDataAndManageRounds, intervalTime);
    
    return () => clearInterval(interval);
  }, [isConnected, isInitializing, fetchDataAndManageRounds, retryCount]);

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
        <ErrorState error={error} onRetry={handleRetry} />
        
        {/* Show force transition button if it's a round-related error */}
        {error.includes('round') && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-300 mb-3">
                If the round appears stuck, you can try to force a round transition:
              </p>
              <button
                onClick={handleForceRoundTransition}
                disabled={isRoundTransitioning}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-medium"
              >
                {isRoundTransitioning ? 'Forcing Transition...' : 'Force Round Transition'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Live Price Display */}
      <PriceDisplay currentPrice={currentPrice} previousPrice={previousPrice} />

      {/* Round Transition Notice */}
      <RoundTransitionNotice isVisible={isRoundTransitioning} />

      {/* Current Round Info */}
      {currentRound && (
        <div className="grid md:grid-cols-2 gap-6">
          <CurrentRoundInfo 
            roundId={roundId} 
            currentRound={currentRound} 
            currentPrice={currentPrice} 
          />

          <BetForm 
            roundId={roundId} 
            disabled={isRoundTransitioning || currentRound.finalized || Math.floor(Date.now() / 1000) >= currentRound.endTime}
          />
        </div>
      )}

      {/* Rewards Section */}
      <RewardsClaim />

      {/* Debug Info for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 text-xs text-gray-400">
          <p><strong>Debug Info:</strong></p>
          <p>Retry Count: {retryCount}</p>
          <p>Round Transitioning: {isRoundTransitioning ? 'Yes' : 'No'}</p>
          <p>Current Price: ${currentPrice.toLocaleString()}</p>
          <p>Round ID: {roundId}</p>
          <p>Round Finalized: {currentRound?.finalized ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default PredictionInterface;
