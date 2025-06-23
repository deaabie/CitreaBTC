
const hre = require("hardhat");
const axios = require("axios");
require("dotenv").config();

class PriceOracle {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    this.isRunning = false;
  }

  async initialize() {
    // Set up provider for Plume testnet
    const provider = new hre.ethers.JsonRpcProvider("https://testnet-rpc.plume.org");
    const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const BitcoinPricePrediction = await hre.ethers.getContractFactory("BitcoinPricePrediction");
    this.contract = BitcoinPricePrediction.attach(this.contractAddress).connect(wallet);
    
    console.log("Oracle initialized with contract:", this.contractAddress);
    console.log("Network: Plume Testnet (Chain ID: 98867)");
    console.log("Using wallet:", wallet.address);
  }

  async fetchBitcoinPrice() {
    const apis = [
      'https://api.coindesk.com/v1/bpi/currentprice/USD.json',
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      'https://api.coinbase.com/v2/exchange-rates?currency=BTC'
    ];

    for (const api of apis) {
      try {
        const response = await axios.get(api, { timeout: 5000 });
        
        if (api.includes('coindesk')) {
          return Math.round(parseFloat(response.data.bpi.USD.rate.replace(',', '')));
        } else if (api.includes('coingecko')) {
          return Math.round(response.data.bitcoin.usd);
        } else if (api.includes('coinbase')) {
          return Math.round(parseFloat(response.data.data.rates.USD));
        }
      } catch (error) {
        console.log(`Failed to fetch from ${api}:`, error.message);
        continue;
      }
    }
    
    throw new Error('All price APIs failed');
  }

  async submitPrice() {
    try {
      const price = await this.fetchBitcoinPrice();
      console.log(`Submitting price: $${price} to Plume Testnet`);
      
      const tx = await this.contract.submitPriceAndStartRound(price, {
        gasLimit: 500000
      });
      await tx.wait();
      
      console.log(`Price submitted successfully: $${price}`);
      console.log(`Transaction hash: ${tx.hash}`);
      return price;
    } catch (error) {
      console.error('Error submitting price:', error.message);
      throw error;
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('Oracle is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting Bitcoin Price Oracle on Plume Testnet...');
    console.log('Submitting prices every 5 minutes');

    // Submit initial price
    try {
      await this.submitPrice();
    } catch (error) {
      console.error('Failed to submit initial price:', error.message);
    }

    // Set up interval for every 5 minutes
    this.interval = setInterval(async () => {
      if (!this.isRunning) return;
      
      try {
        await this.submitPrice();
      } catch (error) {
        console.error('Scheduled price submission failed:', error.message);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  stop() {
    if (!this.isRunning) {
      console.log('Oracle is not running');
      return;
    }

    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
    }
    console.log('Oracle stopped');
  }
}

async function main() {
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.error('Please provide contract address as argument');
    console.log('Usage: node scripts/priceOracle.js <CONTRACT_ADDRESS>');
    process.exit(1);
  }

  const oracle = new PriceOracle(contractAddress);
  await oracle.initialize();
  await oracle.start();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down oracle...');
    oracle.stop();
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = PriceOracle;
