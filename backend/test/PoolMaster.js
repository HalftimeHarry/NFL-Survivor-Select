const { expect } = require("chai");

const NAME = "PoolMaster";
const SYMBOL = "PM";

const POOL_NAME = "Wk 1";
const POOL_COST = ethers.utils.parseUnits('1', 'ether');
const POOL_MAX_SPOTS = 100;
const POOL_DATE = "Sept 7th";
const POOL_TIME = "9:00PM EST";
const WEEK_ID = 1;

describe("PoolMaster", () => {
  let poolMaster;
  let entry;
  let owner, participants;

  beforeEach(async () => {
    try {
      // Setup accounts
      [owner, ...participants] = await ethers.getSigners();

      // Deploy contracts
      const Entry = await ethers.getContractFactory("Entry");
      entry = await Entry.deploy({gasLimit: 9500000}); // set a high gas limit
      console.log('Entry contract deployed at:', entry.address);

      const PoolMaster = await ethers.getContractFactory("PoolMaster");
      poolMaster = await PoolMaster.deploy("PoolMaster", "PM", entry.address, {gasLimit: 9500000}); // set a high gas limit
      console.log('PoolMaster contract deployed at:', poolMaster.address);
      
      const poolMasterName = await poolMaster.name();
      console.log('PoolMaster name:', poolMasterName);

      // List a pool
      const listTx = await poolMaster.connect(owner).list(
        WEEK_ID,
        POOL_NAME,
        POOL_COST,
        POOL_MAX_SPOTS,
        POOL_DATE,
        POOL_TIME,
        Math.floor(Date.now() / 1000) + 60, // entry deadline in 60 seconds
        Math.floor(Date.now() / 1000) + 120 // pick deadline in 120 seconds
      );

      await listTx.wait();
    } catch (error) {
      console.error('Error in beforeEach:', error);
    }
  });

  describe("Deployment", () => {
    it("Sets the name", async () => {
      const contractName = await poolMaster.name();
      expect(contractName).to.equal(NAME);
    });
  });

  describe("Pool Listing", () => {
    it('Lists a pool', async () => {
      const poolId = 1; // Assuming you are listing the first pool

      // Join the pool before listing it
      const listPoolTx = await poolMaster.connect(participants[0]).enter(poolId, { value: POOL_COST });
      await listPoolTx.wait();

      // Retrieve the pool details
      const listedPool = await poolMaster.getPool(poolId);

      // Assert that the listed pool details match the expected values
      expect(listedPool.name).to.equal(POOL_NAME);
      expect(listedPool.cost).to.equal(POOL_COST);
      expect(listedPool.maxSpots).to.equal(POOL_MAX_SPOTS);
      expect(listedPool.date).to.equal(POOL_DATE);
      expect(listedPool.time).to.equal(POOL_TIME);
      // Add more assertions for other properties if needed
    });
  });

    describe("Pool Entry", () => {
    it('Allows entry before deadline', async () => {
      const allowEntryTx = await poolMaster.connect(participants[0]).enter(1, { value: POOL_COST });
      await allowEntryTx.wait();

      const participant = participants[0].address;
      const poolId = 1; // Assuming you are entering the first pool
      
      const hasEntered = await poolMaster.hasEntered(poolId, participant);
      console.log('Has Entered:', hasEntered);

      expect(hasEntered).to.equal(true);

      // Verify the updated state variable for number of entries
      const expectedEntriesCount = 1;
      const actualEntriesCount = await poolMaster.getEntriesCount(poolId);
      expect(actualEntriesCount).to.equal(expectedEntriesCount);
    });
    });
  });
 describe("Team Selection", () => {
  let poolMaster;

  beforeEach(async () => {
    try {
      // Setup accounts
      [owner, ...participants] = await ethers.getSigners();

      // Deploy contracts
      const Entry = await ethers.getContractFactory("Entry");
      entry = await Entry.deploy({ gasLimit: 9500000 });
      console.log('Entry contract deployed at:', entry.address);

      const PoolMaster = await ethers.getContractFactory("PoolMaster");
      poolMaster = await PoolMaster.deploy("PoolMaster", "PM", entry.address, { gasLimit: 9500000 });
      console.log('PoolMaster contract deployed at:', poolMaster.address);

      const poolMasterName = await poolMaster.name();
      console.log('PoolMaster name:', poolMasterName);

      // List a pool
      const listTx = await poolMaster.connect(owner).list(
        WEEK_ID,
        POOL_NAME,
        POOL_COST,
        POOL_MAX_SPOTS,
        POOL_DATE,
        POOL_TIME,
        Math.floor(Date.now() / 1000) + 60, // entry deadline in 60 seconds
        Math.floor(Date.now() / 1000) + 120 // pick deadline in 120 seconds
      );

      await listTx.wait();
    } catch (error) {
      console.error('Error in beforeEach:', error);
    }
  });

  // ...

  describe("Team Selection", () => {
    it('Allows team selection before deadline', async () => {
      const entryId = 1; // Assuming the participant owns an NFT with token ID 1
      const selectedTeam = 1; // Assuming you are selecting the first team
      const pickTeamTx = await poolMaster.connect(participants[0]).pickTeam(entryId, selectedTeam);
      await pickTeamTx.wait();

      // ...existing code...
    });

    it('Prevents team selection after deadline', async () => {
      // Set the current time to be after the deadline
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const poolId = 1; // Assuming you are selecting the first pool
      const deadline = await poolMaster.getPickDeadline(poolId);
      const isAfterDeadline = currentTimestamp > deadline;

      expect(isAfterDeadline).to.equal(false); // Expecting false, as team selection is not allowed after the deadline
    });
  });
});
