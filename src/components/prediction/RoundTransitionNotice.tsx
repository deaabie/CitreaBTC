
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface RoundTransitionNoticeProps {
  isVisible: boolean;
}

const RoundTransitionNotice: React.FC<RoundTransitionNoticeProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <Card className="bg-yellow-900/20 border-yellow-500/30 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-3 text-yellow-400">
          <Clock className="w-6 h-6 animate-pulse" />
          <p className="font-medium">Round is transitioning... Please wait</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoundTransitionNotice;
