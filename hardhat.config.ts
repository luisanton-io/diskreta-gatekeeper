import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config()

const { ALCHEMY_API_KEY_MAINNET, ALCHEMY_API_KEY_MUMBAI, PRIVATE_KEY } = process.env;

if (!ALCHEMY_API_KEY_MAINNET || !ALCHEMY_API_KEY_MUMBAI || !PRIVATE_KEY) {
  throw new Error("Please set your ALCHEMY_API_KEY and PRIVATE_KEY env vars");
}

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      throwOnCallFailures: false,
      throwOnTransactionFailures: false,
      forking: {
        // url: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
        url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY_MAINNET}`,
        // url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY_MUMBAI}`,
        blockNumber: 17333620
      }
    }, // Hardhat Network
    ganache: {
      url: "http://localhost:8545"
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY_MUMBAI}`,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },

};

export default config;
