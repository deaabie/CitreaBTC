
const fs = require('fs');
const path = require('path');

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

function checkEnvVar(varName) {
  const exists = process.env[varName] !== undefined;
  console.log(`${exists ? '✅' : '❌'} Environment variable: ${varName}`);
  return exists;
}

async function main() {
  console.log('🔍 Verifying Bitcoin Price Prediction Setup...\n');

  let allGood = true;

  // Check required files
  console.log('📁 Checking Files:');
  allGood &= checkFile('contracts/BitcoinPricePrediction.sol', 'Smart Contract');
  allGood &= checkFile('scripts/deploy.js', 'Deploy Script');
  allGood &= checkFile('scripts/priceOracle.js', 'Price Oracle');
  allGood &= checkFile('hardhat.config.js', 'Hardhat Config');
  allGood &= checkFile('.env', 'Environment File');
  allGood &= checkFile('src/config/contracts.ts', 'Contract Config');

  console.log('\n🔐 Checking Environment Variables:');
  require('dotenv').config();
  allGood &= checkEnvVar('PRIVATE_KEY');

  console.log('\n📦 Checking Dependencies:');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['ethers', 'hardhat', '@openzeppelin/contracts', 'axios', 'dotenv'];
    
    for (const dep of requiredDeps) {
      const exists = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
      console.log(`${exists ? '✅' : '❌'} Dependency: ${dep}`);
      if (!exists) allGood = false;
    }
  } catch (error) {
    console.log('❌ Failed to read package.json');
    allGood = false;
  }

  console.log('\n🎯 Summary:');
  if (allGood) {
    console.log('✅ All checks passed! Your setup is ready.');
    console.log('\n📋 Next Steps:');
    console.log('1. Deploy contracts: npm run deploy');
    console.log('2. Start oracle: npm run oracle <CONTRACT_ADDRESS>');
    console.log('3. Launch frontend: npm run dev');
  } else {
    console.log('❌ Some issues found. Please fix them before proceeding.');
    console.log('\n📚 Check the SETUP_GUIDE.md for detailed instructions.');
  }
}

main().catch(console.error);
