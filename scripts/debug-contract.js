
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = process.argv[2];
  
  if (!contractAddress) {
    console.error('Please provide contract address as argument');
    console.log('Usage: node scripts/debug-contract.js <CONTRACT_ADDRESS>');
    process.exit(1);
  }

  console.log('🔍 Debugging contract on Plume Testnet...');
  console.log('Contract Address:', contractAddress);
  
  try {
    // Set up provider for Plume testnet
    const provider = new hre.ethers.JsonRpcProvider("https://testnet-rpc.plume.org");
    const wallet = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    console.log('Connected to Plume Testnet (Chain ID: 98867)');
    console.log('Wallet Address:', wallet.address);
    
    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log('Wallet Balance:', hre.ethers.formatEther(balance), 'PLUME');
    
    // Get contract instance
    const BitcoinPricePrediction = await hre.ethers.getContractFactory("BitcoinPricePrediction");
    const contract = BitcoinPricePrediction.attach(contractAddress).connect(wallet);
    
    // Check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.log('❌ No contract found at this address');
      return;
    }
    console.log('✅ Contract found at address');
    
    // Get contract owner
    try {
      const owner = await contract.owner();
      console.log('Contract Owner:', owner);
      console.log('Is Caller Owner?', owner.toLowerCase() === wallet.address.toLowerCase());
    } catch (error) {
      console.log('❌ Failed to get owner:', error.message);
    }
    
    // Get current round info
    try {
      const currentRoundId = await contract.currentRoundId();
      console.log('Current Round ID:', currentRoundId.toString());
      
      const currentRound = await contract.getCurrentRound();
      console.log('Current Round:', {
        startTime: new Date(Number(currentRound.startTime) * 1000).toLocaleString(),
        endTime: new Date(Number(currentRound.endTime) * 1000).toLocaleString(),
        startPrice: currentRound.startPrice.toString(),
        endPrice: currentRound.endPrice.toString(),
        isUp: currentRound.isUp,
        finalized: currentRound.finalized
      });
    } catch (error) {
      console.log('❌ Failed to get round info:', error.message);
    }
    
    // Check pool balance
    try {
      const poolBalance = await contract.poolBalance();
      console.log('Pool Balance:', hre.ethers.formatEther(poolBalance), 'PLUME');
    } catch (error) {
      console.log('❌ Failed to get pool balance:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
