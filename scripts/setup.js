import hre from "hardhat";

async function main() {
  const contractAddress = "0x26F8dF71807cA65352bfC1BEae1863cBFb8f5C9e";
  const certChain = await hre.ethers.getContractAt("CertChain", contractAddress);

  console.log("Setting up Institution data...");

  // Register ABC Institute with dummy password hash
  const passwordHash = hre.ethers.id("123456");
  
  // Register (might fail if already registered, which is fine)
  try {
      const tx1 = await certChain.registerInstitutionData("ABC Institute", passwordHash);
      await tx1.wait();
      console.log("Registered ABC Institute");
  } catch (e) {
      console.log("ABC Institute might already be registered");
  }

  // Add credits
  const tx2 = await certChain.addCredits("ABC Institute", 1000);
  await tx2.wait();
  console.log("Added 1000 credits to ABC Institute!");
}

main().catch(console.error);
