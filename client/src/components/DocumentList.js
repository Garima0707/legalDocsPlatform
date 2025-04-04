import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/DocumentList.css";
import { FaFolderOpen, FaTrashAlt } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DocumentList = ({ onClose }) => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/documents/getAllDocuments');
        setDocuments(response.data.documents);
      } catch (error) {
        toast.error('Failed to fetch documents.');
        console.error('Error fetching documents:', error);
      }
    };
    fetchDocuments();
  }, []);

  const handleDelete = async (documentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/documents/delete/${documentId}`);
      setDocuments(documents.filter((doc) => doc._id !== documentId));
      toast.success('Document deleted successfully.');
    } catch (error) {
      toast.error('Failed to delete document.');
      console.error('Error deleting document:', error);
    }
  };

  const handleOpen = (documentId) => {
    toast.info(`Opening document with ID: ${documentId}`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Document List</h2>
        <div className="table-container">
          <table className="document-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc._id}>
                  <td>{doc.title}</td>
                  <td>{doc.status}</td>
                  <td>{doc.createdBy}</td>
                  <td>
                    <button
                      className="icon-button open-button"
                      onClick={() => handleOpen(doc._id)}
                      title="Open"
                    >
                      <FaFolderOpen />
                    </button>
                    <button
                      className="icon-button delete-button"
                      onClick={() => handleDelete(doc._id)}
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default DocumentList;
