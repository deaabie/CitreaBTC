
import { useWallet } from '@/contexts/WalletContext';
import { CONTRACTS, BLOCKSENSE_CONFIG } from '@/config/contracts';
import { ethers } from 'ethers';
import { useEffect, useState, useCallback } from 'react';

export const useContract = () => {
  const { provider, account } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize contract when provider/account changes
  useEffect(() => {
    const initContract = async () => {
      if (!provider || !account) {
        setContract(null);
        return;
      }
      
      setIsInitializing(true);
      try {
        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          CONTRACTS.BITCOIN_PREDICTION.address,
          CONTRACTS.BITCOIN_PREDICTION.abi,
          signer
        );
        setContract(contractInstance);
        console.log('Contract initialized successfully on Citrea Testnet');
        console.log('Contract address:', CONTRACTS.BITCOIN_PREDICTION.address);
        console.log('Using Blocksense BTC/USDT feed:', BLOCKSENSE_CONFIG.BTC_USDT_FEED.address);
      } catch (error) {
        console.error('Failed to initialize contract:', error);
        setContract(null);
      } finally {
        setIsInitializing(false);
      }
    };

    initContract();
  }, [provider, account]);

  const placeBet = useCallback(async (isUp: boolean, amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    
    console.log(`Placing bet: ${isUp ? 'UP' : 'DOWN'}, Amount: ${amount} cBTC`);
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
    try {
      return await contract.getCurrentRound();
    } catch (error) {
      console.error('Error getting current round:', error);
      throw error;
    }
  }, [contract]);

  const getUserBets = useCallback(async (roundId: number, userAddress: string) => {
    if (!contract) throw new Error('Contract not initialized');
    return contract.getUserBets(roundId, userAddress);
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

  const getCurrentRoundId = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      return await contract.currentRoundId();
    } catch (error) {
      console.error('Error getting current round ID:', error);
      throw error;
    }
  }, [contract]);

  const getLatestPrice = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      const price = await contract.getLatestPrice();
      // Blocksense returns price with 8 decimals (10^8 units)
      return Number(price) / 100000000;
    } catch (error) {
      console.error('Error getting latest price from Blocksense:', error);
      throw error;
    }
  }, [contract]);

  const getPoolBalance = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    const balance = await contract.poolBalance();
    return ethers.formatEther(balance);
  }, [contract]);

  const startNewRound = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    console.log('Starting new round...');
    const tx = await contract.startNewRound();
    return tx.wait();
  }, [contract]);

  const depositToPool = useCallback(async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    console.log(`Depositing ${amount} cBTC to pool...`);
    const tx = await contract.depositToPool({
      value: ethers.parseEther(amount)
    });
    return tx.wait();
  }, [contract]);

  const withdrawFromPool = useCallback(async (amount: string) => {
    if (!contract) throw new Error('Contract not initialized');
    console.log(`Withdrawing ${amount} cBTC from pool...`);
    const tx = await contract.withdrawFromPool(ethers.parseEther(amount));
    return tx.wait();
  }, [contract]);

  return {
    contract,
    isInitializing,
    placeBet,
    claimRewards,
    getCurrentRound,
    getUserBets,
    getPendingRewards,
    getCurrentRoundId,
    getLatestPrice,
    getPoolBalance,
    startNewRound,
    depositToPool,
    withdrawFromPool
  };
};
