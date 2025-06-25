
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContract } from '@/hooks/useContract';
import { useWallet } from '@/contexts/WalletContext';

interface BetFormProps {
  roundId: number;
}

const BetForm: React.FC<BetFormProps> = ({ roundId }) => {
  const [betAmount, setBetAmount] = useState('0.1');
  const [selectedPrediction, setSelectedPrediction] = useState<'up' | 'down' | null>(null);
  const [placing, setPlacing] = useState(false);
  const { toast } = useToast();
  const { placeBet } = useContract();
  const { account, isConnected } = useWallet();

  const handlePlaceBet = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!selectedPrediction) {
      toast({
        title: "Select Prediction",
        description: "Please select UP or DOWN prediction",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(betAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Bet amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    setPlacing(true);
    
    try {
      console.log(`Placing bet: ${selectedPrediction.toUpperCase()}, Amount: ${betAmount} cBTC`);
      const isUp = selectedPrediction === 'up';
      await placeBet(isUp, betAmount);
      
      toast({
        title: "Bet Placed Successfully!",
        description: `${betAmount} cBTC bet on ${selectedPrediction.toUpperCase()} for round ${roundId}`,
      });
      
      setSelectedPrediction(null);
      setBetAmount('0.1');
    } catch (error: any) {
      console.error('Error placing bet:', error);
      toast({
        title: "Bet Failed",
        description: error.message || "Failed to place bet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-orange-400">Place Your Bet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Bet Amount (cBTC)</label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white"
            placeholder="0.1"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400 block">Prediction</label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={selectedPrediction === 'up' ? 'default' : 'outline'}
              onClick={() => setSelectedPrediction('up')}
              className={`h-16 ${
                selectedPrediction === 'up'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'border-green-500 text-green-400 hover:bg-green-500/20'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <ArrowUp className="w-6 h-6" />
                <span className="font-bold">UP</span>
              </div>
            </Button>
            
            <Button
              variant={selectedPrediction === 'down' ? 'default' : 'outline'}
              onClick={() => setSelectedPrediction('down')}
              className={`h-16 ${
                selectedPrediction === 'down'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-red-500 text-red-400 hover:bg-red-500/20'
              }`}
            >
              <div className="flex flex-col items-center gap-1">
                <ArrowDown className="w-6 h-6" />
                <span className="font-bold">DOWN</span>
              </div>
            </Button>
          </div>
        </div>

        <Button
          onClick={handlePlaceBet}
          disabled={placing || !selectedPrediction || !isConnected}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-3"
        >
          {placing ? 'Placing Bet...' : !isConnected ? 'Connect Wallet' : 'Place Bet'}
        </Button>

        <div className="text-xs text-gray-400 text-center">
          Potential payout: 1:1 ratio
        </div>
      </CardContent>
    </Card>
  );
};

export default BetForm;
