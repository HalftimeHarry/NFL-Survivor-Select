const { expect } = require("chai")

const NAME = "PoolMaster"
const SYMBOL = "PM"

const POOL_NAME = "NFL Wk 1"
const POOL_COST = ethers.utils.parseUnits('1', 'ether')
const POOL_MAX_SPOTS = 100
const POOL_DATE = "Sept 8th"
const POOL_TIME = "5:00PM EST"

describe("PoolMaster", () => {
  let poolMaster;
  let deployer, buyer;

  beforeEach(async () => {
    // Setup accounts
    [deployer, buyer] = await ethers.getSigners();

    // Deploy contract
    const PoolMaster = await ethers.getContractFactory("PoolMaster");
    poolMaster = await PoolMaster.deploy(NAME, SYMBOL);

    // Use the poolMaster instance to call the list function
    const transaction = await poolMaster.connect(deployer).list(
      POOL_NAME,
      POOL_COST,
      POOL_MAX_SPOTS,
      POOL_DATE,
      POOL_TIME
    );

    await transaction.wait();
  });

  describe("Deployment", () => {
    it("Sets the name", async () => {
      expect(await poolMaster.name()).to.equal(NAME);
    });

    it("Sets the symbol", async () => {
      expect(await poolMaster.symbol()).to.equal(SYMBOL)
    })

    it("Sets the owner", async () => {
      expect(await poolMaster.owner()).to.equal(deployer.address)
    })
  })

  describe("Pools", () => {
    it('Returns pools attributes', async () => {
      const POOL = await poolMaster.getPools(1)
      expect(POOL.id).to.be.equal(1)
      expect(POOL.name).to.be.equal(POOL_NAME)
      expect(POOL.cost).to.be.equal(POOL_COST)
      expect(POOL.spots).to.be.equal(POOL_MAX_SPOTS)
      expect(POOL.date).to.be.equal(POOL_DATE)
      expect(POOL.time).to.be.equal(POOL_TIME)
    })

    it('Updates pools count', async () => {
      const totalPools = await poolMaster.totalPools()
      expect(totalPools).to.be.equal(1)
    })
  })

  describe("Minting", () => {
    const ID = 1
    const SPOT = 50
    const AMOUNT = ethers.utils.parseUnits('1', 'ether')

    beforeEach(async () => {
      const transaction = await poolMaster.connect(buyer).mint(ID, SPOT, { value: AMOUNT })
      await transaction.wait()
    })

    it('Updates pool count', async () => {
      const POOL = await poolMaster.getPools(1)
      expect(POOL.spots).to.be.equal(POOL_MAX_SPOTS - 1)
    })

    it('Updates buying status', async () => {
      const status = await poolMaster.hasBought(ID, buyer.address)
      expect(status).to.be.equal(true)
    })

    it('Updates SPOT status', async () => {
      const owner = await poolMaster.spotTaken(ID, SPOT)
      expect(owner).to.equal(buyer.address)
    })

    it('Updates overall spotting status', async () => {
      const spots = await poolMaster.getSeatsTaken(ID)
      expect(spots.length).to.equal(1)
      expect(spots[0]).to.equal(SPOT)
    })

    it('Updates the contract balance', async () => {
      const balance = await ethers.provider.getBalance(poolMaster.address)
      expect(balance).to.be.equal(AMOUNT)
    })
  })

  describe("Withdrawing", () => {
    const ID = 1
    const SPOT = 50
    const AMOUNT = ethers.utils.parseUnits("1", 'ether')
    let balanceBefore

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await poolMaster.connect(buyer).mint(ID, SPOT, { value: AMOUNT })
      await transaction.wait()

      transaction = await poolMaster.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const balance = await ethers.provider.getBalance(poolMaster.address)
      expect(balance).to.equal(0)
    })
  })
})