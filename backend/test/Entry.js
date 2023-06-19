const { expect } = require("chai");

describe("Entry contract", function () {
  let Entry;
  let participant;
  let poolMaster;
  let entry;
  let owner, participants;

  beforeEach(async () => {
    // ... other setup code

    // Deploy the PoolMaster contract
    const PoolMaster = await ethers.getContractFactory("PoolMaster");
    poolMaster = await PoolMaster.deploy("PoolMaster", "PM", entry.address, { gasLimit: 9500000 });
    console.log('PoolMaster contract deployed at:', poolMaster.address);

    const POOL_NAME = "Wk 1";
    const POOL_COST = ethers.utils.parseUnits('1', 'ether');
    const POOL_MAX_SPOTS = 100;
    const POOL_DATE = "Sept 7th";
    const POOL_TIME = "9:00PM EST";
    const WEEK_ID = 1;

    const entryDeadline1 = Math.floor(Date.now() / 1000) + 86400; // Set the entry deadline 1 day in the future
    const pickDeadline1 = Math.floor(Date.now() / 1000) + 172800; // Set the pick deadline 2 days in the future

    // List the pool
    await poolMaster.list(
      WEEK_ID,
      POOL_NAME,
      POOL_COST,
      POOL_MAX_SPOTS,
      POOL_DATE,
      POOL_TIME,
      entryDeadline1,
      pickDeadline1
    );

    // Initialize the weeks
    await poolMaster.initializeWeeks();

    // Participant picks the first team for week 1
    const pickTx1 = await entry.connect(participants[0]).pickTeam(1, WEEK_ID, 1);
    await pickTx1.wait();

    // Get the pick deadline for week 1
    const [, , , pickDeadline] = await poolMaster.getWeek(WEEK_ID);
    console.log('Pick deadline for week 1:', pickDeadline.toNumber());

    const poolMasterName = await poolMaster.name();
    console.log('PoolMaster name:', poolMasterName);
  });


  describe("Picks", function () {
    it("Should allow participant to pick a team for at least 2 different weeks", async function () {
      // Mint a token to participant
      await entry.connect(owner).mint(participants[0].address, 1);

      // Define the week and team IDs
      const weekId1 = 1;
      const weekId2 = 2;
      const teamId1 = 1;
      const teamId2 = 2;

      try {
        // Participant picks the first team for week 1
        const pickTx1 = await entry.connect(participants[0]).pickTeam(1, weekId1, teamId1);
        await pickTx1.wait();

        // Get the pick deadline for week 1
        const [, , , pickDeadline1] = await poolMaster.getWeek(weekId1);
        console.log('Pick deadline for week 1:', pickDeadline1.toNumber());

        // Participant picks the second team for week 2
        const pickTx2 = await entry.connect(participants[0]).pickTeam(1, weekId2, teamId2);
        await pickTx2.wait();

        // Get the transaction details
        const blockNumber1 = pickTx1.blockNumber;
        const blockNumber2 = pickTx2.blockNumber;
        const transactionHash1 = pickTx1.hash;
        const transactionHash2 = pickTx2.hash;

        // Get the participant's picked teams
        const [pickedWeekIds, pickedTeamIds] = await entry.getPickedTeams(1);

        // Convert BigNumber values to regular numbers
        const pickedWeekIdsArray = pickedWeekIds.map(id => id.toNumber());
        const pickedTeamIdsArray = pickedTeamIds.map(id => id.toNumber());

        // Verify that both teams have been picked
        expect(pickedWeekIdsArray).to.include(weekId1);
        expect(pickedWeekIdsArray).to.include(weekId2);
        expect(pickedTeamIdsArray).to.include(teamId1);
        expect(pickedTeamIdsArray).to.include(teamId2);

        // Print the transaction details
        console.log("Transaction 1 - Block Number:", blockNumber1);
        console.log("Transaction 1 - Transaction Hash:", transactionHash1);
        console.log("Transaction 2 - Block Number:", blockNumber2);
        console.log("Transaction 2 - Transaction Hash:", transactionHash2);
      } catch (error) {
        console.error('Error message:', error.message);
        console.error('Error stack trace:', error.stack);
        // If there's an error, fail the test
        throw error;
      }
  });
  });
});