
export const CONTRACTS = {
  BITCOIN_PREDICTION: {
    address: "0xA8c3c8DC0821702aBcC2d9aD992afd217D9A2Cb4", // Updated with your contract address
    abi: [
      "function placeBet(bool _isUp) external payable",
      "function claimRewards() external",
      "function getCurrentRound() external view returns (tuple(uint256 startTime, uint256 endTime, uint256 startPrice, uint256 endPrice, bool isUp, bool finalized))",
      "function getUserBets(uint256 _roundId, address _user) external view returns (tuple(address user, uint256 amount, bool isUp, uint256 round)[])",
      "function pendingRewards(address) external view returns (uint256)",
      "function currentRoundId() external view returns (uint256)",
      "function startNewRound() external",
      "function getLatestPrice() external view returns (uint256)",
      "function poolBalance() external view returns (uint256)",
      "function depositToPool() external payable",
      "function withdrawFromPool(uint256 _amount) external",
      "event BetPlaced(address indexed user, uint256 indexed roundId, uint256 amount, bool isUp)",
      "event RoundFinalized(uint256 indexed roundId, uint256 endTime, uint256 endPrice, bool isUp)",
      "event RewardClaimed(address indexed user, uint256 amount)",
      "event RoundStarted(uint256 roundId, uint256 startTime, uint256 startPrice)",
      "event PoolUpdated(uint256 newBalance, bool isDeposit)"
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

export const BLOCKSENSE_CONFIG = {
  BTC_USDT_FEED: {
    address: '0x25ef0a9b5041b2Cd96dcb1692B8C553aB2780BA3',
    decimals: 8, // Blocksense returns price in 10^8 units
    description: 'BTC/USDT Price Feed',
    roundDuration: 15 * 60, // 15 minutes in seconds
    maxPriceAge: 30 * 60 // 30 minutes in seconds
  }
};
