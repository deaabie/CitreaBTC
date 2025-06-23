
# Bitcoin Price Prediction - Complete Setup Guide

## 🚀 Quick Start

Follow these steps to get your Bitcoin Price Prediction app running:

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your private key
PRIVATE_KEY=your_private_key_here
```

### 3. Get Test Funds

- Visit [Citrea Testnet Faucet](https://citrea.xyz/faucet)
- Get cBTC tokens for gas fees and testing

### 4. Deploy Smart Contract

```bash
# Deploy to Citrea Testnet
npm run deploy

# Note the contract address from output
```

### 5. Update Frontend Configuration

Edit `src/config/contracts.ts` and update the contract address:

```typescript
export const CONTRACTS = {
  BITCOIN_PREDICTION: {
    address: "YOUR_DEPLOYED_CONTRACT_ADDRESS", // Update this
    // ... rest of config
  }
};
```

### 6. Start Price Oracle

```bash
# Replace with your deployed contract address
npm run oracle 0x1234567890abcdef1234567890abcdef12345678
```

### 7. Launch Frontend

```bash
npm run dev
```

## 🔧 Detailed Setup

### Prerequisites

- Node.js 18+ installed
- MetaMask browser extension
- Git for cloning repository

### Smart Contract Development

The project includes a complete smart contract setup using Hardhat:

```bash
# Compile contracts
npx hardhat compile

# Run tests (if available)
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.js --network citrea_testnet
```

### Oracle System

The price oracle fetches Bitcoin prices every 5 minutes from multiple sources:

- CoinDesk API (primary)
- CoinGecko API (backup)
- Coinbase API (fallback)

Start the oracle after contract deployment:

```bash
node scripts/priceOracle.js <CONTRACT_ADDRESS>
```

### Frontend Configuration

Update these files after deployment:

1. **Contract Address**: `src/config/contracts.ts`
2. **Environment**: Copy `.env.example` to `.env`

### MetaMask Setup

Add Citrea Testnet to MetaMask:

- **Network Name**: Citrea Testnet
- **RPC URL**: https://rpc.testnet.citrea.xyz
- **Chain ID**: 5115
- **Currency Symbol**: cBTC
- **Block Explorer**: https://explorer.testnet.citrea.xyz/

## 🔍 Verification

Run the setup verification script:

```bash
npm run verify-setup
```

This checks:
- All required files exist
- Environment variables are set
- Dependencies are installed
- Configuration is correct

## 🐛 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   npm install
   ```

2. **"Invalid private key" during deployment**
   - Check your `.env` file
   - Ensure private key is valid hex string

3. **"Network not found" errors**
   - Verify Citrea testnet configuration
   - Check RPC URL is accessible

4. **Oracle price submission fails**
   - Ensure contract address is correct
   - Check if wallet has sufficient cBTC for gas
   - Verify APIs are accessible

### Debug Mode

Enable debug logging in oracle:

```javascript
// In scripts/priceOracle.js, add:
console.log('Debug: Fetched price:', price);
console.log('Debug: Transaction hash:', tx.hash);
```

## 📊 Architecture Overview

### Smart Contract (Solidity)
- `BitcoinPricePrediction.sol` - Main prediction contract
- Uses native cBTC for bets and rewards
- 5-minute rounds with automated finalization

### Oracle System (Node.js)
- `scripts/priceOracle.js` - Price fetching and submission
- Multi-API redundancy for reliability
- Automated 5-minute intervals

### Frontend (React + TypeScript)
- `src/contexts/WalletContext.tsx` - Wallet integration
- `src/hooks/useContract.ts` - Contract interactions
- `src/components/` - UI components

## 🎯 Usage Flow

1. **Deploy Contract** → Get contract address
2. **Start Oracle** → Begin price submissions
3. **Launch Frontend** → Users can place bets
4. **Monitor** → Check oracle logs and user activity

## 🔒 Security Notes

- Never commit private keys to version control
- Use environment variables for sensitive data
- Test thoroughly on testnet before mainnet
- Consider professional audit for production

## 📚 Additional Resources

- [Citrea Documentation](https://docs.citrea.xyz/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)

---

**Need help?** Check the troubleshooting section or open an issue in the repository.
