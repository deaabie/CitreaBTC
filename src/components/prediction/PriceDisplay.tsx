
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bitcoin, ArrowUp, ArrowDown } from 'lucide-react';
import { useContract } from '@/hooks/useContract';
import { useWallet } from '@/contexts/WalletContext';

interface PriceDisplayProps {
  currentPrice: number;
  previousPrice: number;
  isDemo?: boolean;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ currentPrice, previousPrice, isDemo = false }) => {
  const { isConnected } = useWallet();
  const { getLatestPriceWithFallback } = useContract();
  const [realTimePrice, setRealTimePrice] = useState<number>(currentPrice);
  const [realTimePrevious, setRealTimePrevious] = useState<number>(previousPrice);

  useEffect(() => {
    if (!isConnected || isDemo) {
      setRealTimePrice(currentPrice);
      setRealTimePrevious(previousPrice);
      return;
    }

    const updatePrice = async () => {
      try {
        const newPrice = await getLatestPriceWithFallback();
        setRealTimePrevious(realTimePrice);
        setRealTimePrice(newPrice);
      } catch (error) {
        console.error('Error updating real-time price:', error);
      }
    };

    // Update price every 10 seconds for real-time updates
    const interval = setInterval(updatePrice, 10000);
    return () => clearInterval(interval);
  }, [isConnected, isDemo, getLatestPriceWithFallback, realTimePrice]);

  const displayPrice = isDemo ? 95000 : realTimePrice;
  const displayPrevious = isDemo ? 92683 : realTimePrevious;
  const priceDirection = displayPrice > displayPrevious ? 'up' : 'down';
  const priceChange = displayPrevious > 0 ? ((displayPrice - displayPrevious) / displayPrevious * 100).toFixed(2) : '0.00';

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
              {formatPrice(displayPrice)}
            </span>
            {((!isDemo && displayPrevious > 0) || isDemo) && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                isDemo || priceDirection === 'up' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {isDemo || priceDirection === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="font-mono">{isDemo ? '+2.5%' : `${priceChange}%`}</span>
              </div>
            )}
          </div>
          <p className="text-gray-400 mt-2">
            {isDemo 
              ? 'Connect wallet to see live Blocksense data from Citrea Testnet'
              : 'Real-time BTC/USDT price from Blocksense oracle on Citrea Testnet (updates every 10s)'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceDisplay;
