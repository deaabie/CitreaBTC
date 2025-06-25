
import { useCallback } from 'react';
import { ethers } from 'ethers';

export const usePoolOperations = (contract: ethers.Contract | null) => {
  const getPoolBalance = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    const balance = await contract.poolBalance();
    return ethers.formatEther(balance);
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
    getPoolBalance,
    depositToPool,
    withdrawFromPool
  };
};
