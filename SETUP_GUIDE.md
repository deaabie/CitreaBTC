# Bitcoin Price Prediction - Complete Setup Guide

## 🚀 Quick Start

Follow these steps to get your Bitcoin Price Prediction app running with eOracle integration:

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

- Visit [Plume Testnet Faucet](https://faucet.plume.org)
- Get PLUME tokens for gas fees and testing

### 4. Deploy Smart Contract

```bash
# Deploy to Plume Testnet
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

### 6. Start Round Manager

```bash
# Replace with your deployed contract address
npm run round-manager 0x1234567890abcdef1234567890abcdef12345678
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

The project includes a complete smart contract setup using Hardhat with eOracle integration:

```bash
# Compile contracts
npx hardhat compile

# Run tests (if available)
npx hardhat test

# Deploy to testnet
npx hardhat run scripts/deploy.js --network plume_testnet
```

### eOracle Integration

The system now uses eOracle's decentralized price feeds:

- **Price Feed**: BTC/USD on Plume Testnet
- **Address**: `0x1E89dA0C147C317f762A39B12808Db1CE42133E2`
- **Decimals**: 8
- **Updates**: Automatic via eOracle network

### Round Management System

The round manager automatically handles price updates and round transitions:

```bash
node scripts/roundManager.js <CONTRACT_ADDRESS>
```

Features:
- Monitors round completion every 30 seconds
- Fetches real-time prices from eOracle
- Automatically starts new rounds
- Handles reward distribution

### Frontend Configuration

Update these files after deployment:

1. **Contract Address**: `src/config/contracts.ts`
2. **Environment**: Copy `.env.example` to `.env`

### MetaMask Setup

Add Plume Testnet to MetaMask:

- **Network Name**: Plume Testnet
- **RPC URL**: https://testnet-rpc.plume.org
- **Chain ID**: 98867
- **Currency Symbol**: PLUME
- **Block Explorer**: https://testnet-explorer.plume.org/

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
   - Verify Plume testnet configuration
   - Check RPC URL is accessible

4. **eOracle price feed errors**
   - Ensure contract address is correct
   - Check if wallet has sufficient PLUME for gas
   - Verify eOracle feed is active

### Debug Mode

Test eOracle connection and contract state:

```bash
npm run debug-contract <CONTRACT_ADDRESS>
```

This shows:
- Current BTC price from eOracle
- Round status and timing
- Contract balance and owner
- Price feed health

## 📊 Architecture Overview

### Smart Contract (Solidity)
- `BitcoinPricePrediction.sol` - Main prediction contract with eOracle integration
- Uses native PLUME for bets and rewards
- 5-minute rounds with automated price feeds

### Round Management (Node.js)
- `scripts/roundManager.js` - Automated round management
- eOracle price feed integration
- Real-time monitoring and round transitions

### Frontend (React + TypeScript)
- `src/contexts/WalletContext.tsx` - Wallet integration
- `src/hooks/useContract.ts` - Contract interactions with eOracle
- `src/components/` - UI components

## 🎯 Usage Flow

1. **Deploy Contract** → Get contract address
2. **Start Round Manager** → Begin automated round management
3. **Launch Frontend** → Users can place bets
4. **Monitor** → Check round manager logs and user activity

## 🔒 Security Notes

- Never commit private keys to version control
- Use environment variables for sensitive data
- Test thoroughly on testnet before mainnet
- eOracle provides tamper-proof price data
- Consider professional audit for production

## 📚 Additional Resources

- [eOracle Documentation](https://eoracle.io/docs)
- [Plume Documentation](https://docs.plume.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/)

---

**Need help?** Check the troubleshooting section or open an issue in the repository.
