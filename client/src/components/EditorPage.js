import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';    
import { keccak256, toUtf8Bytes } from 'ethers';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import { Settings, Save, UserPlus, Download, Image, X } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CollaborateModal from './GenerateInviteCodes'; // Import the Invite Code Generator
import { FaTimes  } from 'react-icons/fa'; // Icon for the tool button
import '../styles/EditDocument.css';


const EditDocument = () => {
    const { documentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [saving, setSaving] = useState(false);
    const [lastEdited, setLastEdited] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showSignModal, setShowSignModal] = useState(false);
    const [showCollaborateModal, setShowCollaborateModal] = useState(false);
    const [initialContent, setInitialContent] = useState('');
    const [role, setRole] = useState('');
    const [content, setContent] = useState('');
      const [wordCount, setWordCount] = useState(0);
      const [charCount, setCharCount] = useState(0);
      const [isLoading, setIsLoading] = useState(true);
      const [isDropdownOpen, setIsDropdownOpen] = useState(false);
      const [isSigned, setIsSigned] = useState(false); // Track document signed status
      const [password, setPassword] = useState(""); // Track password for download
      const [showSignDialog, setShowSignDialog] = useState(false);
       const [loading, setLoading] = useState(false);

    const [document, setDocument] = useState({
        title: "",
        description: "",
        content: "",
        docType: "",
      });

      const rolePermissions = {
        viewer: {
          canEdit: false,
          allowedActions: ['cancel']
        },
        editor: {
          canEdit: true,
          allowedActions: ['save', 'cancel']
        },
        owner: {
          canEdit: true,
          allowedActions: ['save', 'sign', 'collaborate', 'download', 'watermark', 'cancel']
        }
      };
    
      const isActionAllowed = (action) => {
        const userRole = document.role.toLowerCase();
        return rolePermissions[userRole]?.allowedActions.includes(action);
      };
    
      const canUserEdit = () => {
        const userRole = document.role.toLowerCase();
        // Disable editing if the role is 'viewer' or the document is signed
        return !(rolePermissions[userRole]?.canEdit === false || isSigned);
      };
      
      useEffect(() => {
        const stateData = location.state;
        console.log("State data received in EditDocument:", stateData);
    
        if (stateData) {
          // If data is passed through navigation, use it
          setDocument({
            documentId: stateData.documentId,
            title: stateData.title,
            content: stateData.content,
            description: stateData.description,
            role: stateData.role,
            permissions: stateData.permissions,
            docType: stateData.docType,
          });
        } else {
          // If no state data, fetch document from API using documentId
          fetchDocumentById();
        }
      }, [location.state, documentId]); 

      const fetchDocumentById = async () => {
        setLoading(true);
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/documents/${documentId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
      
          if (!response.ok) {
            throw new Error(`Failed to fetch document. Status: ${response.status}`);
          }
      
          const documentData = await response.json();
          setDocument({
            title: documentData.title,
            content: documentData.content,
            docType: documentData.docType,
          });
        } catch (error) {
          console.error("Error fetching document:", error);
          toast.error("Failed to load document.");
        } finally {
          setLoading(false);
        }
      };      
    
    useEffect(() => {
        if (location?.state) {
          const { title, description, type, role, content } = location.state;
      
          // Set document details
          setDocument({
            title: title || 'Untitled Document',  // Default values if undefined
            description: description || '',
            type: type || 'General',
            role: role || 'viewer',  // Default role if undefined
            documentId: '',
          });
      
          // Set content
          setContent(content || ''); // Default content
        } else {
          setDocument({
            title: 'Untitled Document', 
            description: '',
            type: 'General',
            role: 'viewer', // Default role if no state passed
            documentId: '',
          });
          setContent('');
        }
        setIsLoading(false);
      }, [location?.state]);
    
      // Handle content change in editor
      const handleEditorChange = (content) => {
        if (!canUserEdit()) return;
    
        setContent(content);
    
        const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
    
        const chars = content.replace(/<[^>]*>/g, '').length;
        setCharCount(chars);
      };
    
      const handleAction = async (action) => {
        if (!isActionAllowed(action)) {
          alert('You do not have permission to perform this action.');
          return;
        }
    
        setIsDropdownOpen(false);
    
        switch (action) {
          case 'save':
            try {
              const result = await saveDocument(document.documentId, content);
              if (result.success) {
                toast.success('Document saved successfully');
              }
            } catch (error) {
              toast.error('Error saving document');
            }
            break;
          case 'sign':
            setShowSignDialog(true);
            break;
          case 'collaborate':
            setShowCollaborateModal(true);
            break;
          case 'download':
            if (!password) {
              const generatedPassword = Math.random().toString(36).slice(-8);
              setPassword(generatedPassword);
              alert(`Your download password: ${generatedPassword}`);
            } else {
              const blob = new Blob([content], { type: 'text/plain' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${document.title || 'document'}.txt`;
              a.click();
            }
            break;
          case 'watermark':
            // Logic to add watermark
            const watermarkContent = `<div class="watermark">Secure Docs</div>${content}`;
            setContent(watermarkContent);
            break;
          case 'cancel':
            if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
              setContent('');
            }
            break;
          default:
            break;
        }
      };
      useEffect(() => {
        if (location.state?.role) {
          setRole(location.state.role);
        } else {
          fetchUserRole();
        }
      }, [location.state]);
    
      const fetchUserRole = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/users/role/${documentId}`
          );
          setRole(response.data.role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          toast.error('Failed to fetch user role.');
        }
      };
    
      
    useEffect(() => {
        const validateAndInitialize = async () => {
            if (!documentId) {
                console.error('Document ID is missing');
                toast.error('Invalid document ID');
                navigate('/');
                return;
            }
    
            try {
                // Log the incoming document ID for debugging
                console.log('Raw document ID:', documentId);
                
                // Strip any whitespace
                const cleanDocId = documentId.trim();
                
                // Validate the hex string (64 chars, hex characters only)
                if (cleanDocId.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(cleanDocId)) {
                    console.error(`Invalid document ID format: ${cleanDocId}`);
                    throw new Error('Document ID must be a 64-character hexadecimal string');
                }
    
                // Use the document ID as-is (formatted correctly)
                const formattedDocId = cleanDocId.toLowerCase(); // Ensure lowercase for consistency
                console.log('Final formatted document ID:', formattedDocId);
    
                // Fetch document data
                try {
                    if (location.state) {
                        const { title, description, type, content } = location.state;
                        setTitle(title || '');
                        setDescription(description || '');
                        setType(type || '');
                        setContent(content || '');
                        setInitialContent(content || '');
                        console.log('Loaded document from state:', title);
                    } else {
                        console.log('Fetching document from API...');
                        const response = await axios.get(`http://localhost:5000/api/documents/getDocumentById/${formattedDocId}`);
                        console.log('API response:', response.data);
                        
                        const { title, description, type, content } = response.data;
                        setTitle(title || 'Untitled');
                        setDescription(description || '');
                        setType(type || '');
                        setContent(content || '');
                        setInitialContent(content || '');
                        console.log('Document fetched successfully');
                    }
                } catch (fetchError) {
                    console.error('Error fetching document data:', fetchError);
                    toast.error('Failed to load document data');
                    throw new Error('Failed to load document data');
                }
            } catch (error) {
                console.error('Validation/initialization error:', error);
                toast.error(error.message || 'Error loading document');
                // Only navigate away for specific errors
                if (error.message.includes('Invalid document ID')) {
                    navigate('/');
                }
            }
        };
    
        validateAndInitialize();
    }, [documentId, location.state, navigate]);

    useEffect(() => {
        setWordCount(content.split(/\s+/).filter((word) => word).length);
        setCharCount(content.length);
        setLastEdited(new Date().toLocaleString());
    }, [content]);
    const handleSign = async () => {
        if (!documentId || !role === 'owner') {
            toast.error('Insufficient permissions to sign document');
            return;
        }
        setShowSignModal(true);
    };
    const openCollaborateModal = () => {
        setShowCollaborateModal(true);
    };
  
    const saveDocument = async (documentId, content, status = 'saved') => {
        try {
          setSaving(true);
          // Send the raw content to the backend
          const response = await axios.post('http://localhost:5000/api/documents/updateDocument', {
            documentId,
            content, // Send raw content
            status,
          });
      
          if (response.status === 200) {
            toast.success('Document saved successfully');
            console.error('documentsaved successfully:', response.data);
            setInitialContent(content); // Update local state with saved content
          } else {
            toast.error(response.data.message || 'Failed to save the document');
          }
        } catch (error) {
          console.error('Error saving document:', error);
          toast.error('Failed to save the document');
        } finally {
          setSaving(false);
        }
      };
      
    const confirmSign = async () => {
        try {
            setLoading(true); 
            if (!documentId) {
                throw new Error('Document ID is missing');
            }
    
            // Format document ID for blockchain
            let formattedDocumentId = documentId;
    
            // Strip the 0x prefix if it exists
            let hexString = formattedDocumentId.startsWith('0x') 
                ? formattedDocumentId.slice(2)  // Remove the 0x prefix
                : formattedDocumentId;
    
            // Update the validation for 128 characters (64 bytes)
            if (hexString.length !== 64) {
                throw new Error("Invalid Document ID format. It should be exactly 64 characters long.");
            }
    
            // Ensure the document ID is in bytes32 format (64 bytes = 128 hex chars)
            formattedDocumentId = `0x${hexString.toLowerCase()}`;
    
            // Continue with blockchain interactions as before
            const contentHash = keccak256(toUtf8Bytes(content));
            const provider = new JsonRpcProvider('http://127.0.0.1:7545');
            const privateKey = process.env.REACT_APP_PRIVATE_KEY;
            if (!privateKey) {
                throw new Error("Private key is missing. Check your environment variables.");
            }
    
            const signer = new Wallet(privateKey, provider);
            const documentSigner = new Contract(
                "0xAa7b5Df5b6231077844699794F678fcB3b49de7C",  // Replace with actual contract address
                [
                    "function saveDocument(bytes32 documentId, string memory title, bytes32 contentHash) public",
                    "function signDocument(bytes32 documentId) public",
                ],
                signer
            );
    
            // Save document to blockchain
            const saveTx = await documentSigner.saveDocument(formattedDocumentId, title, contentHash);
            const saveReceipt = await saveTx.wait();
    
            // Sign the document
            const signTx = await documentSigner.signDocument(formattedDocumentId);
            const signReceipt = await signTx.wait();
            toast.success('Document signed successfully!');
            console.log("Save receipt:", saveReceipt);
            console.log("Sign receipt:", signReceipt);
    
        } catch (error) {
            console.error("Error during signing process:", error);
            toast.error({
                title: 'Error',
                description: `Failed to sign document: ${error.message || 'Unknown error occurred'}`
            });
        } finally {
            setLoading(false);
        }
    }; 
    const handleCancelClick = () => setShowModal(true); // Open the popup
    const closePopup = () => setShowModal(false); // Close the popup
    const closeSignPopup = () => setShowModal(false); // Close the popup
    const handleSaveAndExit = async () => {
        await saveDocument('exit');
        closePopup();
    };
    const handleExitAnyways = () => {
        navigate('/'); // Navigate without saving
    };
    
    const dropdownItems = [
        { icon: <Save className="h-4 w-4" />, label: 'Save', action: 'save' },
        { icon: <UserPlus className="h-4 w-4" />, label: 'Sign', action: 'sign' },
        { icon: <UserPlus className="h-4 w-4" />, label: 'Collaborate', action: 'collaborate' },
        { icon: <Download className="h-4 w-4" />, label: 'Download', action: 'download' },
        { icon: <Image className="h-4 w-4" />, label: 'Watermark', action: 'watermark' },
        { icon: <X className="h-4 w-4" />, label: 'Cancel', action: 'cancel' }
      ];

    return (
        <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <ToastContainer />
        <h1 className="text-2xl font-bold mb-2">{document.title}</h1>
        <p className="text-gray-600 mb-2">{document.description}</p>
        <div className="flex gap-4">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Type: {document.type}
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            Role: {document.role}
          </span>
        </div>
      </div>

      <div className="bg-gray-50 p-2 rounded mb-4">
        <div className="dropdown-container relative inline-block">
          <button
            className="p-2 hover:bg-gray-200 rounded"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Settings className="h-5 w-5" />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
              {dropdownItems.map((item, index) => {
                const isAllowed = isActionAllowed(item.action);
                return (
                  <button
                    key={index}
                    className={`w-full px-4 py-2 text-left flex items-center gap-2 
                      ${isAllowed ? 'hover:bg-gray-100' : 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => handleAction(item.action)}
                    disabled={!isAllowed}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Editor
        apiKey='594yozp4izs93cackgh5jb9255yzd0f3zn2yig7yrce68cxi'
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'pagebreak', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | pagebreak | help',
          readonly: !canUserEdit()
        }}
        onEditorChange={handleEditorChange}
        value={content}
        disabled={!canUserEdit()}
      />

      <div className="mt-4 text-gray-600 flex gap-4">
        <span>Words: {wordCount}</span>
        <span>Characters: {charCount}</span>
      </div>
    
            {/* Collaborate Modal */}
            {showCollaborateModal && (
                <CollaborateModal
                    documentId={documentId}
                    closeModal={() => setShowCollaborateModal(false)}
                />
            )}
    
    {/* Confirmation Popup */}
    {showModal && (
                <div className="popup-cancel">
                    <div className="popup-content">
                        <button className="close-popup" onClick={closePopup}>
                            <FaTimes />
                        </button>
                        <h3>Are you sure?</h3>
                        <p>You have unsaved changes. What would you like to do?</p>
                        <div className="popup-actions">
                            <button onClick={handleSaveAndExit}>Save and Exit</button>
                            <button onClick={handleExitAnyways}>Exit Anyways</button>
                            <button onClick={closePopup}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Save/Sign Confirmation */}
            {showSignModal && (
                <div className="confirmation-section">
                    <div className="popup-sign">
                    <button className="close-popup" onClick={closeSignPopup}>
                            <FaTimes />
                        </button>
                    <h3>Once signed, you cannot edit the document. Proceed?</h3>
                    <button onClick={confirmSign} disabled={loading}>
                        {loading ? 'Processing...' : 'Save and Sign'}
                    </button>
                    <button onClick={() => setShowSignModal(false)} disabled={loading}>
                        Cancel
                    </button>
                    {loading && <p>Processing blockchain transaction...</p>}
                </div>
                </div>
            )}
        </div>
    );
    
};
export default EditDocument;
