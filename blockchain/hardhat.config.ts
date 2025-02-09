import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {}, // 本地測試
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      // url: `https://ethereum-sepolia-rpc.publicnode.com`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    holesky: {
      url: `https://eth-holesky.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    }
  },
};

export default config;
