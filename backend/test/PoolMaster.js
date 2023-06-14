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

      await entry.deployed();

      const PoolMaster = await ethers.getContractFactory("PoolMaster");
      poolMaster = await PoolMaster.deploy("PoolMaster", "PM", entry.address, {gasLimit: 9500000}); // set a high gas limit
      // wait until the contract is definitely deployed
      await poolMaster.deployed();
      
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
      expect(listedPool.spots).to.equal(POOL_MAX_SPOTS);
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
        
   describe("Team Selection", () => {
    it('Allows team selection before deadline', async () => {
      const poolId = 1; // Assuming the pool with ID 1 exists
      const entryId = 1; // Assuming the participant will own an NFT with token ID 1 after entering the pool
      const selectedTeam = 1; // Assuming you are selecting the first team

      // Enter the pool first to mint an Entry NFT
      try {
        const enterPoolTx = await poolMaster.connect(participants[0]).enter(poolId);
        await enterPoolTx.wait();
      } catch (error) {
        console.error('Error in enterPoolTx:', error);
      }

      // Now, pick a team for the Entry NFT
      try {
        const pickTeamTx = await poolMaster.connect(participants[0]).pickTeam(entryId, selectedTeam);
        await pickTeamTx.wait();
      } catch (error) {
        console.error('Error in pickTeamTx:', error);
      }
    });
   });
   
    it('Prevents team selection after deadline', async () => {
      // Set the current time to be after the deadline
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const poolId = 1; // Assuming you are selecting the first pool
      const deadline = await poolMaster.getPickDeadline(poolId);
      const isAfterDeadline = currentTimestamp > deadline;

      expect(isAfterDeadline).to.equal(false); // Expecting false, as team selection is not allowed after the deadline
    });
   
describe("pickTeam", function() {
  it("Should allow the owner of an entry to pick a team", async function () {
    const participant = participants[0];

    // Mint an NFT to participant
    await entry.connect(owner).mint(participant.address, 1);

    // Assume the NFT has token ID 1 and the team ID is also 1
    const teamId = 1;

    try {
      // participant picks a team
      await entry.connect(participant).pickTeam(1, teamId);
      await entry.getPickedTeams(1);

      let pickedTeams = await entry.getPickedTeams(1);
      pickedTeams = pickedTeams.map(team => team.toNumber()); // Converts each BigNumber to a regular number
      // Verify that the team has been picked
      expect(pickedTeams).to.include(teamId);
  } catch (error) {
  console.error('Error message:', error.message);
  console.error('Error in pickTeamTx:', error);
  // If there's an error, fail the test
  expect.fail("Unexpected error during pickTeam execution");
}
});

  it("Should not allow a non-owner to pick a team", async function() {
    // This is the participant that does not own the entry
    const nonOwner = participants[1];

    // Assume the NFT has token ID 1 and the team ID is also 1
    const entryId = 1;
    const teamId = 1;

    try {
      // Try to have the non-owner pick a team
      await entry.connect(nonOwner).pickTeam(entryId, teamId);

      // If the transaction didn't fail, then fail the test
      expect.fail("Expected an error, but did not get one");
    } catch (error) {
      // Expected an error, so the test passes
    }
  });

  it("Should not allow picking the same team twice", async function () {
    const participant = participants[0];
      const teamId = 1;
        console.log(123);
      // Let the participant pick a team
    let test = await entry.connect(participant).pickTeam(1, teamId);
    console.log(test);

      // Attempt to pick the same team again
      try {
          await entry.connect(participant).pickTeam(1, teamId);
          expect.fail("Expected an error while picking the same team twice");
      } catch (error) {
          // Catch the error
          expect(error.message).to.contain("team has already been picked"); // Adjust the error message according to your contract
      }

      // Verify that only one team has been picked
      const pickedTeams = await entry.getPickedTeams(1);
      expect(pickedTeams.length).to.equal(1);
      expect(pickedTeams[0]).to.equal(teamId);
  });
 });
});