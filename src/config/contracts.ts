
export const CONTRACTS = {
  BITCOIN_PREDICTION: {
    address: process.env.REACT_APP_PREDICTION_CONTRACT_ADDRESS || "0x...", // Update after deployment
    abi: [
      "function placeBet(bool _isUp) external payable",
      "function claimRewards() external",
      "function getCurrentRound() external view returns (tuple(uint256 startTime, uint256 endTime, uint256 startPrice, uint256 endPrice, bool isUp, bool finalized))",
      "function getUserBets(uint256 _roundId, address _user) external view returns (tuple(address user, uint256 amount, bool isUp, uint256 round)[])",
      "function pendingRewards(address) external view returns (uint256)",
      "function currentRoundId() external view returns (uint256)",
      "function submitPriceAndStartRound(uint256 _price) external",
      "event BetPlaced(address indexed user, uint256 indexed roundId, uint256 amount, bool isUp)",
      "event RoundFinalized(uint256 indexed roundId, uint256 endTime, uint256 endPrice, bool isUp)",
      "event RewardClaimed(address indexed user, uint256 amount)",
      "event RoundStarted(uint256 roundId, uint256 startTime, uint256 startPrice)"
    ]
  }
};

export const CITREA_TESTNET = {
  chainId: 5115,
  chainName: 'Citrea Testnet',
  nativeCurrency: {
    name: 'cBTC',
    symbol: 'cBTC',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.citrea.xyz'],
  blockExplorerUrls: ['https://explorer.testnet.citrea.xyz/'],
};
