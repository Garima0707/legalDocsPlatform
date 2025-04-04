import React, { useState } from "react";
import GenerateInviteCodes from "./GenerateInviteCodes";

const ParentComponent = () => {
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const documentId = "example-document-id"; // Replace with actual document ID

  const handleCodesGenerated = (codes) => {
    setGeneratedCodes(codes);
  };

  return (
    <div>
      <GenerateInviteCodes documentId={documentId} onCodesGenerated={handleCodesGenerated} />
      {generatedCodes.length > 0 && (
        <ul>
          {generatedCodes.map((code, index) => (
            <li key={index}>
              Email: {code.email}, Code: {code.inviteCode}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ParentComponent;
