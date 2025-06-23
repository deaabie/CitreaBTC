import { useWallet } from '@/contexts/WalletContext';
import { CONTRACTS } from '@/config/contracts';
import { ethers } from 'ethers';
import { useEffect, useState, useCallback } from 'react';

export const useContract = () => {
  const { provider, account } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  // Initialize contract when provider/account changes
  useEffect(() => {
    const initContract = async () => {
      if (!provider || !account) {
        setContract(null);
        return;
      }
      
      try {
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          CONTRACTS.BITCOIN_PREDICTION.address,
          CONTRACTS.BITCOIN_PREDICTION.abi,
          signer
        );
        setContract(contractInstance);
        console.log('Contract initialized successfully');
      } catch (error) {
        console.error('Failed to initialize contract:', error);
        setContract(null);
      }
    };

    initContract();
  }, [provider, account]);

  const placeBet = useCallback(async (isUp: boolean, amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    console.log(`Placing bet: ${isUp ? 'UP' : 'DOWN'}, Amount: ${amount} PLUME`);
    const tx = await contract.placeBet(isUp, {
      value: ethers.parseEther(amount)
    });
    return tx.wait();
  }, [contract]);

  const claimRewards = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    
    console.log('Claiming rewards...');
    const tx = await contract.claimRewards();
    return tx.wait();
  }, [contract]);

  const getCurrentRound = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.getCurrentRound();
  }, [contract]);

  const getUserBets = useCallback(async (roundId: number, userAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.getUserBets(roundId, userAddress);
  }, [contract]);

  const getPendingRewards = useCallback(async (userAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    const rewards = await contract.pendingRewards(userAddress);
    return ethers.formatEther(rewards);
  }, [contract]);

  const getCurrentRoundId = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.currentRoundId();
  }, [contract]);

  const getLatestPrice = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    const price = await contract.getLatestPrice();
    // eOracle returns price with 8 decimals
    return Number(price) / 100000000;
  }, [contract]);

  const startNewRound = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    console.log('Starting new round...');
    const tx = await contract.startNewRound();
    return tx.wait();
  }, [contract]);

  return {
    contract,
    placeBet,
    claimRewards,
    getCurrentRound,
    getUserBets,
    getPendingRewards,
    getCurrentRoundId,
    getLatestPrice,
    startNewRound
  };
};
