// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentSigner {

    struct Document {
        bytes32 documentId;
        address creator;
        string title;
        bytes32 contentHash;
        address[] signers;
        mapping(address => bool) isSigner; // For efficient signer check
    }

    mapping(bytes32 => Document) private documents;

    event DocumentSaved(bytes32 indexed documentId, address indexed creator, string title);
    event DocumentSigned(bytes32 indexed documentId, address indexed signer);

    modifier onlyCreator(bytes32 documentId) {
        require(documents[documentId].creator == msg.sender, "Only the creator can perform this action");
        _;
    }

    function saveDocument(bytes32 documentId, string memory title, bytes32 contentHash) public {
        require(documents[documentId].creator == address(0), "Document already exists");

        Document storage newDocument = documents[documentId];
        newDocument.documentId = documentId;
        newDocument.creator = msg.sender;
        newDocument.title = title;
        newDocument.contentHash = contentHash;

        emit DocumentSaved(documentId, msg.sender, title);
    }

    function signDocument(bytes32 documentId) public {
        Document storage doc = documents[documentId];
        require(doc.creator != address(0), "Document does not exist");
        require(!doc.isSigner[msg.sender], "Already signed");

        doc.signers.push(msg.sender);
        doc.isSigner[msg.sender] = true;

        emit DocumentSigned(documentId, msg.sender);
    }

    function getSigners(bytes32 documentId) public view returns (address[] memory) {
        require(documents[documentId].creator != address(0), "Document does not exist");
        return documents[documentId].signers;
    }
}
