const { expect } = require("chai");
const POOL_COST = ethers.utils.parseUnits('1', 'ether'); // 1 ether, for example

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
  
  describe("Picks", function() {
  it("Should allow participant to pick at least 2 teams", async function() {
    const participant = participants[0];

    // Mint a token to participant
    await entry.connect(owner).mint(participant.address, 1);

    // Assume the NFT has token ID 1 and the team IDs are 1 and 2
    const teamId1 = 1;
    const teamId2 = 2;

    try {
      // Participant picks the first team
      await entry.connect(participant).pickTeam(1, teamId1);

      // Participant picks the second team
      await entry.connect(participant).pickTeam(1, teamId2);

      let pickedTeams = await entry.getPickedTeams(1);
      console.log(pickedTeams);
      pickedTeams = pickedTeams.map(team => team.toNumber()); // Converts each BigNumber to a regular number

      // Verify that both teams have been picked
      expect(pickedTeams).to.include(teamId1);
      expect(pickedTeams).to.include(teamId2);
    } catch (error) {
      console.error('Error message:', error.message);
      console.error('Error in pickTeamTx:', error);
      // If there's an error, fail the test
      expect.fail("Unexpected error during pickTeam execution");
    }
  });
  });
      describe("Deployment", function() {
        it("Should allow the owner of an entry to pick a team", async function () {
          const participant = participants[0];
          
          // Mint an NFT to participant
          await entry.connect(owner).mint(participant.address, 1);

          // Assert that the NFT with ID 1 exists by checking its owner
          const ownerOfTokenId1 = await entry.ownerOf(1);
          console.log(ownerOfTokenId1);
          expect(ownerOfTokenId1).to.equal(participant.address);
        });
    });
  
  it("Should fail when picking more teams than allowed by the limit", async function() {
    const participant = participants[0];

    // Mint a token to participant
    await entry.connect(owner).mint(participant.address, 1);

    // Set up a list of team IDs that goes beyond the allowed limit
    const teamIds = Array.from({ length: 19 }, (_, i) => i + 1); // Creates an array [1, 2, ..., 19]

    try {
      // Participant attempts to pick all the teams
      for (const teamId of teamIds) {
        console.log(`Attempting to pick team ${teamId}`);
        await entry.connect(participant).pickTeam(1, teamId);
        console.log(`Successfully picked team ${teamId}`);
      }

      // If we've reached this point, no error was thrown, so we fail the test
      expect.fail("Expected an error for picking more teams than allowed, but none was thrown.");  
    } catch (error) {
      // Print out the actual error message
      console.log("Caught error message: ", error.message);
      
      // Expect a specific error message here
      expect(error.message).to.include("This team has already been picked");
    }
  }); 

    it("Successfully picks up to the limit", async function() {
    const participant = participants[0];

    // Mint a token to participant
    await entry.connect(owner).mint(participant.address, 1);

    // Set up a list of team IDs up to the limit for a given pool
    const teamIds = Array.from({ length: 18 }, (_, i) => i + 1); // Creates an array [1, 2, ..., 18]

    // Participant attempts to pick all the teams
    for (const teamId of teamIds) {
      await entry.connect(participant).pickTeam(1, teamId);
    }

    // Check picked teams
    let pickedTeams = await entry.getPickedTeams(1);
    pickedTeams = pickedTeams.map(team => team.toNumber()); // Converts each BigNumber to a regular number

    // Verify that all teams have been picked
    for (const teamId of teamIds) {
      expect(pickedTeams).to.include(teamId);
    }
  });

    describe("Transactions", function() {
      it("Should allow participant to pick a team", async function() {
        const participant = participants[0];

        // Mint a token to participant
        await entry.connect(owner).mint(participant.address, 1);

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

  it("Should allow participant to change a team before the deadline", async function() {
    const participant = participants[0];

    // Mint a token to participant
    await entry.connect(owner).mint(participant.address, 1);

    // Assume the NFT has token ID 1 and the initial team ID is 1
    const initialTeamId = 1;
    // Assume the new team ID is 2
    const newTeamId = 2;

    try {
      // participant picks a team
      await entry.connect(participant).pickTeam(1, initialTeamId);

      // participant changes the team
      await entry.connect(participant).changeTeam(1, initialTeamId, newTeamId);

      let pickedTeams = await entry.getPickedTeams(1);
      pickedTeams = pickedTeams.map(team => team.toNumber()); // Converts each BigNumber to a regular number

      // Verify that the new team has been picked
      expect(pickedTeams).to.include(newTeamId);
      // Verify that the initial team has been removed
      expect(pickedTeams).not.to.include(initialTeamId);
    } catch (error) {
      console.error('Error message:', error.message);
      console.error('Error in changeTeamTx:', error);
      // If there's an error, fail the test
      expect.fail("Unexpected error during changeTeam execution");
    }
  });
  
});
