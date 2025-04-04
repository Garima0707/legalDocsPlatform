import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { FaTimes } from "react-icons/fa"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/CreateDocument.css';

const CreateDocument = ({ onClose }) => {
  const { isAuthenticated, user } = useAuth0(); 
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [isDocumentCreated, setIsDocumentCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentId, setDocumentId] = useState(null); 
  const [userRole, setUserRole] = useState("owner");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log("User info:", user);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    if (!isAuthenticated) {
      setError("User must be logged in to create a document.");
      setIsLoading(false);
      return;
    }
  
    if (!title || !description || !type) {
      setError("All fields are required.");
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/documents/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          type,
          createdBy: user?.email,
          role: userRole,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log("Backend response:", result);
  
      if (result.success) {
        const documentId = result.document.documentId; // Get the 64-character hex string directly
        setDocumentId(documentId); // No need for Buffer conversion
        console.log("Formatted Document ID (CreateDocument):", documentId);
        toast.success("Document created successfully.");
        setIsDocumentCreated(true);
      } else {
        setError(result.error || "Failed to create document.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  
  const handleWriteContent = () => {
    if (isDocumentCreated) {
      navigate(`/editDocument/${documentId}`, { 
        state: { 
          documentId, 
          title, 
          description, 
          type,
          role: userRole 
        },
      });
      console.log("Document ID (CreateDocument):", documentId, title, description, type, userRole);
    } else {
      toast.error("Please create the document first.");
    }
  };
  
  return (
    <div className="popup-container">
      <ToastContainer />
      <div className="popup-content">
        <button className="cclose-button" onClick={onClose}>
          <FaTimes />
        </button>
        <h2>Create a New Document</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter document title"
              required
            />
          </div>
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter document description"
              required
            />
          </div>
          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Select Type"
              required
            >
              <option value="">Select Type</option>
              <option value="land">Land</option>
              <option value="contract">Contract</option>
              <option value="will">Will</option>
            </select>
          </div>
  
          <div className="button-group">
            <button className="submit-button" type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Document"}
            </button>
  
            <button
              className="content-button"
              type="button"
              onClick={handleWriteContent}
              disabled={!isDocumentCreated}
            >
              Write Content
            </button>
          </div>
  
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      </div>
    </div>
  );      
};

export default CreateDocument;
