
# Bitcoin Price Prediction DApp - Citrea Testnet

A decentralized application for predicting Bitcoin price movements every 5 minutes on the Citrea Testnet. Users can place bets using cBTC tokens and earn rewards for correct predictions.

## 🚀 Live Demo

[View Live Demo](https://your-domain.com) - Experience the app without wallet connection

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation Guide](#installation-guide)
- [Smart Contract Development](#smart-contract-development)
- [Smart Contract Setup](#smart-contract-setup)
- [Frontend Integration](#frontend-integration)
- [Deployment](#deployment)
- [Network Configuration](#network-configuration)
- [Usage](#usage)
- [Contributing](#contributing)

## ✨ Features

- **5-minute prediction rounds** - Fast-paced Bitcoin price predictions
- **MetaMask integration** - Seamless wallet connection
- **Real-time price updates** - Live Bitcoin price tracking
- **Reward system** - Earn cBTC for correct predictions
- **Demo mode** - Explore the app without wallet connection
- **Responsive design** - Works on desktop and mobile

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Blockchain**: Ethereum/Citrea Testnet
- **Web3**: ethers.js v6, MetaMask detection
- **Smart Contract**: Solidity ^0.8.20

## 📦 Installation Guide

### Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask browser extension
- Solidity development environment (Hardhat/Foundry)

### Frontend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/bitcoin-prediction-dapp.git
cd bitcoin-prediction-dapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

## 🔨 Smart Contract Development

### Contract Overview

The `BitcoinPricePrediction` contract manages:
- 5-minute prediction rounds
- User bet placement and tracking
- Reward distribution
- Pool balance management

### Key Features

- **Round Management**: Automated 5-minute rounds with start/end prices
- **Bet Placement**: Users can bet UP or DOWN with cBTC tokens
- **Reward System**: Winners receive 1:1 payout from the pool
- **Owner Controls**: Price submission and pool management

### Contract Structure

```solidity
contract BitcoinPricePrediction {
    // Core structures
    struct Bet { address user; uint256 amount; bool isUp; uint256 round; }
    struct Round { /* round data */ }
    
    // Key functions
    function placeBet(uint256 _amount, bool _isUp) external;
    function submitPriceAndStartRound(uint256 _price) external onlyOwner;
    function claimRewards() external;
}
```

## 🚀 Smart Contract Setup Instructions

### Step 1: Setup Development Environment

**Option A: Using Hardhat**

1. **Initialize Hardhat project**
```bash
mkdir bitcoin-prediction-contract
cd bitcoin-prediction-contract
npm init -y
npm install --save-dev hardhat
npx hardhat
```

2. **Install dependencies**
```bash
npm install @openzeppelin/contracts
npm install --save-dev @nomicfoundation/hardhat-toolbox
```

**Option B: Using Foundry**

1. **Initialize Foundry project**
```bash
forge init bitcoin-prediction-contract
cd bitcoin-prediction-contract
```

2. **Install OpenZeppelin**
```bash
forge install OpenZeppelin/openzeppelin-contracts
```

### Step 2: Create Smart Contract

Create `contracts/BitcoinPricePrediction.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IPriceFeed {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

contract BitcoinPricePrediction is Ownable, ReentrancyGuard {
    // Struktur untuk menyimpan taruhan pengguna
    struct Bet {
        address user;
        uint256 amount; // Jumlah taruhan dalam native cBTC
        bool isUp; // True untuk Up, False untuk Down
        uint256 round; // Ronde taruhan
    }

    // Struktur untuk menyimpan data ronde
    struct Round {
        uint256 startTime; // Waktu mulai ronde
        uint256 endTime; // Waktu akhir ronde
        uint256 startPrice; // Harga BTC saat ronde dimulai
        uint256 endPrice; // Harga BTC saat ronde selesai
        bool isUp; // True jika harga naik, False jika turun
        bool finalized; // Apakah ronde sudah selesai
    }

    // State variables
    IPriceFeed public immutable priceFeed; // Kontrak price feed Blocksense
    uint256 public constant ROUND_DURATION = 15 minutes; // Durasi setiap ronde
    uint256 public constant MAX_PRICE_AGE = 30 minutes; // Maksimum usia data harga
    uint256 public currentRoundId; // ID ronde saat ini
    mapping(uint256 => Round) public rounds; // Data setiap ronde
    mapping(uint256 => Bet[]) public bets; // Taruhan per ronde
    mapping(address => uint256) public pendingRewards; // Hadiah yang belum diklaim
    uint256 public poolBalance; // Saldo pool hadiah

    // Events
    event RoundStarted(uint256 roundId, uint256 startTime, uint256 startPrice);
    event RoundFinalized(uint256 roundId, uint256 endTime, uint256 endPrice, bool isUp);
    event BetPlaced(address user, uint256 roundId, uint256 amount, bool isUp);
    event RewardClaimed(address user, uint256 amount);
    event PoolUpdated(uint256 newBalance, bool isDeposit);

    constructor(address _priceFeedAddress) Ownable(msg.sender) {
        priceFeed = IPriceFeed(_priceFeedAddress);
        currentRoundId = 1;
        // Mulai ronde pertama dengan harga dari price feed
        (, int256 price,, uint256 updatedAt,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        require(block.timestamp <= updatedAt + MAX_PRICE_AGE, "Price feed too old");
        rounds[currentRoundId] = Round(block.timestamp, block.timestamp + ROUND_DURATION, uint256(price), 0, false, false);
        emit RoundStarted(currentRoundId, block.timestamp, uint256(price));
    }

    // Fungsi untuk memulai ronde baru dan finalisasi ronde sebelumnya
    function startNewRound() external nonReentrant {
        Round storage currentRound = rounds[currentRoundId];
        require(block.timestamp >= currentRound.endTime, "Current round not finished");
        require(!currentRound.finalized, "Current round already finalized");

        // Ambil harga terbaru dari price feed untuk finalisasi ronde
        (, int256 endPrice,, uint256 updatedAt,) = priceFeed.latestRoundData();
        require(endPrice > 0, "Invalid price feed");
        require(block.timestamp <= updatedAt + MAX_PRICE_AGE, "Price feed too old");

        // Finalisasi ronde saat ini
        currentRound.endPrice = uint256(endPrice);
        currentRound.isUp = uint256(endPrice) > currentRound.startPrice;
        currentRound.finalized = true;
        _distributeRewards(currentRoundId);
        emit RoundFinalized(currentRoundId, block.timestamp, uint256(endPrice), currentRound.isUp);

        // Mulai ronde baru
        currentRoundId++;
        (, int256 newPrice,, uint256 newUpdatedAt,) = priceFeed.latestRoundData();
        require(newPrice > 0, "Invalid price feed");
        require(block.timestamp <= newUpdatedAt + MAX_PRICE_AGE, "Price feed too old");
        rounds[currentRoundId] = Round(
            block.timestamp,
            block.timestamp + ROUND_DURATION,
            uint256(newPrice),
            0,
            false,
            false
        );
        emit RoundStarted(currentRoundId, block.timestamp, uint256(newPrice));
    }

    // Pengguna memasang taruhan
    function placeBet(bool _isUp) external payable nonReentrant {
        require(msg.value > 0, "Bet amount must be greater than 0");
        Round storage currentRound = rounds[currentRoundId];
        require(block.timestamp < currentRound.endTime, "Round already ended");
        require(!currentRound.finalized, "Round already finalized");

        // Tambahkan taruhan ke pool
        poolBalance += msg.value;
        bets[currentRoundId].push(Bet(msg.sender, msg.value, _isUp, currentRoundId));
        emit BetPlaced(msg.sender, currentRoundId, msg.value, _isUp);
        emit PoolUpdated(poolBalance, true);
    }

    // Distribusi hadiah untuk pemenang
    function _distributeRewards(uint256 _roundId) internal {
        Round storage round = rounds[_roundId];
        Bet[] storage roundBets = bets[_roundId];
        uint256 totalWinningBets = 0;
        uint256 totalPool = poolBalance;

        // Hitung total taruhan pemenang
        for (uint256 i = 0; i < roundBets.length; i++) {
            if (roundBets[i].isUp == round.isUp) {
                totalWinningBets += roundBets[i].amount;
            }
        }

        // Distribusikan hadiah secara proporsional
        if (totalWinningBets > 0) {
            for (uint256 i = 0; i < roundBets.length; i++) {
                Bet storage bet = roundBets[i];
                if (bet.isUp == round.isUp) {
                    // Payout proporsional berdasarkan kontribusi taruhan
                    uint256 reward = (bet.amount * totalPool) / totalWinningBets;
                    pendingRewards[bet.user] += reward;
                    poolBalance -= reward;
                }
            }
        }
        // Jika tidak ada pemenang, pool tetap untuk ronde berikutnya
    }

    // Pengguna klaim hadiah
    function claimRewards() external nonReentrant {
        uint256 reward = pendingRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        require(address(this).balance >= reward, "Insufficient contract balance");

        pendingRewards[msg.sender] = 0;
        payable(msg.sender).transfer(reward);
        emit RewardClaimed(msg.sender, reward);
    }

    // Creator menambah saldo pool
    function depositToPool() external payable onlyOwner {
        require(msg.value > 0, "Amount must be greater than 0");
        poolBalance += msg.value;
        emit PoolUpdated(poolBalance, true);
    }

    // Creator menarik saldo pool
    function withdrawFromPool(uint256 _amount) external onlyOwner nonReentrant {
        require(_amount <= poolBalance, "Insufficient pool balance");
        require(address(this).balance >= _amount, "Insufficient contract balance");
        poolBalance -= _amount;
        payable(msg.sender).transfer(_amount);
        emit PoolUpdated(poolBalance, false);
    }

    // Fungsi untuk cek status ronde saat ini
    function getCurrentRound() external view returns (Round memory) {
        return rounds[currentRoundId];
    }

    // Fungsi untuk cek taruhan pengguna di ronde tertentu
    function getUserBets(uint256 _roundId, address _user) external view returns (Bet[] memory) {
        Bet[] storage roundBets = bets[_roundId];
        uint256 count = 0;
        for (uint256 i = 0; i < roundBets.length; i++) {
            if (roundBets[i].user == _user) {
                count++;
            }
        }

        Bet[] memory userBets = new Bet[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < roundBets.length; i++) {
            if (roundBets[i].user == _user) {
                userBets[index] = roundBets[i];
                index++;
            }
        }
        return userBets;
    }

    // Fungsi untuk mendapatkan harga BTC terbaru
    function getLatestPrice() external view returns (uint256) {
        (, int256 price,, uint256 updatedAt,) = priceFeed.latestRoundData();
        require(price > 0, "Invalid price feed");
        require(block.timestamp <= updatedAt + MAX_PRICE_AGE, "Price feed too old");
        return uint256(price);
    }

    // Fallback function to receive native cBTC
    receive() external payable {}
}

```

### Step 3: Configure Network (Hardhat)

Update `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify"); // Pastikan plugin ini terinstal

module.exports = {
  solidity: "0.8.20",
  networks: {
    citreaTestnet: {
      url: "https://rpc.testnet.citrea.xyz", // Ganti dengan RPC URL resmi
      chainId: 5115,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: {
      citreaTestnet: "placeholder" // Ganti dengan API key jika diperlukan, atau gunakan string placeholder
    },
    customChains: [
      {
        network: "citreaTestnet",
        chainId: 5115,
        urls: {
          apiURL: "https://explorer.testnet.citrea.xyz/api", // Ganti dengan URL resmi
          browserURL: "https://explorer.testnet.citrea.xyz" // Ganti dengan URL resmi
        }
      }
    ]
  }
};
```

### Step 4: Create Deployment Script

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const priceFeedAddress = "0x25ef0a9b5041b2Cd96dcb1692B8C553aB2780BA3"; // Blocksense BTC/USDT
  const BitcoinPricePrediction = await hre.ethers.getContractFactory("BitcoinPricePrediction");
  const contract = await BitcoinPricePrediction.deploy(priceFeedAddress);
  console.log("BitcoinPricePrediction deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

```

### Step 5: Deploy Contract

1. **Set up environment variables**
```bash
# Create .env file
echo "PRIVATE_KEY=your_private_key_here" > .env
```

2. **Deploy to Citrea Testnet**
```bash
npx hardhat run scripts/deploy.js --network citrea_testnet
```

3. **Verify contract (optional)**
```bash
npx hardhat verify --network citrea_testnet DEPLOYED_CONTRACT_ADDRESS cBTC_TOKEN_ADDRESS
```

## 🔗 Frontend Integration

### Step 1: Update Contract Configuration

Create `src/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  BITCOIN_PREDICTION: {
    address: "0x...", // Your deployed contract address
    abi: [ /* Contract ABI */ ]
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
```

### Step 2: Create Contract Hooks

Create `src/hooks/useContract.ts`:

```typescript
import { useWallet } from '@/contexts/WalletContext';
import { CONTRACTS } from '@/config/contracts';
import { ethers } from 'ethers';

export const useContract = () => {
  const { provider } = useWallet();

  const getPredictionContract = () => {
    if (!provider) return null;
    return new ethers.Contract(
      CONTRACTS.BITCOIN_PREDICTION.address,
      CONTRACTS.BITCOIN_PREDICTION.abi,
      provider.getSigner()
    );
  };

  return { getPredictionContract };
};
```

## 🌐 Network Configuration

### Citrea Testnet Details

- **Chain ID**: 5115 (0x13FB)
- **Currency**: cBTC
- **RPC URL**: https://rpc.testnet.citrea.xyz
- **Explorer**: https://explorer.testnet.citrea.xyz/

### Add Network to MetaMask

Users can add the network manually or your dApp can prompt them:

```javascript
const addCitreaNetwork = async () => {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: '0x13FB',
      chainName: 'Citrea Testnet',
      nativeCurrency: {
        name: 'cBTC',
        symbol: 'cBTC',
        decimals: 18
      },
      rpcUrls: ['https://rpc.testnet.citrea.xyz'],
      blockExplorerUrls: ['https://explorer.testnet.citrea.xyz/']
    }]
  });
};
```

## 🚀 Deployment

### Frontend Deployment

1. **Build the project**
```bash
npm run build
```

2. **Deploy to your preferred platform**:
   - **Vercel**: Connect GitHub repo and deploy automatically
   - **Netlify**: Drag and drop `dist` folder or connect repo
   - **GitHub Pages**: Use GitHub Actions for deployment

### Smart Contract Deployment Checklist

- [ ] Deploy cBTC token (or use existing)
- [ ] Deploy BitcoinPricePrediction contract
- [ ] Fund contract with initial cBTC pool
- [ ] Set up automated price submission system
- [ ] Update frontend with contract addresses
- [ ] Test all functionalities on testnet

## 📊 Usage

### For Users

1. **Connect Wallet**: Install MetaMask and connect to Citrea Testnet
2. **Get cBTC**: Obtain test cBTC tokens from faucet
3. **Place Bets**: Predict UP or DOWN for Bitcoin price
4. **Wait**: Each round lasts 5 minutes
5. **Claim Rewards**: Collect winnings for correct predictions

### For Contract Owner

1. **Price Submission**: Submit Bitcoin price every 5 minutes
2. **Pool Management**: Deposit/withdraw cBTC from reward pool
3. **Monitor**: Track contract health and user activity

## 🔄 Automated Price Updates

Consider implementing automated price submission using:

- **Chainlink Price Feeds** (if available on Citrea)
- **Custom Oracle Service** with off-chain price fetching
- **Cron Jobs** with Web3 integration

Example automation script:

```javascript
const submitPrice = async () => {
  const price = await fetchBitcoinPrice(); // From API
  const contract = getPredictionContract();
  await contract.submitPriceAndStartRound(price);
};

// Run every 5 minutes
setInterval(submitPrice, 5 * 60 * 1000);
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is a testnet application for educational purposes. Do not use real funds. Always audit smart contracts before mainnet deployment.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/bitcoin-prediction-dapp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/bitcoin-prediction-dapp/discussions)
- **Email**: your-email@example.com

---

**Happy Trading! 🚀**
