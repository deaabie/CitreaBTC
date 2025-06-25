
import React from 'react';
import { Bitcoin } from 'lucide-react';

interface LoadingStateProps {
  isInitializing: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isInitializing }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center py-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-4 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500">
            <Bitcoin className="w-12 h-12 text-white animate-spin" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">Loading...</h1>
            <p className="text-xl text-orange-300">
              {isInitializing ? 'Initializing contract on Citrea Testnet...' : 'Fetching live data from Blocksense...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
