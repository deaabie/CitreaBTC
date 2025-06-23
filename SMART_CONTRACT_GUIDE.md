
# Smart Contract Development Guide

## Contract Architecture

### Core Components

1. **Bet Structure**
   - User address
   - Bet amount (in native cBTC)
   - Direction (UP/DOWN)
   - Round number

2. **Round Structure**
   - Start/End times
   - Start/End prices
   - Result (UP/DOWN)
   - Finalization status

3. **State Management**
   - Current round ID
   - Round mappings
   - Bet mappings per round
   - Pending rewards per user
   - Native cBTC balance tracking

### Key Functions

#### User Functions
- `placeBet(bool _isUp) external payable` - Place prediction bet with native cBTC
- `claimRewards()` - Claim accumulated native cBTC rewards

#### Owner Functions
- `submitPriceAndStartRound(uint256 _price)` - Update price and manage rounds
- `emergencyWithdraw()` - Emergency withdrawal of native cBTC

#### View Functions
- `getCurrentRound()` - Get current round details
- `getUserBets(uint256 _roundId, address _user)` - Get user's bets for a round
- `pendingRewards(address)` - Check pending native cBTC rewards

## Development Workflow

### 1. Local Development

```bash
# Initialize Hardhat project
npx hardhat init

# Install dependencies
npm install @openzeppelin/contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test
```

### 2. Testing Strategy

Create comprehensive tests covering:
- Round management
- Bet placement with native cBTC
- Reward distribution in native cBTC
- Edge cases and failures

```javascript
// Example test structure
describe("BitcoinPricePrediction", function () {
  it("Should allow users to place bets with native cBTC", async function () {
    await contract.placeBet(true, { value: ethers.parseEther("1.0") });
  });
  
  it("Should distribute native cBTC rewards correctly", async function () {
    // Test reward calculation and distribution
  });
});
```

### 3. Security Considerations

- **Reentrancy Protection**: Use OpenZeppelin's ReentrancyGuard
- **Access Controls**: Proper owner-only function restrictions
- **Integer Overflow**: Use Solidity 0.8+ built-in checks
- **Native Transfer Safety**: Check call return values for cBTC transfers
- **Time Dependencies**: Be aware of block.timestamp limitations

### 4. Gas Optimization

- Use `uint256` for loop counters
- Pack structs efficiently
- Consider batch operations for multiple bets
- Use events for data that doesn't need on-chain storage
- Optimize native cBTC transfers

### 5. Upgrade Considerations

For future upgrades, consider:
- Proxy patterns (UUPS, Transparent)
- State migration strategies
- Backward compatibility
- Native cBTC balance preservation

## Deployment Strategies

### Testnet Deployment
1. Deploy to Citrea testnet first
2. Thorough testing with real native cBTC transactions
3. Monitor gas usage and costs
4. Verify contract on explorer

### Mainnet Considerations
- Professional audit required
- Multi-sig wallet for owner functions
- Gradual rollout with limits
- Emergency pause functionality
- Insurance considerations

## Integration Points

### Frontend Integration
- Contract ABI export
- Event listening for real-time updates
- Error handling for failed transactions
- Gas estimation for user transactions
- Native cBTC balance checks

### Oracle Integration
- Price feed mechanisms
- Automated round management
- Failsafe mechanisms
- Data validation

## Native cBTC Operations

### Contract Balance Management
- Contract receives native cBTC via `msg.value`
- Rewards paid using `call{value: amount}("")`
- No token approvals or transfers needed
- Gas fees automatically deducted from user's native cBTC

### User Interactions
```solidity
// Users send native cBTC directly
function placeBet(bool _isUp) external payable {
    require(msg.value > 0, "Must send cBTC to bet");
    // Process bet with msg.value
}

// Users receive native cBTC directly
function claimRewards() external {
    uint256 reward = pendingRewards[msg.sender];
    pendingRewards[msg.sender] = 0;
    (bool success, ) = payable(msg.sender).call{value: reward}("");
    require(success, "cBTC transfer failed");
}
```

## Monitoring and Maintenance

### Key Metrics
- Active rounds per day
- Total native cBTC volume handled
- Average bet size in cBTC
- Contract cBTC balance utilization
- Gas costs per operation

### Maintenance Tasks
- Regular price updates
- Contract balance monitoring
- Contract health checks
- User activity analysis

## Emergency Procedures

### Circuit Breakers
- Pause new bets during emergencies
- Secure native cBTC withdrawal mechanisms
- Communication channels for users

### Recovery Plans
- Data backup strategies
- State recovery procedures
- User notification systems
- Native cBTC balance recovery
