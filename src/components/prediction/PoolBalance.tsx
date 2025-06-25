
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContract } from '@/hooks/useContract';
import { ethers } from 'ethers';
import { CircleDollarSign } from 'lucide-react';

const PoolBalance: React.FC = () => {
  const { getPoolBalance } = useContract();
  const [poolBalance, setPoolBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPoolBalance = async () => {
      setLoading(true);
      try {
        const balance = await getPoolBalance();
        setPoolBalance(balance);
      } catch (error) {
        console.error('Error fetching pool balance:', error);
        setPoolBalance('0');
      } finally {
        setLoading(false);
      }
    };

    fetchPoolBalance();
    
    // Update pool balance every 30 seconds
    const interval = setInterval(fetchPoolBalance, 30000);
    return () => clearInterval(interval);
  }, [getPoolBalance]);

  return (
    <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <CircleDollarSign className="w-6 h-6 text-purple-400" />
          Prize Pool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div>
              <span className="text-3xl font-mono font-bold text-purple-400">
                {parseFloat(poolBalance).toFixed(4)} cBTC
              </span>
              <p className="text-gray-400 mt-2">Total Prize Pool</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PoolBalance;
