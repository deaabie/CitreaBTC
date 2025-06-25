
import { useCallback } from 'react';
import { ethers } from 'ethers';

export const usePriceOperations = (contract: ethers.Contract | null) => {
  const getLatestPrice = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      const price = await contract.getLatestPrice();
      return Number(price) / 100000000;
    } catch (error) {
      console.error('Error getting latest price from Blocksense:', error);
      throw error;
    }
  }, [contract]);

  return {
    getLatestPrice
  };
};
