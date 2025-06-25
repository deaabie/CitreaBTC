
const hre = require("hardhat");

async function main() {
  console.log("Deploying BitcoinPricePrediction contract to Citrea Testnet...");
  console.log("Using Blocksense Price Feed: 0x25ef0a9b5041b2Cd96dcb1692B8C553aB2780BA3");

  // Blocksense BTC/USDT Price Feed on Citrea Testnet
  const blocksensePriceFeed = "0x25ef0a9b5041b2Cd96dcb1692B8C553aB2780BA3";

  // Deploy BitcoinPricePrediction contract
  const BitcoinPricePrediction = await hre.ethers.getContractFactory("BitcoinPricePrediction");
  const predictionContract = await BitcoinPricePrediction.deploy(blocksensePriceFeed);
  await predictionContract.waitForDeployment();
  
  const predictionAddress = await predictionContract.getAddress();
  console.log("BitcoinPricePrediction deployed to:", predictionAddress);

  // Test Blocksense connection
  try {
    const currentPrice = await predictionContract.getLatestPrice();
    // Blocksense returns price with 8 decimals (10^8 units)
    const formattedPrice = Number(currentPrice) / 100000000;
    console.log("Current BTC/USDT price from Blocksense:", `$${formattedPrice.toLocaleString()}`);
  } catch (error) {
    console.log("Warning: Could not fetch price from Blocksense:", error.message);
  }

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("Network: Citrea Testnet");
  console.log("Chain ID: 5115");
  console.log("Prediction Contract:", predictionAddress);
  console.log("Blocksense BTC/USDT Feed: 0x25ef0a9b5041b2Cd96dcb1692B8C553aB2780BA3");
  console.log("Round Duration: 15 minutes");
  console.log("Max Price Age: 30 minutes");
  
  console.log("\nNext Steps:");
  console.log("1. Update src/config/contracts.ts with this address:");
  console.log(`   VITE_PREDICTION_CONTRACT_ADDRESS=${predictionAddress}`);
  console.log("2. Start the round manager with:");
  console.log(`   node scripts/roundManager.js ${predictionAddress}`);
  console.log("3. Contract is ready to accept bets with native cBTC!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
