import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/GenerateInviteCodes.css";
import InviteeListPopup from "./InviteeListPopup";

// Define roles as constants
const ROLES = {
  VIEWER: "viewer",
  EDITOR: "editor",
  OWNER: "owner"
};

const GenerateInviteCodes = ({onCodesGenerated, closeModal }) => {
  const { documentId } = useParams();
  // Changed from emails to invitees to include role
  const [invitees, setInvitees] = useState([
    { email: "", role: ROLES.VIEWER } // Default role is viewer
  ]);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInviteList, setShowInviteList] = useState(false);
  const [inviteList, setInviteList] = useState([]);

  useEffect(() => {
    if (!documentId) {
      toast.error("Document ID is missing.");
    }
  }, [documentId]);

  const handleGenerateInviteCodes = async () => {
    if (!documentId) {
      toast.error("Document ID is missing.");
      return;
    }
  
    if (invitees.length === 0 || invitees.some(({ email }) => !email.trim())) {
      toast.error("Please enter valid email addresses.");
      return;
    }
  
    setIsGenerating(true);
  
    try {
      const response = await fetch(`http://localhost:5000/api/invitees/generateInviteCodes/${documentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invitees: invitees.map(({ email, role }) => ({ email, role }))
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        setGeneratedCodes(data.inviteCodes);
        setInviteList(data.inviteCodes);
        onCodesGenerated(data.inviteCodes);
        toast.success("Invite codes generated successfully!");
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.message}`);
      }
    } catch (error) {
      toast.success("Invite codes generated successfully!");
    } finally {
      setIsGenerating(false);
    }
  };
  

  // Updated to handle both email and role changes
  const handleInviteeChange = (index, field, value) => {
    const updatedInvitees = [...invitees];
    updatedInvitees[index] = { ...updatedInvitees[index], [field]: value };
    setInvitees(updatedInvitees);
  };

  const handleAddInvitee = () => {
    setInvitees([...invitees, { email: "", role: ROLES.VIEWER }]);
  };

  const handleRemoveInvitee = (index) => {
    const updatedInvitees = [...invitees];
    updatedInvitees.splice(index, 1);
    setInvitees(updatedInvitees);
  };

  const copyToClipboard = (code) => {
    navigator.clipboard
      .writeText(code)
      .then(() => toast.success("Invite code copied to clipboard!"))
      .catch(() => toast.error("Failed to copy invite code."));
  };

  const handleInviteListClick = () => {
    setShowInviteList(true);
  };

  return (
    <div className="overlay">
      <div className="modal">
        <ToastContainer position="top-right" autoClose={3000} />
        <button onClick={closeModal} className="closeButton">
          X
        </button>
        <h2>Generate Invite Codes</h2>

        {/* Invitee input section with email and role dropdown */}
        <div className="invitees-container">
          {invitees.map((invitee, index) => (
            <div key={index} className="invitee-row">
              <div className="input-group">
                <input
                  type="email"
                  value={invitee.email}
                  onChange={(e) => handleInviteeChange(index, "email", e.target.value)}
                  placeholder="Enter email address"
                  className="email-input"
                />
                <select
                  value={invitee.role}
                  onChange={(e) => handleInviteeChange(index, "role", e.target.value)}
                  className="role-select"
                >
                  <option value={ROLES.VIEWER}>Viewer</option>
                  <option value={ROLES.EDITOR}>Editor</option>
                  <option value={ROLES.OWNER}>Owner</option>
                </select>
                <button 
                  onClick={() => handleRemoveInvitee(index)}
                  className="remove-button"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button onClick={handleAddInvitee} className="add-button">
            Add Invitee
          </button>
        </div>

        {/* Generate Invite Codes button */}
        <button
          onClick={handleGenerateInviteCodes}
          disabled={isGenerating}
          className="generate-button"
        >
          {isGenerating ? "Generating..." : "Generate Invite Codes"}
        </button>

        {/* Table to display generated codes */}
        {generatedCodes.length > 0 && (
          <div className="codes-table-container">
            <h3>Generated Codes</h3>
            <table className="codes-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Invite Code</th>
                  <th>Expires At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {generatedCodes.map(({ email, role, inviteCode, expiresAt }, index) => (
                  <tr key={index}>
                    <td>{email}</td>
                    <td>{role}</td>
                    <td>{inviteCode}</td>
                    <td>{new Date(expiresAt).toLocaleString()}</td>
                    <td>
                      <button 
                        className="copy-button"
                        onClick={() => copyToClipboard(inviteCode)}
                      >
                        Copy Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Invite List Button */}
        <button onClick={handleInviteListClick} className="invite-list-button">
          View Invite List
        </button>

        {/* Conditionally render the InviteeListPopup */}
        {showInviteList && (
          <InviteeListPopup 
            inviteList={inviteList} 
            closeModal={() => setShowInviteList(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default GenerateInviteCodes;