
import { useCallback } from 'react';
import { ethers } from 'ethers';

export const useRewardOperations = (contract: ethers.Contract | null) => {
  const claimRewards = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    console.log('Claiming rewards...');
    try {
      const tx = await contract.claimRewards();
      const receipt = await tx.wait();
      console.log('Rewards claimed successfully:', receipt);
      return receipt;
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      if (error.message.includes('No rewards to claim')) {
        throw new Error('No rewards available to claim');
      }
      throw error;
    }
  }, [contract]);

  const getPendingRewards = useCallback(async (userAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      const rewards = await contract.pendingRewards(userAddress);
      return ethers.formatEther(rewards);
    } catch (error) {
      console.error('Error getting pending rewards:', error);
      return '0';
    }
  }, [contract]);

  return {
    claimRewards,
    getPendingRewards
  };
};
