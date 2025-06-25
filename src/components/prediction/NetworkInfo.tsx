
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BLOCKSENSE_CONFIG } from '@/config/contracts';

const NetworkInfo = () => {
  return (
    <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-orange-400">Citrea Testnet & Blocksense Integration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-gray-400">Chain ID:</p>
            <p className="text-white font-mono">5115</p>
            
            <p className="text-gray-400">RPC URL:</p>
            <p className="text-white font-mono text-sm">https://rpc.testnet.citrea.xyz</p>
            
            <p className="text-gray-400">Round Duration:</p>
            <p className="text-white font-mono">15 minutes</p>
          </div>
          <div className="space-y-2">
            <p className="text-gray-400">Price Feed:</p>
            <p className="text-white font-mono text-sm">Blocksense BTC/USDT</p>
            
            <p className="text-gray-400">Feed Address:</p>
            <p className="text-white font-mono text-sm">{BLOCKSENSE_CONFIG.BTC_USDT_FEED.address}</p>
            
            <p className="text-gray-400">Explorer:</p>
            <p className="text-white font-mono text-sm">https://explorer.testnet.citrea.xyz/</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkInfo;
