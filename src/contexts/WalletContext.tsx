
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  connecting: boolean;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToTestnet: () => Promise<void>;
  provider: ethers.BrowserProvider | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const CITREA_TESTNET = {
  chainId: '0x13FB', // 5115 in hex
  chainName: 'Citrea Testnet',
  nativeCurrency: {
    name: 'cBTC',
    symbol: 'cBTC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.citrea.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.citrea.xyz/'],
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState('0.0');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connectWallet = async () => {
    try {
      setConnecting(true);
      const ethereum = await detectEthereumProvider();
      
      if (!ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await (ethereum as any).request({ method: 'eth_requestAccounts' });
      const ethersProvider = new ethers.BrowserProvider(ethereum as any);
      
      setProvider(ethersProvider);
      setAccount(accounts[0]);
      setIsConnected(true);
      
      // Get balance
      const balance = await ethersProvider.getBalance(accounts[0]);
      setBalance(ethers.formatEther(balance));
      
      // Switch to Citrea testnet
      await switchToTestnet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setConnecting(false);
    }
  };

  const switchToTestnet = async () => {
    try {
      const ethereum = (window as any).ethereum;
      if (!ethereum) return;

      try {
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CITREA_TESTNET.chainId }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CITREA_TESTNET],
          });
        }
      }
    } catch (error) {
      console.error('Error switching to testnet:', error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setBalance('0.0');
    setProvider(null);
  };

  useEffect(() => {
    const checkConnection = async () => {
      const ethereum = await detectEthereumProvider();
      if (ethereum) {
        const accounts = await (ethereum as any).request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const ethersProvider = new ethers.BrowserProvider(ethereum as any);
          setProvider(ethersProvider);
          setAccount(accounts[0]);
          setIsConnected(true);
          
          const balance = await ethersProvider.getBalance(accounts[0]);
          setBalance(ethers.formatEther(balance));
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <WalletContext.Provider value={{
      account,
      isConnected,
      connecting,
      balance,
      connectWallet,
      disconnectWallet,
      switchToTestnet,
      provider
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
