
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    plume_testnet: {
      url: "https://testnet-rpc.plume.org",
      chainId: 98867,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    }
  },
  etherscan: {
    apiKey: {
      plume_testnet: "not-needed"
    },
    customChains: [
      {
        network: "plume_testnet",
        chainId: 98867,
        urls: {
          apiURL: "https://testnet-explorer.plume.org/api",
          browserURL: "https://testnet-explorer.plume.org"
        }
      }
    ]
  }
};
