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
      // Add your assertion to verify if pool is listed successfully.
      // This will depend on how you are tracking pools in your smart contract
    });

    describe("Pool Entry", () => {
      before(async () => {
        // Call the correct method on the contract
        const joinPoolTx = await poolMaster.connect(participants[0]).enter(1, { value: POOL_COST });

        // Wait for the transaction to be mined
        await joinPoolTx.wait();
      });

    it('Allows entry before deadline', async () => {
      // Verify that the participant has been entered into the pool
      const poolId = 1; // Assuming you are entering the first pool
      const participant = participants[0].address;

      // Verify that the participant has been entered
      const hasEntered = await poolMaster.hasEntered(poolId, participant);
      expect(hasEntered).to.equal(true);

      // Verify the updated state variable for number of entries
      const expectedEntriesCount = 1;
      const actualEntriesCount = await poolMaster.getEntriesCount(poolId);
      expect(actualEntriesCount).to.equal(expectedEntriesCount);
    });
    });
  });
});
