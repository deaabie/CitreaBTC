
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

interface HowToPlayProps {
  onConnectWallet: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onConnectWallet }) => {
  return (
    <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-orange-400">How to Play</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">1</div>
            <p className="text-gray-300">Connect your MetaMask wallet to Citrea Testnet (Chain ID: 5115)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">2</div>
            <p className="text-gray-300">Choose UP or DOWN for Bitcoin price prediction</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">3</div>
            <p className="text-gray-300">Place your bet with cBTC tokens</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">4</div>
            <p className="text-gray-300">Wait 15 minutes for round to end and claim rewards</p>
          </div>
        </div>
        <Button onClick={onConnectWallet} className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet to Start
        </Button>
      </CardContent>
    </Card>
  );
};

export default HowToPlay;
