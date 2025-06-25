
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
        timeLeft: Math.max(0, roundData.endTime - Math.floor(Date.now() / 1000)),
        startPrice: (roundData.startPrice / 100000000).toFixed(2),
        endPrice: roundData.endPrice > 0 ? (roundData.endPrice / 100000000).toFixed(2) : 'Not set'
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
      
      console.log('Round check:', {
        now: new Date(now * 1000).toLocaleString(),
        endTime: new Date(round.endTime * 1000).toLocaleString(),
        hasEnded: now >= round.endTime,
        isFinalized: round.finalized,
        needsNewRound: now >= round.endTime && !round.finalized
      });
      
      if (now >= round.endTime && !round.finalized) {
        console.log('Round has ended, attempting to start new round...');
        try {
          const tx = await contract.startNewRound({
            gasLimit: 800000 // Increased gas limit for complex operations
          });
          console.log('Starting new round, tx hash:', tx.hash);
          
          // Wait for transaction confirmation
          const receipt = await tx.wait();
          console.log('New round started successfully, gas used:', receipt.gasUsed.toString());
          
          // Get the updated round data
          const newRound = await getCurrentRound();
          console.log('New round started with ID:', await getCurrentRoundId());
          return newRound;
        } catch (startError: any) {
          console.error('Failed to start new round:', startError);
          
          // If it's a price feed error, provide more context
          if (startError.message.includes('Price feed too old')) {
            throw new Error('Cannot start new round: Blocksense price feed data is too old. Please wait for feed to update or try again later.');
          }
          
          throw new Error(`Failed to start new round: ${startError.message}`);
        }
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
    console.log('Manually starting new round...');
    
    try {
      const tx = await contract.startNewRound({
        gasLimit: 800000
      });
      console.log('Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('New round started successfully, gas used:', receipt.gasUsed.toString());
      return receipt;
    } catch (error: any) {
      console.error('Error starting new round:', error);
      if (error.message.includes('Price feed too old')) {
        throw new Error('Cannot start new round: Price feed data is too old');
      }
      throw error;
    }
  }, [contract]);

  const forceRoundTransition = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    console.log('Forcing round transition...');
    try {
      // First check if we can transition
      const round = await getCurrentRound();
      const now = Math.floor(Date.now() / 1000);
      
      if (now < round.endTime) {
        throw new Error('Round has not ended yet');
      }
      
      if (round.finalized) {
        throw new Error('Round is already finalized');
      }
      
      // Try to start new round with higher gas limit
      const tx = await contract.startNewRound({
        gasLimit: 1000000 // Higher gas limit for potential issues
      });
      
      console.log('Force transition tx:', tx.hash);
      const receipt = await tx.wait();
      console.log('Round transition completed');
      
      return receipt;
    } catch (error) {
      console.error('Error forcing round transition:', error);
      throw error;
    }
  }, [contract, getCurrentRound]);

  return {
    getCurrentRound,
    checkAndStartNewRound,
    getCurrentRoundId,
    startNewRound,
    forceRoundTransition
  };
};
