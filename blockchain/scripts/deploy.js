const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying ChainGive to", hre.network.name);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "BNB");

  // Deploy with 2% platform fee
  const ChainGive = await hre.ethers.getContractFactory("ChainGive");
  const chainGive = await ChainGive.deploy(2);
  await chainGive.waitForDeployment();

  const contractAddress = await chainGive.getAddress();
  console.log("✅ ChainGive deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    platformFee: 2,
  };

  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Copy ABI to frontend and backend
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/ChainGive.sol/ChainGive.json"
  );

  const frontendAbiDir = path.join(__dirname, "../../frontend/src/lib/contracts");
  const backendAbiDir = path.join(__dirname, "../../backend/src/config");

  [frontendAbiDir, backendAbiDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Write ABI + address for frontend
    const frontendConfig = {
      address: contractAddress,
      abi: artifact.abi,
      network: hre.network.name,
      chainId: hre.network.config.chainId,
    };
    fs.writeFileSync(
      path.join(frontendAbiDir, "ChainGive.json"),
      JSON.stringify(frontendConfig, null, 2)
    );

    // Write ABI + address for backend
    fs.writeFileSync(
      path.join(backendAbiDir, "ChainGive.json"),
      JSON.stringify(frontendConfig, null, 2)
    );

    console.log("📄 ABI copied to frontend and backend");
  }

  console.log("\n📋 Deployment Summary:");
  console.log("  Contract:", contractAddress);
  console.log("  Network:", hre.network.name);
  console.log("  Chain ID:", hre.network.config.chainId);
  console.log("\n✨ Done! Update your .env files with the contract address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
