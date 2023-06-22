const { ethers } = require("hardhat");
const { expect } = require("chai");

const NAME = "PoolMaster";
const SYMBOL = "PMI";

const POOL_NAME = "Wk 1";
const POOL_COST = ethers.utils.parseUnits('1', 'ether');
const POOL_MAX_SPOTS = 100;
const POOL_DATE = "Sept 7th";
const POOL_TIME = "9:00PM EST";
const WEEK_ID = 1;

describe("EntryContract", function () {
  let Entry, entry, owner, addr1, addr2;

  beforeEach(async () => {
    Entry = await ethers.getContractFactory("Entry");

    [owner, addr1, addr2] = await ethers.getSigners();

    entry = await Entry.deploy(owner.address);
    await entry.deployed();
  });

  it("Should mint a new token", async function () {
    await entry.mint(addr1.address, "tokenURI1");
    expect(await entry.totalSupply()).to.equal(1);
  });

  it("Should allow owner to pick a team", async function () {
      const tokenId = (await entry.mint(addr1.address, "1")).toString();

      console.log("tokenId:", tokenId);

      const weekId = ethers.BigNumber.from(1);
      const teamId = ethers.BigNumber.from(2);

      console.log("weekId:", weekId);
      console.log("teamId:", teamId);

      await entry.connect(addr1).pickTeam(tokenId, weekId, teamId);

      const [pickedWeekIds, pickedTeamIds] = await entry.getPickedTeams(tokenId);

      console.log("pickedWeekIds:", pickedWeekIds);
      console.log("pickedTeamIds:", pickedTeamIds);

      expect(pickedWeekIds[0].toNumber()).to.equal(weekId.toNumber());
      expect(pickedTeamIds[0].toNumber()).to.equal(teamId.toNumber());
    });
  });

describe("PoolMasterContract", function () {
  let PoolMaster, poolMaster, owner, addr1, addr2;

  beforeEach(async () => {
    PoolMaster = await ethers.getContractFactory("PoolMaster");
    Entry = await ethers.getContractFactory("Entry");

    [owner, addr1, addr2] = await ethers.getSigners();

    entry = await Entry.deploy(owner.address);
    await entry.deployed();

    poolMaster = await PoolMaster.deploy(NAME, SYMBOL, entry.address);
    await poolMaster.deployed();
  });

  it("Should list a new pool", async function () {
    await poolMaster.connect(owner).list(1, "Pool 1", 1, 10, "2023-09-01", "00:00:00", 1670064000, 1670064100);
    const pool = await poolMaster.getPool(1);
    expect(pool.name).to.equal("Pool 1");
    expect(pool.cost).to.equal(1);
  });

  it("Should allow users to enter a pool", async function () {
    await poolMaster.connect(owner).list(1, "Pool 1", 1, 10, "2023-09-01", "00:00:00", 1670064000, 1670064100);
    await poolMaster.connect(addr1).enter(1, { value: ethers.utils.parseEther("1") });
    expect(await poolMaster.getEntriesCount(1)).to.equal(1);
  });
});
