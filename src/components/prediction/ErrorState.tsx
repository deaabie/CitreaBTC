
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const isPriceFeedError = error.includes('Price feed too old') || error.includes('Price feed');
  const isRoundError = error.includes('Round') || error.includes('round');
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="bg-red-900/20 border-red-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 text-red-400">
            <AlertCircle className="w-8 h-8 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">
                {isPriceFeedError ? 'Price Feed Error' : 
                 isRoundError ? 'Round Management Error' : 
                 'Connection Error'}
              </h3>
              <p className="text-red-300 mb-4 break-words">{error}</p>
              
              {isPriceFeedError && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                  <p className="text-yellow-300 text-sm">
                    <strong>Price Feed Issue:</strong> Blocksense price feed may be temporarily unavailable or outdated.
                    This can happen if the oracle hasn't updated recently.
                  </p>
                </div>
              )}
              
              <div className="space-y-2 text-sm text-gray-400">
                <p><strong>Network:</strong> Citrea Testnet (Chain ID: 5115)</p>
                <p><strong>Contract:</strong> 0xA8c3c8DC0821702aBcC2d9aD992afd217D9A2Cb4</p>
                <p><strong>Price Feed:</strong> 0x25ef0a9b5041b2Cd96dcb1692B8C553aB2780BA3</p>
                
                {isPriceFeedError && (
                  <div className="mt-3 text-yellow-400">
                    <p><strong>Troubleshooting:</strong></p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Wait a few minutes for Blocksense to update</li>
                      <li>Check if you're connected to Citrea Testnet</li>
                      <li>Try refreshing the page</li>
                    </ul>
                  </div>
                )}
              </div>
              
              {onRetry && (
                <Button
                  onClick={onRetry}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry Connection
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;
