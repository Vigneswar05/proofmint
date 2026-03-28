import hre from "hardhat";

async function main() {
  const CertChain = await hre.ethers.getContractFactory("CertChain");
  const certChain = await CertChain.deploy();
  await certChain.waitForDeployment();
  console.log("CertChain deployed to:", await certChain.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
