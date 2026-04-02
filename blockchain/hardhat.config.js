require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    // opBNB Testnet (Layer 2) — primary target
    opBNBTestnet: {
      url: process.env.OPBNB_TESTNET_RPC || "https://opbnb-testnet-rpc.bnbchain.org",
      chainId: 5611,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      gasPrice: 1000000, // 0.001 gwei — opBNB is extremely cheap
    },
    // BSC Testnet (Layer 1) — kept as fallback
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      gasPrice: 10000000000, // 10 gwei
    },
  },
  etherscan: {
    apiKey: {
      opBNBTestnet: process.env.BSCSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "opBNBTestnet",
        chainId: 5611,
        urls: {
          apiURL: "https://api-opbnb-testnet.bscscan.com/api",
          browserURL: "https://testnet.opbnbscan.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
