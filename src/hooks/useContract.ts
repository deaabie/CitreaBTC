
import { useWallet } from '@/contexts/WalletContext';
import { useContractInit } from './contract/useContractInit';
import { useRoundOperations } from './contract/useRoundOperations';
import { useBettingOperations } from './contract/useBettingOperations';
import { useRewardOperations } from './contract/useRewardOperations';
import { usePriceOperations } from './contract/usePriceOperations';
import { usePoolOperations } from './contract/usePoolOperations';

export const useContract = () => {
  const { account } = useWallet();
  const { contract, isInitializing } = useContractInit();
  
  const roundOps = useRoundOperations(contract);
  const rewardOps = useRewardOperations(contract);
  const priceOps = usePriceOperations(contract);
  const poolOps = usePoolOperations(contract);
  const bettingOps = useBettingOperations(contract, account, roundOps.getCurrentRound);

  return {
    contract,
    isInitializing,
    ...roundOps,
    ...bettingOps,
    ...rewardOps,
    ...priceOps,
    ...poolOps
  };
};
