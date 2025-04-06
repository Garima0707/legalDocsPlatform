// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DocumentSigner {

    struct Document {
        bytes32 documentId;
        address creator;
        string title;
        bytes32 contentHash;
        address[] signers;
    }

    mapping(bytes32 => Document) public documents;

    event DocumentSaved(bytes32 indexed documentId, address indexed creator, string title);
    event DocumentSigned(bytes32 indexed documentId, address indexed signer);

    function saveDocument(bytes32 documentId, string memory title, bytes32 contentHash) public {
        Document storage newDocument = documents[documentId];
        newDocument.documentId = documentId;
        newDocument.creator = msg.sender;
        newDocument.title = title;
        newDocument.contentHash = contentHash;
        emit DocumentSaved(documentId, msg.sender, title);
    }

    function signDocument(bytes32 documentId) public {
        Document storage doc = documents[documentId];
        require(msg.sender != doc.creator, "Creator cannot sign");
        for (uint i = 0; i < doc.signers.length; i++) {
            require(doc.signers[i] != msg.sender, "Already signed");
        }
        doc.signers.push(msg.sender);
        emit DocumentSigned(documentId, msg.sender);
    }

    function getSigners(bytes32 documentId) public view returns (address[] memory) {
        return documents[documentId].signers;
    }
}
