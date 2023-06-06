// scripts/deploy.js
async function main() {
  const Pool = await ethers.getContractFactory("Pool");
  const pool = await Pool.deploy();

  await pool.deployed();

  console.log("Pool contract deployed to:", pool.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

