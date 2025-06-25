
import { useCallback } from 'react';
import { ethers } from 'ethers';

export const useRewardOperations = (contract: ethers.Contract | null) => {
  const claimRewards = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    console.log('Claiming rewards...');
    try {
      // First check if user has pending rewards
      const signer = await contract.runner;
      const userAddress = await signer.getAddress();
      const pendingAmount = await contract.pendingRewards(userAddress);
      
      console.log('Pending rewards check:', {
        userAddress,
        pendingAmount: ethers.formatEther(pendingAmount),
        hasRewards: Number(pendingAmount) > 0
      });
      
      if (Number(pendingAmount) === 0) {
        throw new Error('No rewards available to claim');
      }
      
      // Check contract balance
      const contractBalance = await contract.runner.provider.getBalance(await contract.getAddress());
      console.log('Contract balance:', ethers.formatEther(contractBalance), 'cBTC');
      
      if (Number(contractBalance) < Number(pendingAmount)) {
        throw new Error('Insufficient contract balance for reward payout');
      }
      
      const tx = await contract.claimRewards({
        gasLimit: 300000
      });
      console.log('Claim transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('Rewards claimed successfully:', {
        gasUsed: receipt.gasUsed.toString(),
        amount: ethers.formatEther(pendingAmount)
      });
      
      return receipt;
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      
      if (error.message.includes('No rewards to claim')) {
        throw new Error('No rewards available to claim');
      }
      
      if (error.message.includes('Insufficient contract balance')) {
        throw new Error('Contract has insufficient balance for payout. Please contact support.');
      }
      
      throw new Error(`Claim failed: ${error.message}`);
    }
  }, [contract]);

  const getPendingRewards = useCallback(async (userAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      const rewards = await contract.pendingRewards(userAddress);
      const formattedRewards = ethers.formatEther(rewards);
      
      console.log('Pending rewards for', userAddress, ':', formattedRewards, 'cBTC');
      return formattedRewards;
    } catch (error) {
      console.error('Error getting pending rewards:', error);
      return '0';
    }
  }, [contract]);

  const checkRewardDistribution = useCallback(async (roundId: number) => {
    if (!contract) throw new Error('Contract not initialized');
    
    try {
      // Check if round is finalized
      const round = await contract.rounds(roundId);
      console.log(`Round ${roundId} status:`, {
        finalized: round.finalized,
        endPrice: Number(round.endPrice),
        startPrice: Number(round.startPrice),
        isUp: round.isUp
      });
      
      if (!round.finalized) {
        return { distributed: false, reason: 'Round not finalized' };
      }
      
      return { distributed: true, round };
    } catch (error) {
      console.error('Error checking reward distribution:', error);
      return { distributed: false, reason: 'Error checking round' };
    }
  }, [contract]);

  return {
    claimRewards,
    getPendingRewards,
    checkRewardDistribution
  };
};
