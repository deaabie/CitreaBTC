
import { useWallet } from '@/contexts/WalletContext';
import { CONTRACTS, BLOCKSENSE_CONFIG } from '@/config/contracts';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

export const useContractInit = () => {
  const { provider, account } = useWallet();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

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

  return { contract, isInitializing };
};
