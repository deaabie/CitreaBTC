
# Deployment Guide

## Quick Deployment Checklist

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] MetaMask wallet with Citrea testnet configured
- [ ] Private key for contract deployment
- [ ] cBTC tokens for initial pool funding

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

1. **Fund Contract Pool**
```javascript
const contract = new ethers.Contract(address, abi, signer);
await contract.depositToPool(ethers.parseEther("100")); // 100 cBTC
```

2. **Setup Price Automation** (Optional)
```javascript
// Automated price submission every 5 minutes
setInterval(async () => {
  const price = await fetchBitcoinPrice();
  await contract.submitPriceAndStartRound(price);
}, 5 * 60 * 1000);
```

3. **Test All Functions**
- [ ] Wallet connection
- [ ] Bet placement
- [ ] Round progression
- [ ] Reward claiming

## Production Considerations

- Use secure key management (AWS KMS, Azure Key Vault)
- Implement proper error handling and logging
- Set up monitoring and alerts
- Consider gas optimization for frequent transactions
- Implement circuit breakers for safety
