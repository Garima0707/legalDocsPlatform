const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  // Get the contract factory for LegalDocs
  const DocumentSigner = await hre.ethers.getContractFactory("DocumentSigner");
  console.log("Deploying DocumentSigner...");

  // Deploy the contract
  const documentSigner = await DocumentSigner.deploy();
  console.log("Transaction sent. Awaiting confirmation...");

  // Wait for the deployment to be mined
  await documentSigner.waitForDeployment(); // This is the new method to wait for deployment in ethers 6.x

  // Log the contract address
  console.log("Transaction confirmed, DocumentSigner deployed to:", documentSigner.target); // Use .target for the address in ethers 6.x
}

// Call the main function and handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error during deployment:", error);
    process.exit(1);
  });
