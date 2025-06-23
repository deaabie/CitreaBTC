
# Deployment Guide

## Quick Deployment Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] MetaMask wallet with Citrea testnet configured
- [ ] Private key for contract deployment
- [ ] cBTC balance for gas fees and initial testing

### Smart Contract Deployment

1. **Setup Hardhat Environment**
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install @openzeppelin/contracts
```

2. **Configure Network**
```javascript
// hardhat.config.js
module.exports = {
  networks: {
    citrea_testnet: {
      url: "https://rpc.testnet.citrea.xyz",
      chainId: 5115,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

3. **Deploy Contract**
```bash
npx hardhat run scripts/deploy.js --network citrea_testnet
```

4. **Note Contract Address** - Update frontend configuration

### Frontend Deployment

1. **Update Contract Config**
```typescript
// src/config/contracts.ts
export const CONTRACTS = {
  BITCOIN_PREDICTION: {
    address: "YOUR_DEPLOYED_CONTRACT_ADDRESS"
  }
};
```

2. **Build and Deploy**
```bash
npm run build
# Deploy dist folder to your hosting platform
```

### Post-Deployment Setup

1. **Start Price Oracle**
```bash
node scripts/priceOracle.js YOUR_CONTRACT_ADDRESS
```

2. **Test All Functions**
- [ ] Wallet connection
- [ ] Bet placement with native cBTC
- [ ] Round progression
- [ ] Reward claiming

## Native cBTC Usage

This system uses native cBTC (Citrea's native currency) for all operations:
- Users bet with native cBTC (sent as msg.value)
- Rewards are paid in native cBTC
- No ERC-20 token contracts needed
- Gas fees paid in cBTC
- Contract deployment only requires the prediction contract

## Production Considerations

- Use secure key management (AWS KMS, Azure Key Vault)
- Implement proper error handling and logging
- Set up monitoring and alerts
- Consider gas optimization for frequent transactions
- Implement circuit breakers for safety

## Deployment Commands Summary

```bash
# 1. Deploy the prediction contract
npx hardhat run scripts/deploy.js --network citrea_testnet

# 2. Update frontend config with deployed address
# Edit src/config/contracts.ts

# 3. Start the price oracle
node scripts/priceOracle.js <DEPLOYED_CONTRACT_ADDRESS>

# 4. Build and deploy frontend
npm run build
```

That's it! No token contracts needed - everything works with native cBTC.
