const { ethers } = require("hardhat");

describe("EntryContract", function () {
  let EntryContract;
  let entryContract;
  let owner, addr1, addr2, addrs;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    EntryContract = await ethers.getContractFactory("EntryContract");
    entryContract = await EntryContract.deploy();
    await entryContract.deployed();
  });

  describe("Minting a token", function () {
    it("Should mint a new token", async function () {
      const tokenId = await entryContract.mint(owner.address, "tokenURI");

      // add your assertions here
    });
  });

  describe("Picking a team", function () {
    let tokenId;
    let teamId = "someTeam"; // adjust according to your implementation

    beforeEach(async function () {
      tokenId = await entryContract.mint(owner.address, "tokenURI");
    });

    it("Should allow owner to pick a team", async function () {
      await entryContract.connect(owner).pickTeam(tokenId, teamId);

      // Add assertion to verify if the team was picked successfully
    });

    it("Should not allow non-owner to pick a team", async function () {
      try {
        await entryContract.connect(addr1).pickTeam(tokenId, teamId);
        assert.fail("Should have thrown an error");
      } catch (err) {
        assert.include(err.message, "revert", "Expected a revert for non-owners");
      }
    });
  });
});
