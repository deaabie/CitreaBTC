
import React, { useState, useEffect } from 'react';
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
  const { getLatestPrice, checkAndStartNewRound, getCurrentRoundId, isInitializing } = useContract();
  
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [previousPrice, setPreviousPrice] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [roundId, setRoundId] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRoundTransitioning, setIsRoundTransitioning] = useState(false);

  // Fetch real-time data and manage rounds
  useEffect(() => {
    if (!isConnected || isInitializing) {
      setLoading(true);
      return;
    }

    const fetchDataAndManageRounds = async () => {
      try {
        setError(null);
        console.log('Fetching data and checking round status...');
        
        // Get latest price first
        const price = await getLatestPrice();
        setPreviousPrice(currentPrice);
        setCurrentPrice(price);
        
        // Check and manage rounds - this will auto-start new rounds if needed
        setIsRoundTransitioning(true);
        const round = await checkAndStartNewRound();
        const id = await getCurrentRoundId();
        
        if (round) {
          setCurrentRound(round);
          setRoundId(id);
        }
        
        setLoading(false);
        setIsRoundTransitioning(false);
        
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
      }
    };

    // Initial fetch
    fetchDataAndManageRounds();

    // Update every 10 seconds for more responsive round management
    const interval = setInterval(fetchDataAndManageRounds, 10000);
    return () => clearInterval(interval);
  }, [isConnected, isInitializing, getLatestPrice, checkAndStartNewRound, getCurrentRoundId, currentPrice]);

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
    return <ErrorState error={error} />;
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
    </div>
  );
};

export default PredictionInterface;
