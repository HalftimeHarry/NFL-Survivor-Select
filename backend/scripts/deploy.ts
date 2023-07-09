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

  // Deploy Base64
  const Base64 = await ethers.getContractFactory('Base64');
  const base64 = await Base64.deploy(); // pass the value of _cost here
  await base64.deployed();

  // Deploy Entry
  const Entry = await ethers.getContractFactory('Entry');
  const entry = await Entry.deploy(participant.address); // pass the value of _cost here
  await entry.deployed();

  console.log(`Deployed Entry Contract at: ${entry.address}`);

  // Deploy Pool
  const Pool = await ethers.getContractFactory('Pool');
  const pool = await Pool.deploy(deployer.address); // pass the value of _cost here
  await pool.deployed();

  console.log(`Deployed Pool Contract at: ${pool.address}`);

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

  // Deploy PoolToken
  const PoolToken = await ethers.getContractFactory('PoolToken');
  const poolToken = await PoolToken.deploy("PoolToken", "PT");
  await poolToken.deployed();
  console.log(`Deployed PoolToken Contract at: ${poolToken.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
