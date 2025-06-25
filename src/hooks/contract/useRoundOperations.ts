
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

  // Enhanced round transition with better error handling
  const triggerRoundTransition = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    console.log('Triggering round transition...');
    
    try {
      // First verify we can call the price feed
      const latestPrice = await contract.getLatestPrice();
      console.log('Price feed check passed:', latestPrice.toString());
      
      // Estimate gas first
      const gasEstimate = await contract.startNewRound.estimateGas();
      console.log('Gas estimate:', gasEstimate.toString());
      
      // Execute with higher gas limit
      const tx = await contract.startNewRound({
        gasLimit: Math.floor(Number(gasEstimate) * 1.2) // 20% buffer
      });
      
      console.log('Round transition tx:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Round transition completed, gas used:', receipt.gasUsed.toString());
      
      return receipt;
    } catch (error: any) {
      console.error('Error triggering round transition:', error);
      
      // Enhanced error handling
      if (error.code === 'CALL_EXCEPTION') {
        if (error.reason?.includes('Price feed too old')) {
          throw new Error('Cannot start new round: Price feed data is too old. Retrying in 2 minutes...');
        } else if (error.reason?.includes('Current round not finished')) {
          throw new Error('Current round has not finished yet');
        } else if (error.reason?.includes('Current round already finalized')) {
          throw new Error('Current round is already finalized');
        }
      }
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for gas fees');
      }
      
      if (error.code === 'NETWORK_ERROR') {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw new Error(`Failed to start new round: ${error.message || error.reason || 'Unknown error'}`);
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

  // Check round without auto-transition
  const checkAndStartNewRound = useCallback(async () => {
    const status = await checkRoundStatus();
    if (!status) return null;
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
