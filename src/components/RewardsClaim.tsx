
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';

const RewardsClaim = () => {
  const [pendingRewards, setPendingRewards] = useState('0');
  const [claiming, setClaiming] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { account, isConnected } = useWallet();
  const { getPendingRewards, claimRewards } = useContract();

  useEffect(() => {
    const fetchRewards = async () => {
      if (!isConnected || !account) {
        setLoading(false);
        return;
      }

      try {
        const rewards = await getPendingRewards(account);
        setPendingRewards(rewards);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching pending rewards:', error);
        setLoading(false);
      }
    };

    fetchRewards();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRewards, 30000);
    return () => clearInterval(interval);
  }, [isConnected, account, getPendingRewards]);

  const handleClaimRewards = async () => {
    if (parseFloat(pendingRewards) <= 0) return;

    setClaiming(true);
    
    try {
      await claimRewards();
      toast({
        title: "Rewards Claimed!",
        description: `${pendingRewards} cBTC claimed successfully`,
      });
      setPendingRewards('0');
    } catch (error: any) {
      console.error('Error claiming rewards:', error);
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim rewards",
        variant: "destructive"
      });
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-orange-400">Your Rewards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-400">Loading rewards...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-orange-400">Your Rewards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Pending Rewards</p>
          <p className="text-3xl font-mono font-bold text-green-400">
            {parseFloat(pendingRewards).toFixed(4)} cBTC
          </p>
        </div>

        <Button
          onClick={handleClaimRewards}
          disabled={claiming || parseFloat(pendingRewards) <= 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
        >
          {claiming ? 'Claiming...' : 'Claim Rewards'}
        </Button>

        <div className="text-center text-sm text-gray-400">
          <p>Contract: 0xA8c3c8DC0821702aBcC2d9aD992afd217D9A2Cb4</p>
          <p>Network: Citrea Testnet (Chain ID: 5115)</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsClaim;
