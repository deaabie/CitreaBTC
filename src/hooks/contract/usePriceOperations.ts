
import { useCallback } from 'react';
import { ethers } from 'ethers';

export const usePriceOperations = (contract: ethers.Contract | null) => {
  const getLatestPrice = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      const price = await contract.getLatestPrice();
      return Number(price) / 100000000;
    } catch (error: any) {
      console.error('Error getting latest price from Blocksense:', error);
      
      // If price feed is too old, try to get the raw price data for debugging
      if (error.message.includes('Price feed too old')) {
        try {
          // Get the raw price feed data to check the actual age
          const provider = contract.runner?.provider;
          if (!provider) throw new Error('No provider available');
          
          const priceFeedAddress = '0x25ef0a9b5041b2Cd96dcb1692B8C553aB2780BA3';
          const priceFeedAbi = [
            "function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)"
          ];
          const priceFeedContract = new ethers.Contract(priceFeedAddress, priceFeedAbi, provider);
          const [, answer, , updatedAt] = await priceFeedContract.latestRoundData();
          
          const now = Math.floor(Date.now() / 1000);
          const age = now - Number(updatedAt);
          const maxAge = 30 * 60; // 30 minutes
          
          console.log('Price feed debug:', {
            currentTime: new Date(now * 1000).toISOString(),
            lastUpdate: new Date(Number(updatedAt) * 1000).toISOString(),
            ageInSeconds: age,
            ageInMinutes: Math.floor(age / 60),
            maxAgeInMinutes: maxAge / 60,
            isTooOld: age > maxAge,
            rawPrice: Number(answer)
          });
          
          // Return the price even if it's old, but with a warning
          if (age > maxAge) {
            throw new Error(`Price feed is ${Math.floor(age / 60)} minutes old (max: ${maxAge / 60} minutes). Last update: ${new Date(Number(updatedAt) * 1000).toLocaleString()}`);
          }
          
          return Number(answer) / 100000000;
        } catch (debugError) {
          console.error('Price feed debug error:', debugError);
          throw new Error('Price feed validation failed. Please check if Blocksense feed is active.');
        }
      }
      throw error;
    }
  }, [contract]);

  const getLatestPriceWithFallback = useCallback(async () => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      return await getLatestPrice();
    } catch (error: any) {
      console.warn('Primary price feed failed, using fallback:', error.message);
      
      // Fallback: try to get a reasonable BTC price for demo purposes
      // In production, you might want to use multiple price feeds
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        const fallbackPrice = data.bitcoin?.usd || 65000;
        console.log('Using fallback price from CoinGecko:', fallbackPrice);
        return fallbackPrice;
      } catch (fallbackError) {
        console.error('Fallback price fetch failed:', fallbackError);
        // Last resort: return a reasonable default
        return 65000;
      }
    }
  }, [contract, getLatestPrice]);

  return {
    getLatestPrice,
    getLatestPriceWithFallback
  };
};
