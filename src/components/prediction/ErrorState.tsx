
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <Card className="bg-red-900/20 border-red-500/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">Connection Error</h3>
              <p className="text-red-300">{error}</p>
              <p className="text-sm text-gray-400 mt-2">
                Make sure you're connected to Citrea Testnet (Chain ID: 5115)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorState;
