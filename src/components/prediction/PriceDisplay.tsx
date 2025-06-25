
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bitcoin, ArrowUp, ArrowDown } from 'lucide-react';

interface PriceDisplayProps {
  currentPrice: number;
  previousPrice: number;
  isDemo?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ currentPrice, previousPrice, isDemo = false }) => {
  const priceDirection = currentPrice > previousPrice ? 'up' : 'down';
  const priceChange = previousPrice > 0 ? ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2) : '0.00';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bitcoin className="w-8 h-8 text-orange-400" />
            <h2 className="text-3xl font-bold text-white">
              Bitcoin Price {isDemo ? '(Demo)' : '(Live from Blocksense)'}
            </h2>
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-4xl font-mono font-bold text-white">
              {isDemo ? '$95,000.00' : formatPrice(currentPrice)}
            </span>
            {(!isDemo && previousPrice > 0) || isDemo ? (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                isDemo || priceDirection === 'up' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {isDemo || priceDirection === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="font-mono">{isDemo ? '+2.5%' : `${priceChange}%`}</span>
              </div>
            ) : null}
          </div>
          <p className="text-gray-400 mt-2">
            {isDemo 
              ? 'Connect wallet to see live Blocksense data from Citrea Testnet'
              : 'Real-time BTC/USDT price from Blocksense oracle on Citrea Testnet'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceDisplay;
