
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
      
      console.log('Current round data:', {
        ...roundData,
        startTime: new Date(roundData.startTime * 1000).toLocaleString(),
        endTime: new Date(roundData.endTime * 1000).toLocaleString(),
        timeLeft: Math.max(0, roundData.endTime - Math.floor(Date.now() / 1000))
      });
      
      return roundData;
    } catch (error) {
      console.error('Error getting current round:', error);
      throw error;
    }
  }, [contract]);

  const checkAndStartNewRound = useCallback(async () => {
    if (!contract) return null;
    
    try {
      const round = await getCurrentRound();
      const now = Math.floor(Date.now() / 1000);
      
      if (now >= round.endTime && !round.finalized) {
        console.log('Round has ended, starting new round...');
        const tx = await contract.startNewRound();
        console.log('Starting new round, tx hash:', tx.hash);
        await tx.wait();
        console.log('New round started successfully');
        
        return await getCurrentRound();
      }
      
      return round;
    } catch (error) {
      console.error('Error checking/starting new round:', error);
      throw error;
    }
  }, [contract, getCurrentRound]);

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

  const startNewRound = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    console.log('Starting new round...');
    const tx = await contract.startNewRound();
    return tx.wait();
  }, [contract]);

  return {
    getCurrentRound,
    checkAndStartNewRound,
    getCurrentRoundId,
    startNewRound
  };
};
