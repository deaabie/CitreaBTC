
const hre = require("hardhat");

async function main() {
  console.log("Deploying BitcoinPricePrediction contract...");

  // Deploy BitcoinPricePrediction contract (no token needed, uses native cBTC)
  const BitcoinPricePrediction = await hre.ethers.getContractFactory("BitcoinPricePrediction");
  const predictionContract = await BitcoinPricePrediction.deploy();
  await predictionContract.waitForDeployment();
  
  const predictionAddress = await predictionContract.getAddress();
  console.log("BitcoinPricePrediction deployed to:", predictionAddress);

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("Prediction Contract:", predictionAddress);
  
  console.log("\nNext Steps:");
  console.log("1. Update src/config/contracts.ts with this address");
  console.log("2. Start the price oracle with:");
  console.log(`   node scripts/priceOracle.js ${predictionAddress}`);
  console.log("3. Contract is ready to accept bets with native cBTC!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
