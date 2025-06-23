
import { useWallet } from '@/contexts/WalletContext';
import { CONTRACTS } from '@/config/contracts';
import { ethers } from 'ethers';
import { useMemo } from 'react';

export const useContract = () => {
  const { provider, account } = useWallet();

  const contract = useMemo(() => {
    if (!provider || !account) return null;
    
    const signer = provider.getSigner();
    return new ethers.Contract(
      CONTRACTS.BITCOIN_PREDICTION.address,
      CONTRACTS.BITCOIN_PREDICTION.abi,
      signer
    );
  }, [provider, account]);

  const placeBet = async (isUp: boolean, amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.placeBet(isUp, {
      value: ethers.parseEther(amount) // Send native cBTC as msg.value
    });
    return tx.wait();
  };

  const claimRewards = async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    const tx = await contract.claimRewards();
    return tx.wait();
  };

  const getCurrentRound = async () => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.getCurrentRound();
  };

  const getUserBets = async (roundId: number, userAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.getUserBets(roundId, userAddress);
  };

  const getPendingRewards = async (userAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const rewards = await contract.pendingRewards(userAddress);
    return ethers.formatEther(rewards);
  };

  const getCurrentRoundId = async () => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.currentRoundId();
  };

  return {
    contract,
    placeBet,
    claimRewards,
    getCurrentRound,
    getUserBets,
    getPendingRewards,
    getCurrentRoundId
  };
};
