
# Smart Contract Development Guide

## Contract Architecture

### Core Components

1. **Bet Structure**
   - User address
   - Bet amount (in cBTC)
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
   - Pool balance

### Key Functions

#### User Functions
- `placeBet(uint256 _amount, bool _isUp)` - Place prediction bet
- `claimRewards()` - Claim accumulated rewards

#### Owner Functions
- `submitPriceAndStartRound(uint256 _price)` - Update price and manage rounds
- `depositToPool(uint256 _amount)` - Add funds to reward pool
- `withdrawFromPool(uint256 _amount)` - Remove funds from pool

#### View Functions
- `getCurrentRound()` - Get current round details
- `getUserBets(uint256 _roundId, address _user)` - Get user's bets for a round

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
- Bet placement
- Reward distribution
- Edge cases and failures

```javascript
// Example test structure
describe("BitcoinPricePrediction", function () {
  it("Should allow users to place bets", async function () {
    // Test bet placement logic
  });
  
  it("Should distribute rewards correctly", async function () {
    // Test reward calculation and distribution
  });
});
```

### 3. Security Considerations

- **Reentrancy Protection**: Use OpenZeppelin's ReentrancyGuard
- **Access Controls**: Proper owner-only function restrictions
- **Integer Overflow**: Use Solidity 0.8+ built-in checks
- **Token Transfer Safety**: Check return values
- **Time Dependencies**: Be aware of block.timestamp limitations

### 4. Gas Optimization

- Use `uint256` for loop counters
- Pack structs efficiently
- Consider batch operations for multiple bets
- Use events for data that doesn't need on-chain storage

### 5. Upgrade Considerations

For future upgrades, consider:
- Proxy patterns (UUPS, Transparent)
- State migration strategies
- Backward compatibility

## Deployment Strategies

### Testnet Deployment
1. Deploy to Citrea testnet first
2. Thorough testing with real transactions
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

### Oracle Integration
- Price feed mechanisms
- Automated round management
- Failsafe mechanisms
- Data validation

## Monitoring and Maintenance

### Key Metrics
- Active rounds per day
- Total volume handled
- Average bet size
- Pool utilization ratio
- Gas costs per operation

### Maintenance Tasks
- Regular price updates
- Pool balance monitoring
- Contract health checks
- User activity analysis

## Emergency Procedures

### Circuit Breakers
- Pause new bets during emergencies
- Secure fund withdrawal mechanisms
- Communication channels for users

### Recovery Plans
- Data backup strategies
- State recovery procedures
- User notification systems
