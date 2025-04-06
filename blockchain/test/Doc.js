const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DocumentSigner", function () {
  let contract;
  let owner;
  let user1;
  let user2;
  const documentId = ethers.utils.formatBytes32String("doc1");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const DocumentSigner = await ethers.getContractFactory("DocumentSigner");
    contract = await DocumentSigner.deploy();
    await contract.deployed();
  });

  it("should allow the creator to save a document", async function () {
    await contract.saveDocument(documentId, "Document Title", ethers.utils.id("content"));
    const signers = await contract.getSigners(documentId);
    expect(signers.length).to.equal(0);
  });

  it("should allow users to sign a document", async function () {
    await contract.saveDocument(documentId, "Document Title", ethers.utils.id("content"));
    await contract.connect(user1).signDocument(documentId);
    const signers = await contract.getSigners(documentId);
    expect(signers).to.include(user1.address);
  });

  it("should prevent signing a document multiple times", async function () {
    await contract.saveDocument(documentId, "Document Title", ethers.utils.id("content"));
    await contract.connect(user1).signDocument(documentId);
    await expect(contract.connect(user1).signDocument(documentId)).to.be.revertedWith("Already signed");
  });
});

