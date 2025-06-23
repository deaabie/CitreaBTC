const hre = require("hardhat");

async function main() {
  console.log("Deploying BitcoinPricePrediction contract to Plume Testnet...");
  console.log("Using eOracle Price Feed: 0x1E89dA0C147C317f762A39B12808Db1CE42133E2");

  // Deploy BitcoinPricePrediction contract
  const BitcoinPricePrediction = await hre.ethers.getContractFactory("BitcoinPricePrediction");
  const predictionContract = await BitcoinPricePrediction.deploy();
  await predictionContract.waitForDeployment();
  
  const predictionAddress = await predictionContract.getAddress();
  console.log("BitcoinPricePrediction deployed to:", predictionAddress);

  // Test eOracle connection
  try {
    const currentPrice = await predictionContract.getLatestPrice();
    console.log("Current BTC price from eOracle:", currentPrice.toString());
  } catch (error) {
    console.log("Warning: Could not fetch price from eOracle:", error.message);
  }

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("Network: Plume Testnet");
  console.log("Chain ID: 98867");
  console.log("Prediction Contract:", predictionAddress);
  console.log("eOracle BTC/USD Feed: 0x1E89dA0C147C317f762A39B12808Db1CE42133E2");
  
  console.log("\nNext Steps:");
  console.log("1. Update src/config/contracts.ts with this address");
  console.log("2. Start the round manager with:");
  console.log(`   node scripts/roundManager.js ${predictionAddress}`);
  console.log("3. Contract is ready to accept bets with native PLUME!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
