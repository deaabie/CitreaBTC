
const hre = require("hardhat");
require("dotenv").config();

class RoundManager {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    this.isRunning = false;
  }

  async initialize() {
    // Set up provider for Citrea testnet
    const provider = new hre.ethers.JsonRpcProvider("https://rpc.testnet.citrea.xyz");
    const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const BitcoinPricePrediction = await hre.ethers.getContractFactory("BitcoinPricePrediction");
    this.contract = BitcoinPricePrediction.attach(this.contractAddress).connect(wallet);
    
    console.log("Round Manager initialized with contract:", this.contractAddress);
    console.log("Network: Citrea Testnet (Chain ID: 5115)");
    console.log("Using wallet:", wallet.address);
    console.log("Blocksense Feed: 0x25ef0a9b5041b2Cd96dcb1692B8C553aB2780BA3");
    console.log("Round Duration: 15 minutes");
  }

  async getCurrentPrice() {
    try {
      const price = await this.contract.getLatestPrice();
      // Blocksense returns price with 8 decimals (10^8 units)
      const formattedPrice = Number(price) / 100000000;
      return { raw: price, formatted: formattedPrice };
    } catch (error) {
      console.error('Error fetching price from Blocksense:', error.message);
      throw error;
    }
  }

  async startNewRound() {
    try {
      const priceData = await this.getCurrentPrice();
      console.log(`Starting new round with BTC/USDT price: $${priceData.formatted.toLocaleString()}`);
      
      const tx = await this.contract.startNewRound({
        gasLimit: 500000
      });
      await tx.wait();
      
      console.log(`New round started successfully`);
      console.log(`Transaction hash: ${tx.hash}`);
      return priceData;
    } catch (error) {
      console.error('Error starting new round:', error.message);
      throw error;
    }
  }

  async checkAndStartRound() {
    try {
      const currentRound = await this.contract.getCurrentRound();
      const now = Math.floor(Date.now() / 1000);
      
      console.log(`Current round ends at: ${new Date(Number(currentRound.endTime) * 1000).toLocaleString()}`);
      console.log(`Current time: ${new Date(now * 1000).toLocaleString()}`);
      
      if (now >= Number(currentRound.endTime) && !currentRound.finalized) {
        console.log('Round ended, starting new round...');
        await this.startNewRound();
      } else {
        const timeLeft = Number(currentRound.endTime) - now;
        console.log(`Round active, ${Math.max(0, timeLeft)} seconds remaining`);
        
        // Show current price for monitoring
        const priceData = await this.getCurrentPrice();
        console.log(`Current BTC/USDT price: $${priceData.formatted.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Error checking round status:', error.message);
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('Round Manager is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting Bitcoin Round Manager on Citrea Testnet...');
    console.log('Using Blocksense price feed for BTC/USDT data');
    console.log('Checking rounds every 60 seconds');

    // Initial check
    try {
      await this.checkAndStartRound();
    } catch (error) {
      console.error('Failed initial round check:', error.message);
    }

    // Set up interval for every 60 seconds (since rounds are 15 minutes)
    this.interval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.checkAndStartRound();
      } catch (error) {
        console.error('Scheduled round check failed:', error.message);
      }
    }, 60 * 1000); // 60 seconds
  }

  stop() {
    if (!this.isRunning) {
      console.log('Round Manager is not running');
      return;
    }

    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    console.log('Round Manager stopped');
  }
}

async function main() {
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.error('Please provide contract address as argument');
    console.log('Usage: node scripts/roundManager.js <CONTRACT_ADDRESS>');
    process.exit(1);
  }

  const manager = new RoundManager(contractAddress);
  await manager.initialize();
  await manager.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down Round Manager...');
    manager.stop();
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = RoundManager;
