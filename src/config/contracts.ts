
export const CONTRACTS = {
  BITCOIN_PREDICTION: {
    address: process.env.REACT_APP_PREDICTION_CONTRACT_ADDRESS || "0x...", // Update after deployment
    abi: [
      "function placeBet(uint256 _amount, bool _isUp) external",
      "function claimRewards() external",
      "function getCurrentRound() external view returns (tuple(uint256 startTime, uint256 endTime, uint256 startPrice, uint256 endPrice, bool isUp, bool finalized))",
      "function getUserBets(uint256 _roundId, address _user) external view returns (tuple(address user, uint256 amount, bool isUp, uint256 round)[])",
      "function pendingRewards(address) external view returns (uint256)",
      "function currentRoundId() external view returns (uint256)",
      "event BetPlaced(address indexed user, uint256 indexed roundId, uint256 amount, bool isUp)",
      "event RoundFinalized(uint256 indexed roundId, uint256 endTime, uint256 endPrice, bool isUp)",
      "event RewardClaimed(address indexed user, uint256 amount)"
    ]
  },
  CBTC_TOKEN: {
    address: process.env.REACT_APP_CBTC_TOKEN_ADDRESS || "0x...", // Update after deployment
    abi: [
      "function balanceOf(address owner) view returns (uint256)",
      "function transfer(address to, uint256 amount) returns (bool)",
      "function approve(address spender, uint256 amount) returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)"
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
