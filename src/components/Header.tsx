
import React from 'react';
import { Bitcoin, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';

const Header = () => {
  const { account, isConnected, connecting, balance, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="bg-black/20 backdrop-blur-sm border-b border-orange-500/20">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500">
            <Bitcoin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Bitcoin Oracle</h1>
            <p className="text-sm text-orange-300">Plume Testnet Predictions</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="text-right">
              <p className="text-sm text-orange-300">Balance</p>
              <p className="text-white font-mono">{parseFloat(balance).toFixed(4)} PLUME</p>
            </div>
          )}
          
          <Button
            onClick={isConnected ? disconnectWallet : connectWallet}
            disabled={connecting}
            className={`flex items-center gap-2 ${
              isConnected 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600'
            }`}
          >
            <Wallet className="w-4 h-4" />
            {connecting ? 'Connecting...' : isConnected ? formatAddress(account!) : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
