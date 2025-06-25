
import React from 'react';

interface AutoModeToggleProps {
  isAutoMode: boolean;
  onToggle: () => void;
}

const AutoModeToggle: React.FC<AutoModeToggleProps> = ({ isAutoMode, onToggle }) => {
  return (
    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-blue-300 font-medium">Auto Round Management</h3>
          <p className="text-blue-200 text-sm">
            {isAutoMode ? 'Rounds will transition automatically' : 'Manual round transition required'}
          </p>
        </div>
        <button
          onClick={onToggle}
          className={`px-4 py-2 rounded font-medium ${
            isAutoMode 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gray-600 hover:bg-gray-700 text-white'
          }`}
        >
          {isAutoMode ? 'AUTO ON' : 'AUTO OFF'}
        </button>
      </div>
    </div>
  );
};

export default AutoModeToggle;
