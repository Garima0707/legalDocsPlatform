import React, { useState } from "react";

const VerifyInviteCode = ({ documentId }) => {  // Ensure documentId is passed as prop
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleVerifyCode = async () => {
    try {
      const response = await fetch('/api/verifyInviteCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, email, documentId }),  // Include documentId in body
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Invite code verified successfully! You can collaborate now.");
      } else {
        setMessage("Invalid invite code or email.");
      }
    } catch (error) {
      console.error("Error verifying invite code:", error);
      setMessage("Error verifying invite code.");
    }
  };

  return (
    <div>
      <h2>Verify Invite Code</h2>
      <input 
        type="text" 
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Enter invite code"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
      />
      <button onClick={handleVerifyCode}>Verify</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default VerifyInviteCode;
