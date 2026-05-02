const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "MATIC");

  // Deploy main contract
  const VotingContract = await ethers.getContractFactory("VotingContract");
  const voting = await VotingContract.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log("✅ VotingContract deployed at:", address);

  // Save ABI + address for frontend
  const artifact = require("../artifacts/contracts/VotingContract.sol/VotingContract.json");
  const exportData = {
    address,
    abi: artifact.abi,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  // Write to frontend src/contracts/
  const outPath = path.join(__dirname, "../../voteiq-app/src/contracts/VotingContract.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2));
  console.log("📄 ABI saved to voteiq-app/src/contracts/");

  // Verify on Polygonscan (optional)
  if (hre.network.name !== "localhost" && process.env.POLYGONSCAN_KEY) {
    console.log("Verifying on Polygonscan...");
    await hre.run("verify:verify", { address });
  }
}

main().catch(console.error);
