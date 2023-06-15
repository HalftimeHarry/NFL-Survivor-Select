const { expect } = require("chai");

describe("Entry contract", function() {
  let Entry;
  let participant;
  let poolMaster;
  let entry;
  let owner, participants;

  beforeEach(async () => {
    // Setup accounts
    [owner, ...participants] = await ethers.getSigners();

    // Deploy contracts
    Entry = await ethers.getContractFactory("Entry");
    entry = await Entry.deploy({ gasLimit: 9500000 });
    console.log('Entry contract deployed at:', entry.address);

    const PoolMaster = await ethers.getContractFactory("PoolMaster");
    poolMaster = await PoolMaster.deploy("PoolMaster", "PM", entry.address, { gasLimit: 9500000 });
    console.log('PoolMaster contract deployed at:', poolMaster.address);

    const poolMasterName = await poolMaster.name();
    console.log('PoolMaster name:', poolMasterName);
  });

  describe("Deployment", function() {
   it("Should allow the owner of an entry to pick a team", async function () {
  const participant = participants[0];

  // Mint an NFT to participant
  await entry.connect(owner).mint(participant.address, 1);

  // Assert that the NFT with ID 1 exists by checking its owner
  const ownerOfTokenId1 = await entry.ownerOf(1);
  expect(ownerOfTokenId1).to.equal(participant.address);

  // Assume the NFT has token ID 1 and the team ID is also 1
  const teamId = 1;

  try {
    // participant picks a team
    await entry.connect(participant).pickTeam(1, teamId);

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

    // Other deployment related tests
  });

  describe("Transactions", function() {
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

  // Add more describe blocks as necessary for other types of tests
});
