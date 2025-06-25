
import { useCallback } from 'react';
import { ethers } from 'ethers';

export const useBettingOperations = (contract: ethers.Contract | null, account: string | null, getCurrentRound: () => Promise<any>) => {
  const placeBet = useCallback(async (isUp: boolean, amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    if (!account) throw new Error('Wallet not connected');
    
    console.log(`Placing bet: ${isUp ? 'UP' : 'DOWN'}, Amount: ${amount} cBTC`);
    
    try {
      const round = await getCurrentRound();
      const now = Math.floor(Date.now() / 1000);
      
      if (now >= round.endTime) {
        throw new Error('Round has already ended. Please wait for the new round to start.');
      }
      
      if (round.finalized) {
        throw new Error('Round is already finalized. Please wait for the new round to start.');
      }
      
      const gasEstimate = await contract.placeBet.estimateGas(isUp, {
        value: ethers.parseEther(amount)
      });
      
      console.log('Gas estimate:', gasEstimate.toString());
      
      const tx = await contract.placeBet(isUp, {
        value: ethers.parseEther(amount),
        gasLimit: gasEstimate * BigInt(120) / BigInt(100)
      });
      
      console.log('Transaction hash:', tx.hash);
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      return receipt;
    } catch (error: any) {
      console.error('Error placing bet:', error);
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by user');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient cBTC balance');
      } else if (error.message.includes('Round already ended')) {
        throw new Error('Round has already ended');
      } else if (error.message.includes('Round already finalized')) {
        throw new Error('Round is already finalized');
      } else {
        throw new Error(error.message || 'Failed to place bet');
      }
    }
  }, [contract, account, getCurrentRound]);

  const getUserBets = useCallback(async (roundId: number, userAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.getUserBets(roundId, userAddress);
  }, [contract]);

  return {
    placeBet,
    getUserBets
  };
};
