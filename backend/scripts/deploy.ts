/* eslint-disable no-undef */
import { ethers } from "hardhat";

// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

const tokens = (n) => {
  // eslint-disable-next-line no-undef
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
  // Setup accounts
  const [deployer, participant] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy Entry
  const Entry = await ethers.getContractFactory('Entry');
  const entry = await Entry.deploy(participant.address); // pass the value of _cost here
  await entry.deployed();

  console.log(`Deployed Entry Contract at: ${entry.address}`);

  // Deploy PoolMaster
  const PoolMaster = await ethers.getContractFactory('PoolMaster');
  const poolMaster = await PoolMaster.deploy("PoolMaster", "PM", entry.address); // Pass the initialMinter address
  await poolMaster.deployed();
  console.log(`Deployed PoolMaster Contract at: ${poolMaster.address}`);

  // Deploy PoolRewardManager
  const PoolRewardManager = await ethers.getContractFactory('PoolRewardManager');
  const poolRewardManager = await PoolRewardManager.deploy(deployer.address); // Pass the initialMinter address
  await poolRewardManager.deployed();
  console.log(`Deployed PoolRewardManager Contract at: ${poolRewardManager.address}`);


} // This is the corrected location of the closing curly brace

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});