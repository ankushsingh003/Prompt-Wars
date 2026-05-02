require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, ALCHEMY_POLYGON_URL, POLYGONSCAN_KEY } = process.env;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    // Local development
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545" },

    // Polygon Mumbai testnet (free test MATIC from faucet)
    mumbai: {
      url: ALCHEMY_POLYGON_URL || "https://rpc-mumbai.maticvigil.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80001
    },

    // Polygon mainnet (real MATIC, use for production)
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 137
    }
  },
  etherscan: {
    apiKey: { polygonMumbai: POLYGONSCAN_KEY }
  }
};
