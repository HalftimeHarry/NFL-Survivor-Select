const { expect } = require("chai");

describe("PoolMaster", function() {
  describe("Deployment", function() {
    it("Sets the name", async function() {
      const Entry = await ethers.getContractFactory("Entry");
      const entry = await Entry.deploy({gasLimit: 9500000}); // set a high gas limit
      console.log('Entry contract deployed at:', entry.address);
      
      const PoolMaster = await ethers.getContractFactory("PoolMaster");
      const poolMaster = await PoolMaster.deploy("PoolMaster", "PM", entry.address, {gasLimit: 9500000}); // set a high gas limit
      console.log('PoolMaster contract deployed at:', poolMaster.address);
      
      const poolMasterName = await poolMaster.name();
      console.log('PoolMaster name:', poolMasterName);

      expect(poolMasterName).to.equal("PoolMaster");
    });
  });
});
