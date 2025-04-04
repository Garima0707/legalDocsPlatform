import axios from 'axios';
import { keccak256, toUtf8Bytes } from 'ethers';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import { toast } from 'react-toastify';


export const saveDocument = async (documentId, content, status = 'saved') => {
  try {
    const response = await axios.post('http://localhost:5000/api/documents/updateDocument', {
      documentId,
      content,
      status,
    });

    if (response.status === 200) {
      toast.success('Document saved successfully');
      return { success: true, data: response.data };
    } else {
      throw new Error(response.data.message || 'Failed to save the document');
    }
  } catch (error) {
    console.error('Error saving document:', error);
    toast.error('Failed to save the document');
    throw error;
  }
};

export const signDocument = async (documentId, title, content) => {
  try {
    // Format document ID
    let hexString = documentId.startsWith('0x') ? documentId.slice(2) : documentId;
    
    if (hexString.length !== 64) {
      throw new Error("Invalid Document ID format. It should be exactly 64 characters long.");
    }

    const formattedDocumentId = `0x${hexString.toLowerCase()}`;
    const contentHash = keccak256(toUtf8Bytes(content));
    
    const provider = new JsonRpcProvider('http://127.0.0.1:7545');
    const privateKey = process.env.REACT_APP_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error("Private key is missing. Check your environment variables.");
    }

    const signer = new Wallet(privateKey, provider);
    const documentSigner = new Contract(
      "0xAa7b5Df5b6231077844699794F678fcB3b49de7C",
      [
        "function saveDocument(bytes32 documentId, string memory title, bytes32 contentHash) public",
        "function signDocument(bytes32 documentId) public",
      ],
      signer
    );

    // Save and sign document on blockchain
    const saveTx = await documentSigner.saveDocument(formattedDocumentId, title, contentHash);
    await saveTx.wait();

    const signTx = await documentSigner.signDocument(formattedDocumentId);
    await signTx.wait();

    toast.success('Document signed successfully!');
    return { success: true };
  } catch (error) {
    console.error("Error during signing process:", error);
    toast.error('Failed to sign document: ' + (error.message || 'Unknown error occurred'));
    throw error;
  }
};

export const fetchDocumentById = async (documentId) => {
  try {
    const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/documents/${documentId}`);
    
    if (!response.data) {
      throw new Error('Document not found');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching document:', error);
    toast.error('Failed to load document');
    throw error;
  }
};