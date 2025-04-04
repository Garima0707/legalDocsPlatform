import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "../styles/VerifyInviteCode.css";

const VerifyInviteCode = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [documentData, setDocumentData] = useState(null);

  const handleVerify = async () => {
    if (!inviteCode.trim() || !email.trim()) {
      toast.error("Both email and invite code are required.");
      return;
    }

    setLoading(true);
    try {
      const verifyResponse = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/invitees/verifyInviteCode`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inviteCode, email }),
        }
      );

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.message || "Verification failed.");
      }

      const verifyData = await verifyResponse.json();
      toast.success("Invite code verified successfully!");
      setDocumentData(verifyData); // Save the document details
      setVerified(true);
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = async (documentId, role) => {
    if (!documentId) {
      toast.error("Missing document information.");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/documents/document/${documentId}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Unable to fetch document: ${errorText}`);
      }

      const documentDetails = await response.json();
      navigate(`/editDocument/${documentId}`, { state: { ...documentDetails, role } });
    } catch (error) {
      toast.error("Unable to open document.");
    }
  };

  return isOpen ? (
    <div className="overlay">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="modal">
        <button onClick={onClose} className="close-button">
          &times;
        </button>
        <h3>Verify Invite Code</h3>
        <input
          type="text"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="modal-input"
        />
        <input
          type="text"
          placeholder="Enter invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="modal-input"
        />
        <button 
          className="modal-button" 
          onClick={handleVerify} 
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Invite Code"}
        </button>
        {verified && documentData && (
          <button 
            className="modal-button" 
            onClick={() => handleOpenDocument(documentData.documentId, documentData.role)}
          >
            Open Document
          </button>
        )}
      </div>
    </div>
  ) : null; // Render nothing if isOpen is false
};

export default VerifyInviteCode;
