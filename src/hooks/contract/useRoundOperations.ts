
import { useCallback } from 'react';
import { ethers } from 'ethers';

export const useRoundOperations = (contract: ethers.Contract | null) => {
  const getCurrentRound = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      const round = await contract.getCurrentRound();
      const roundData = {
        startTime: Number(round.startTime),
        endTime: Number(round.endTime),
        startPrice: Number(round.startPrice),
        endPrice: Number(round.endPrice),
        isUp: round.isUp,
        finalized: round.finalized
      };
      
      return roundData;
    } catch (error) {
      console.error('Error getting current round:', error);
      throw error;
    }
  }, [contract]);

  // Check if round needs transition without triggering it
  const checkRoundStatus = useCallback(async () => {
    if (!contract) return null;
    
    try {
      const round = await getCurrentRound();
      const now = Math.floor(Date.now() / 1000);
      
      const needsTransition = now >= round.endTime && !round.finalized;
      
      return {
        round,
        needsTransition,
        timeLeft: Math.max(0, round.endTime - now)
      };
    } catch (error) {
      console.error('Error checking round status:', error);
      throw error;
    }
  }, [contract, getCurrentRound]);

  // Only trigger round transition when explicitly called
  const triggerRoundTransition = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    console.log('Manually triggering round transition...');
    try {
      const tx = await contract.startNewRound({
        gasLimit: 800000
      });
      console.log('Round transition tx:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Round transition completed, gas used:', receipt.gasUsed.toString());
      
      return receipt;
    } catch (error: any) {
      console.error('Error triggering round transition:', error);
      
      if (error.message.includes('Price feed too old')) {
        throw new Error('Cannot start new round: Blocksense price feed data is too old. Please wait for feed to update.');
      }
      
      throw new Error(`Failed to start new round: ${error.message}`);
    }
  }, [contract]);

  const getCurrentRoundId = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      const roundId = await contract.currentRoundId();
      return Number(roundId);
    } catch (error) {
      console.error('Error getting current round ID:', error);
      throw error;
    }
  }, [contract]);

  // Legacy function for backward compatibility
  const startNewRound = useCallback(async () => {
    return await triggerRoundTransition();
  }, [triggerRoundTransition]);

  const forceRoundTransition = useCallback(async () => {
    return await triggerRoundTransition();
  }, [triggerRoundTransition]);

  // Renamed from checkAndStartNewRound to avoid automatic transitions
  const checkAndStartNewRound = useCallback(async () => {
    const status = await checkRoundStatus();
    if (!status) return null;
    
    // Only return round data, don't automatically trigger transitions
    return status.round;
  }, [checkRoundStatus]);

  return {
    getCurrentRound,
    checkRoundStatus,
    triggerRoundTransition,
    checkAndStartNewRound,
    getCurrentRoundId,
    startNewRound,
    forceRoundTransition
  };
};
