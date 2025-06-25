
# Bitcoin Price Prediction - Comprehensive Testing Guide

## 🎯 Contract Testing on Citrea Testnet

**Contract Address:** `0xA8c3c8DC0821702aBcC2d9aD992afd217D9A2Cb4`
**Network:** Citrea Testnet (Chain ID: 5115)
**Price Feed:** Blocksense BTC/USDT (0x25ef0a9b5041b2Cd96dcb1692B8C553aB2780BA3)

## 🚀 Quick Start Testing

### 1. Environment Setup

```bash
# Clone and install
npm install

# Setup environment
cp .env.example .env
# Add your private key to .env file
```

### 2. Test Contract Functions

```bash
# Test all contract functions
npm run test-contract

# Debug contract state
npm run debug-contract 0xA8c3c8DC0821702aBcC2d9aD992afd217D9A2Cb4

# Start round manager (if needed)
npm run round-manager 0xA8c3c8DC0821702aBcC2d9aD992afd217D9A2Cb4
```

### 3. Launch Frontend

```bash
# Start development server
npm run dev
```

## 🔧 Detailed Testing Procedures

### Smart Contract Testing

The contract is already deployed and ready for testing. Run the test script to verify all functions:

```javascript
// Test script checks:
// ✅ Blocksense price feed connection
// ✅ Current round information
// ✅ Contract balance and pool
// ✅ User rewards system
// ✅ Bet history functionality
```

### Frontend Integration Testing

#### 1. Wallet Connection
- Open the app in browser
- Connect MetaMask to Citrea Testnet
- Verify cBTC balance display
- Check network switching functionality

#### 2. Real-time Price Display
- Verify live BTC/USDT price from Blocksense
- Check price updates every 30 seconds
- Confirm price direction indicators (UP/DOWN)

#### 3. Betting System
- Test placing UP bets with different amounts
- Test placing DOWN bets with different amounts
- Verify bet confirmation and transaction hashes
- Check bet history display

#### 4. Round Management
- Monitor round timer countdown
- Verify round transitions (15-minute intervals)
- Check round finalization process
- Test automatic new round creation

#### 5. Rewards System
- Check pending rewards display
- Test reward claiming functionality
- Verify reward distribution accuracy
- Monitor reward history

## 📊 Testing Scenarios

### Scenario 1: Basic Bet Placement
1. Connect wallet to Citrea Testnet
2. Wait for active round (not finalized)
3. Place a small bet (0.01 cBTC) predicting UP
4. Verify transaction confirmation
5. Check bet appears in round history

### Scenario 2: Round Completion
1. Place bet in active round
2. Wait for round to end (15 minutes)
3. Monitor round finalization
4. Check if new round starts automatically
5. Verify rewards distribution

### Scenario 3: Reward Claiming
1. Win a bet in previous round
2. Check pending rewards > 0
3. Click "Claim Rewards" button
4. Verify reward transfer to wallet
5. Confirm pending rewards reset to 0

### Scenario 4: Multiple Bets
1. Place multiple bets in same round
2. Mix UP and DOWN predictions
3. Verify all bets recorded correctly
4. Check total bet amount tracking

## 🐛 Common Issues & Solutions

### MetaMask Issues
```javascript
// Add Citrea Testnet manually:
Network Name: Citrea Testnet
RPC URL: https://rpc.testnet.citrea.xyz
Chain ID: 5115
Currency Symbol: cBTC
Block Explorer: https://explorer.testnet.citrea.xyz/
```

### Contract Interaction Errors
```bash
# Check if contract is deployed
npm run debug-contract 0xA8c3c8DC0821702aBcC2d9aD992afd217D9A2Cb4

# Verify network connection
curl -X POST https://rpc.testnet.citrea.xyz \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### Price Feed Issues
```javascript
// Check Blocksense feed directly
const price = await contract.getLatestPrice();
console.log('Current price:', Number(price) / 100000000);
```

## 📈 Performance Monitoring

### Key Metrics to Track
- Price feed update frequency
- Round transition timing (15 minutes)
- Transaction gas costs
- Reward distribution accuracy
- Frontend loading times

### Monitoring Commands
```bash
# Monitor round status
watch -n 30 "npm run debug-contract 0xA8c3c8DC0821702aBcC2d9aD992afd217D9A2Cb4"

# Check contract events
npx hardhat run scripts/monitor-events.js --network citrea_testnet
```

## 🔍 Verification Checklist

### Smart Contract ✅
- [ ] Contract deployed at correct address
- [ ] Blocksense price feed working
- [ ] Round system operational (15-min cycles)
- [ ] Bet placement functions working
- [ ] Reward distribution accurate
- [ ] Owner functions accessible

### Frontend ✅
- [ ] Wallet connection to Citrea Testnet
- [ ] Real-time price display from Blocksense
- [ ] Bet form with UP/DOWN options
- [ ] Round timer countdown
- [ ] Transaction confirmations
- [ ] Reward claiming interface

### Integration ✅
- [ ] End-to-end bet placement
- [ ] Round completion and finalization
- [ ] Reward calculation and distribution
- [ ] Error handling and user feedback
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 🎯 Testing Results

After running all tests, you should see:

1. **Contract Functions**: All working correctly
2. **Price Feed**: Live BTC/USDT data from Blocksense
3. **Round System**: 15-minute automatic cycles
4. **Betting**: Smooth UP/DOWN prediction placement
5. **Rewards**: Accurate calculation and claiming

## 📞 Support & Debugging

If you encounter issues:

1. Check console logs for error messages
2. Verify MetaMask network configuration
3. Ensure sufficient cBTC balance for gas
4. Run the debug script for contract status
5. Check Citrea Testnet explorer for transactions

## 🚀 Production Readiness

Once all tests pass:
- ✅ Smart contract thoroughly tested
- ✅ Frontend integration verified
- ✅ User experience optimized
- ✅ Error handling implemented
- ✅ Performance monitoring in place

The system is ready for production deployment!
