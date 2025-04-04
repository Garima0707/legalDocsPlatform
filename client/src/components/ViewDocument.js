import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ViewDocument = () => {
    const [password, setPassword] = useState('');
  const [documentContent, setDocumentContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const queryParams = new URLSearchParams(window.location.search);
  const docId = queryParams.get('docId');
  const iv = queryParams.get('iv');
  
  const handleViewDocument = async () => {
    if (!password) {
      toast.error('Password is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/documents/viewDocument', {
        docId,
        password,
        iv,
      });

      setDocumentContent(response.data);
      toast.success('Document loaded successfully.');
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error(error.response?.data?.message || 'Failed to load document.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      {documentContent ? (
        <div>
          <h1>{documentContent.title}</h1>
          <p>{documentContent.description}</p>
          <pre>{documentContent.content}</pre>
        </div>
      ) : (
        <div>
          <h2>Enter Password</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <button onClick={handleViewDocument} disabled={loading}>
            {loading ? 'Loading...' : 'View Document'}
          </button>
        </div>
      )}
    </div>
  );
};
  
  export default ViewDocument;
  