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
  let owner, participants;

  beforeEach(async () => {
    // Setup accounts
    [owner, participants] = await ethers.getSigners();

      // Deploy contract
      const PoolMaster = await ethers.getContractFactory("PoolMaster");
      poolMaster = await PoolMaster.deploy(NAME, SYMBOL, INITIAL_SUPPLY); // assuming your contract constructor takes 3 arguments

      console.log(poolMaster.address); 
    // Add a week
    const addWeekTx = await poolMaster.connect(owner).addWeek(
      WEEK_ID, 
      Math.floor(Date.now() / 1000), // current timestamp
      `Week ${WEEK_ID}`
    );

    await addWeekTx.wait();

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
  });

  describe("Deployment", () => {
    it("Sets the name", async () => {
      expect(await poolMaster.name()).to.equal(NAME);
    });

    // More tests...
  });

  describe("Week Initialization", () => {
    it('Adds a week', async () => {
      // Your assertion for checking if week has been added successfully...
    });

    // More tests...
  });

  describe("Pool Listing", () => {
    it('Lists a pool', async () => {
      // Your assertion for checking if pool is listed successfully...
    });

    // More tests...
  });

  describe("Pool Entry", () => {
    it('Allows entry before deadline', async () => {
      // Your assertion for checking if entry is allowed before deadline...
    });

    it('Prevents entry after deadline', async () => {
      // Your assertion for checking if entry is prevented after deadline...
    });

    // More tests...
  });

  describe("Team Selection", () => {
    it('Allows team selection before deadline', async () => {
      // Your assertion for checking if team selection is allowed before deadline...
    });

    it('Prevents team selection after deadline', async () => {
      // Your assertion for checking if team selection is prevented after deadline...
    });

    // More tests...
  });

  // More test suites...
});
