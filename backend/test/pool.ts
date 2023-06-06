// SPDX-License-Identifier: UNLICENSED
import { expect } from "chai";
import { ethers } from "hardhat";
import { Pool } from "/workspace/NFL-Survivor-Select/backend/typechain-types/contracts/Pool";
import { Entry } from "/workspace/NFL-Survivor-Select/backend/typechain-types/contracts/Entry"; // Import Entry contract

describe("Pool", function () {
  let owner, player;
  let pool: Pool;
  let entry: Entry; // Add Entry contract

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();

    const Entry = await ethers.getContractFactory("Entry"); // Create Entry contract
    entry = await Entry.deploy();
    await entry.deployed();

    const Pool = await ethers.getContractFactory("Pool");
    pool = await Pool.deploy(entry.address); // Deploy Pool with Entry contract address
    await pool.deployed();

    const deadlines = [1659525600, 1660130400]; // deadlines for weeks
    const names = ["Preseason Wk 1", "NFL 2023-2024 Wk 1"]; // names of weeks
    await pool.createPool("MyPool", 2, deadlines, names); // create a new pool

    await entry.mint("tokenURI"); // Mint an Entry NFT
  });

  it("Should have the correct name", async function () {
    const name = await pool.pools(0).name; // Use 0 as the index of the pool
    expect(name).to.equal("MyPool");
  });

  it("Should allow entering the pool for a specific week", async function () {
      const poolId = 0; // Assuming the poolId is 0 for this example
      const weekId = 1;
      const tokenId = 1; // Assuming the tokenId is 1 for this example

      // Make sure the NFT belongs to the player
      await entry.transferFrom(owner.address, player.address, tokenId);

      // Connect to the player and enter the pool
      const playerPool = pool.connect(player);
      await playerPool.enterPool(poolId, weekId, tokenId); // Pass poolId, weekId and tokenId

      const poolEntry = await pool.entries(poolId, 0); // Use 0 as the index of the entry
      expect(poolEntry.weekId).to.equal(weekId);
      expect(poolEntry.owner).to.equal(player.address);
      expect(poolEntry.active).to.be.true;
  });
});
