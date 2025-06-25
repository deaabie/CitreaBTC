
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bitcoin, Clock, Trophy, Users } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="text-center py-12">
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500">
          <Bitcoin className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white">Bitcoin Price Prediction</h1>
          <p className="text-xl text-orange-300">Predict Bitcoin price movements every 15 minutes on Citrea Testnet</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">15-Minute Rounds</h3>
            <p className="text-gray-300">Prediction rounds every 15 minutes using Blocksense data</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Win Rewards</h3>
            <p className="text-gray-300">Earn cBTC rewards for correct predictions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Community Pool</h3>
            <p className="text-gray-300">Join other traders in prediction pools</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HeroSection;
