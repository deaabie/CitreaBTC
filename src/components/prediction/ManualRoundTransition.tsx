
import React from 'react';

interface ManualRoundTransitionProps {
  isVisible: boolean;
  roundId: number;
  onTransition: () => void;
}

const ManualRoundTransition: React.FC<ManualRoundTransitionProps> = ({ 
  isVisible, 
  roundId, 
  onTransition 
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-orange-300 font-medium">Round #{roundId} has ended</p>
          <p className="text-orange-200 text-sm">Click to start the next round manually</p>
        </div>
        <button
          onClick={onTransition}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded font-medium"
        >
          Start Next Round
        </button>
      </div>
    </div>
  );
};

export default ManualRoundTransition;
