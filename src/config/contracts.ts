
export const CONTRACTS = {
  BITCOIN_PREDICTION: {
    address: import.meta.env.VITE_PREDICTION_CONTRACT_ADDRESS || "0x...", // Update after deployment
    abi: [
      "function placeBet(bool _isUp) external payable",
      "function claimRewards() external",
      "function getCurrentRound() external view returns (tuple(uint256 startTime, uint256 endTime, uint256 startPrice, uint256 endPrice, bool isUp, bool finalized))",
      "function getUserBets(uint256 _roundId, address _user) external view returns (tuple(address user, uint256 amount, bool isUp, uint256 round)[])",
      "function pendingRewards(address) external view returns (uint256)",
      "function currentRoundId() external view returns (uint256)",
      "function startNewRound() external",
      "function getLatestPrice() external view returns (uint256)",
      "event BetPlaced(address indexed user, uint256 indexed roundId, uint256 amount, bool isUp)",
      "event RoundFinalized(uint256 indexed roundId, uint256 endTime, uint256 endPrice, bool isUp)",
      "event RewardClaimed(address indexed user, uint256 amount)",
      "event RoundStarted(uint256 roundId, uint256 startTime, uint256 startPrice)"
    ]
  }
};

export const PLUME_TESTNET = {
  chainId: 98867,
  chainName: 'Plume Testnet',
  nativeCurrency: {
    name: 'PLUME',
    symbol: 'PLUME',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.plume.org'],
  blockExplorerUrls: ['https://testnet-explorer.plume.org/'],
};

export const EORACLE_CONFIG = {
  BTC_USD_FEED: {
    address: '0x1E89dA0C147C317f762A39B12808Db1CE42133E2',
    decimals: 8,
    description: 'BTC/USD Price Feed'
  }
};
