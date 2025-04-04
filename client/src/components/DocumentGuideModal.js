// src/components/DocumentGuideModal.js
import React from 'react';
import '../styles/Modal.css';

const DocumentGuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Document Creation Process Guide</h2>
                <p>This section details the steps involved in creating a document...</p>
                {/* Add more detailed content for the guide as needed */}
            </div>
        </div>
    );
};

export default DocumentGuideModal;

