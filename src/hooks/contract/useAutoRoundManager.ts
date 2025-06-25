
import { useCallback, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

interface AutoRoundManagerProps {
  contract: ethers.Contract | null;
  getCurrentRound: () => Promise<any>;
  triggerRoundTransition: () => Promise<any>;
  isConnected: boolean;
}

export const useAutoRoundManager = ({
  contract,
  getCurrentRound,
  triggerRoundTransition,
  isConnected
}: AutoRoundManagerProps) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const lastCheckRef = useRef(0);

  const checkAndTransitionRound = useCallback(async () => {
    if (!contract || !isConnected || isProcessingRef.current) return;

    const now = Date.now();
    // Prevent too frequent checks (minimum 30 seconds)
    if (now - lastCheckRef.current < 30000) return;
    
    lastCheckRef.current = now;

    try {
      const currentRound = await getCurrentRound();
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Check if round has ended and needs transition
      const needsTransition = currentTime >= currentRound.endTime && !currentRound.finalized;
      
      if (needsTransition) {
        console.log('Auto-transitioning round...', currentRound);
        isProcessingRef.current = true;
        
        // Add delay to ensure price feed is updated
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        try {
          await triggerRoundTransition();
          console.log('Round auto-transitioned successfully');
        } catch (error: any) {
          console.error('Auto-transition failed:', error);
          
          // If price feed is too old, retry after longer delay
          if (error.message.includes('Price feed too old')) {
            console.log('Price feed too old, will retry in 2 minutes...');
            setTimeout(async () => {
              try {
                await triggerRoundTransition();
                console.log('Retry successful');
              } catch (retryError) {
                console.error('Retry failed:', retryError);
              }
            }, 120000); // 2 minutes
          }
        }
        
        isProcessingRef.current = false;
      }
    } catch (error) {
      console.error('Error checking round status:', error);
      isProcessingRef.current = false;
    }
  }, [contract, isConnected, getCurrentRound, triggerRoundTransition]);

  // Start auto round manager
  useEffect(() => {
    if (!isConnected || !contract) return;

    console.log('Starting auto round manager...');
    
    // Initial check after 10 seconds
    const initialTimeout = setTimeout(() => {
      checkAndTransitionRound();
    }, 10000);

    // Regular checks every 60 seconds
    intervalRef.current = setInterval(() => {
      checkAndTransitionRound();
    }, 60000);

    return () => {
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isConnected, contract, checkAndTransitionRound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    forceCheck: checkAndTransitionRound
  };
};
