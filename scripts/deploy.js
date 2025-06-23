
const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy cBTC Token first
  const CBTCToken = await hre.ethers.getContractFactory("CBTCToken");
  const cbtcToken = await CBTCToken.deploy();
  await cbtcToken.waitForDeployment();
  
  const cbtcTokenAddress = await cbtcToken.getAddress();
  console.log("cBTC Token deployed to:", cbtcTokenAddress);

  // Deploy BitcoinPricePrediction contract
  const BitcoinPricePrediction = await hre.ethers.getContractFactory("BitcoinPricePrediction");
  const predictionContract = await BitcoinPricePrediction.deploy(cbtcTokenAddress);
  await predictionContract.waitForDeployment();
  
  const predictionAddress = await predictionContract.getAddress();
  console.log("BitcoinPricePrediction deployed to:", predictionAddress);

  console.log("\nDeployment Summary:");
  console.log("==================");
  console.log("cBTC Token:", cbtcTokenAddress);
  console.log("Prediction Contract:", predictionAddress);
  
  console.log("\nNext Steps:");
  console.log("1. Update src/config/contracts.ts with these addresses");
  console.log("2. Fund the prediction contract with cBTC tokens");
  console.log("3. Start the price oracle");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
