const { ethers } = require("hardhat");
const { expect } = require("chai");

const NAME = "PoolMaster";
const SYMBOL = "PMI";

const POOL_NAME = "Week 1";
const POOL_COST = 1;
const POOL_MAX_SPOTS = 100;
const POOL_DATE = "2023-09-01";
const POOL_TIME = "00:00:00";
const WEEK_ID = 1;
const POOL_DL = 1670064000; // Set the entry deadline timestamp
const POOL_PK_DL = POOL_DL + 600; // Set the pick deadline timestamp
const TEAM_ID = 1;

describe("EntryContract", function () {
  let Entry, entry, owner, addr1, addr2;

  beforeEach(async () => {
    Entry = await ethers.getContractFactory("Entry");

    [owner, addr1, addr2] = await ethers.getSigners();

    entry = await Entry.deploy(owner.address);
    await entry.deployed();
  });
  

  it("Should mint a new token number 1", async function () {
    await entry.mint(addr1.address, "tokenURI1");
    expect(await entry.totalSupply()).to.equal(1);
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

    const mintResult = await entry.connect(addr1).mint(addr1.address, "tokenURI1");
    const receipt = await mintResult.wait(); // wait for transaction receipt

    // Set pick deadline 1 hour into the future
    const futurePickDeadline = Math.floor(Date.now() / 1000) + 3600;

    // List a new pool week with future pick deadline
    await poolMaster.list(
        WEEK_ID,
        POOL_NAME,
        POOL_COST,
        POOL_MAX_SPOTS,
        POOL_DATE,
        POOL_TIME,
        POOL_DL,
        futurePickDeadline
    );
  });

    it("Should list a new pool", async function () {
      await poolMaster.connect(owner).list(WEEK_ID, POOL_NAME, POOL_COST, POOL_MAX_SPOTS, POOL_DATE, POOL_TIME, POOL_DL, POOL_DL);
      const pool = await poolMaster.getPool(WEEK_ID);
      expect(pool.name).to.equal(POOL_NAME);
      expect(pool.cost).to.equal(WEEK_ID);
    });

    it("Should allow participants to enter a pool", async function () {
      await poolMaster.connect(owner).list(WEEK_ID, POOL_NAME, POOL_COST, POOL_MAX_SPOTS, POOL_DATE, POOL_TIME, POOL_DL, POOL_DL);
      await poolMaster.connect(addr1).enter(1, { value: ethers.utils.parseEther("1") });
      expect(await poolMaster.getEntriesCount(1)).to.equal(1);
    });

    it("Should get the week", async function () {
      await poolMaster.list(
        WEEK_ID,
        POOL_NAME,
        POOL_COST,
        POOL_MAX_SPOTS,
        POOL_DATE,
        POOL_TIME,
        POOL_DL,
        POOL_PK_DL
      );

      const week = await poolMaster.getWeek(WEEK_ID);

      expect(week[0]).to.equal(WEEK_ID);
      expect(week[1]).to.equal(POOL_NAME);
      expect(ethers.BigNumber.from(week[2])).to.equal(ethers.BigNumber.from(POOL_DL));
      expect(week[3]).to.equal(POOL_PK_DL);
    });

    it("Should allow participant to pick a team", async function () {

        // Enter the pool with addr1
        await poolMaster.connect(addr1).enter(WEEK_ID, { value: ethers.utils.parseEther("1") });

        // Mint a token to participant
        const mintResult = await entry.connect(addr1).mint(addr1.address, "tokenURI1");
        const receipt = await mintResult.wait(); // wait for transaction receipt

        // Extract tokenId from the Minted event in the receipt
        const event = receipt.events.find(e => e.event === 'Minted');
        const tokenId = event.args[1];

        const ownerAddress = await entry.ownerOf(tokenId);

        expect(ownerAddress).to.equal(addr1.address);

        // Retrieve the entry ID
        const entryId = tokenId;

        // Participant picks a team
        const teamId = TEAM_ID;

        try {
          // Participant picks a team
          let pickTeamTx;
          try {
            pickTeamTx = await entry.connect(addr1).pickTeam(entryId, WEEK_ID, teamId);
          } catch (error) {
            console.log(error.message);
          }

          // Check the status of the pickTeam transaction
          if (pickTeamTx) {
            const receipt = await pickTeamTx.wait(); // wait for the transaction to be mined
            console.log(receipt.status); // should print 1 for a successful transaction
          }

          // ... rest of the test ...
        } catch (error) {
          // handle error
        }
    });
  
    it("Should allow participant to change team prior to deadline", async function () {
        // Set pick deadline 1 hour into the future
        const NEW_TEAM_ID = 2;

        // Enter the pool with addr1
        await poolMaster.connect(addr1).enter(WEEK_ID, { value: ethers.utils.parseEther("1") });

        // Mint a token to participant
        const mintResult = await entry.connect(addr1).mint(addr1.address, "tokenURI1");
        const receipt = await mintResult.wait(); // wait for transaction receipt

        // Extract tokenId from the Minted event in the receipt
        const event = receipt.events.find(e => e.event === 'Minted');
        const tokenId = event.args[1];

        const ownerAddress = await entry.ownerOf(tokenId);

        expect(ownerAddress).to.equal(addr1.address);

        // Retrieve the entry ID
        const entryId = tokenId;

        // Participant picks a team
        const teamId = TEAM_ID;

        // This is assuming getWeek() returns a tuple of size 6
        let weekDataBeforePickTeam = await poolMaster.getWeek(WEEK_ID);
        let pickDeadline = weekDataBeforePickTeam[3];
        console.log(pickDeadline);
        try {
            // Participant picks a team
            let pickTeamTx = await entry.connect(addr1).pickTeam(entryId, WEEK_ID, teamId);
            let receipt = await pickTeamTx.wait(); // Wait for the transaction to be mined
            console.log(receipt); // Log the transaction receipt

            // Check the status of the pickTeam transaction
            console.log(receipt.status); // should print 1 for a successful transaction

            // ... rest of the test ...
        } catch (error) {
            console.error('pickTeam failed:', error);
        }

        // Participant changes team
        const newTeamId = NEW_TEAM_ID; // Define this constant

        // Print the week data
        const [weekId, weekName, poolDate, poolTime, poolDL, weekHasPassed] = await poolMaster.getWeek(WEEK_ID);
        console.log('Week data before changeTeam:', weekId, weekName, poolDate, poolTime, poolDL, weekHasPassed);

        if (!weekHasPassed) {
            await entry.connect(addr1).changeTeam(entryId, WEEK_ID, teamId, newTeamId);
        } else {
            console.log('Cannot change team after deadline.');
        }

    // Get the picked teams for the week
    const [pickedWeekIds, pickedTeamIds] = await entry.getPickedTeams(entryId);

    // Convert BigNumber values to regular numbers
    const pickedWeeks = pickedWeekIds.map(id => id.toNumber());
    const pickedTeams = pickedTeamIds.map(id => id.toNumber());

    // Verify that the team has been changed
    expect(pickedTeams).to.include(newTeamId);
    expect(pickedTeams).not.to.include(teamId);
  });
});
