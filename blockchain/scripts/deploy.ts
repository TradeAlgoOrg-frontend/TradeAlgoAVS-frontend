import { ethers, network } from "hardhat";

async function main() {

  // Log the network name and chain ID
  console.log("Network Name:", network.name);
  console.log("Network Chain ID:", (await ethers.provider.getNetwork()).chainId);

  const [deployer] = await ethers.getSigners(); // Gets deployer from hardhat.config.ts

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  const TradingAlgoAVS = await ethers.getContractFactory("TradingAlgoAVS");
  const contract = await TradingAlgoAVS.deploy();

  await contract.waitForDeployment();
  console.log(
    `✅ Contract deployed at address: ${await contract.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
