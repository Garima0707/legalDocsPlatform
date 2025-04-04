import { ethers } from 'ethers';
import LegalDocs from './LegalDocs.json';

const saveDocumentToBlockchain = async (title, content, type) => {
    const contractAddress = "0x7ED923dd3aAD308aEAA719f48f869DdE8B81D59a";
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, LegalDocs.abi, signer);

    try {
        const tx = await contract.createDocument(title, content, type);
        await tx.wait();
        alert("Document successfully added to the blockchain!");
    } catch (error) {
        console.error('Blockchain error:', error);
        alert("Error saving document to blockchain.");
    }
};

export default saveDocumentToBlockchain;

