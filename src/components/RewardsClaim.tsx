
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const RewardsClaim = () => {
  const [pendingRewards, setPendingRewards] = useState(0.25);
  const [claiming, setClaiming] = useState(false);
  const { toast } = useToast();

  const handleClaimRewards = async () => {
    if (pendingRewards <= 0) return;

    setClaiming(true);
    
    // Simulate claiming rewards (replace with actual contract interaction)
    setTimeout(() => {
      toast({
        title: "Rewards Claimed!",
        description: `${pendingRewards} cBTC claimed successfully`,
      });
      setPendingRewards(0);
      setClaiming(false);
    }, 2000);
  };

  return (
    <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-orange-400">Your Rewards</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-gray-400 text-sm">Pending Rewards</p>
          <p className="text-3xl font-mono font-bold text-green-400">
            {pendingRewards.toFixed(4)} cBTC
          </p>
        </div>

        <Button
          onClick={handleClaimRewards}
          disabled={claiming || pendingRewards <= 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
        >
          {claiming ? 'Claiming...' : 'Claim Rewards'}
        </Button>

        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <p className="text-gray-400">Total Won</p>
            <p className="text-green-400 font-mono">1.25 cBTC</p>
          </div>
          <div>
            <p className="text-gray-400">Total Bet</p>
            <p className="text-white font-mono">2.10 cBTC</p>
          </div>
          <div>
            <p className="text-gray-400">Win Rate</p>
            <p className="text-orange-400 font-mono">62%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RewardsClaim;
