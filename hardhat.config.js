import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.TESTNET_RPC_URL || "https://rpc2.sepolia.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    polygonAmoy: {
      url: process.env.TESTNET_RPC_URL || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    }
  }
};

export default config;
