import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { keccak256, toUtf8Bytes } from 'ethers';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import { Editor } from '@tinymce/tinymce-react';
import { Settings, Save, UserPlus, Download, Image, X, RefreshCcw } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CollaborateModal from './GenerateInviteCodes'; // Import the Invite Code Generator
import { FaTimes } from 'react-icons/fa'; // Icon for the tool button
import '../styles/EditDocument.css';

const EditDocument = () => {
    const { documentId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('');
    const [content, setContent] = useState('');
    const [isSigned, setIsSigned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastEdited, setLastEdited] = useState('');
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [showSignModal, setShowSignModal] = useState(false);
    const [showCollaborateModal, setShowCollaborateModal] = useState(false);
    const [initialContent, setInitialContent] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState(''); // Store email of the signer
    const [isLoading, setIsLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const isFetching = useRef(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState("");
    const [generatedLink, setGeneratedLink] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [document, setDocument] = useState({

        title: "",
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
                allowedActions: ['save', 'sign', 'collaborate', 'share', 'watermark', 'cancel']
              }
            };
          
            const isActionAllowed = (action) => {
              const userRole = document.role;
              return rolePermissions[userRole]?.allowedActions.includes(action);
            };
          
            const canUserEdit = () => {
              const userRole = document.role;
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
            }, [location.state, documentId])

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
                          if (!documentId) {
                            throw new Error('Document ID is missing');
                          }
                          await saveDocument(documentId, content);
                        } catch (error) {
                          console.error('Error in save action:', error);
                          toast.error('Failed to save document');
                        }
                        break;
                      case 'sign':
                        setShowSignModal(true);
                        if (isSigned) {
                          toast.error('Document is already signed.');
                          return;
                      }
                        break;
                      case 'collaborate':
                        setShowCollaborateModal(true);
                        if (isSigned) {
                          toast.error('Cannot collaborate. Document is already signed.');
                          return;
                      }
                        break;
                      case 'share':
                        setShowPasswordModal(true);
                        break;
                      case 'watermark':
                        addWatermarkToEditor();
                        break;
                      case 'cancel':
                        setShowCancelDialog(true);
                        break;
                      default:
                        break;
                    }
                  };

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
        const fetchedRole = location.state?.role || '';  // First check location.state
        if (fetchedRole) {
            setRole(fetchedRole);
        }
        const fetchedEmail = location.state?.email || '';  // Fetch email from location.state if available
        if (fetchedEmail) {
            setEmail(fetchedEmail);
        }
    }, [location.state]);

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
  
    const saveDocument = async (documentId, content, status = 'saved') => {
        try {
          setSaving(true);
          const contentToSave = typeof content === 'string' ? content : '';
          // Send the raw content to the backend
          const response = await axios.post('http://localhost:5000/api/documents/updateDocument', {
            documentId,
            content: contentToSave, // Send raw content
            status: 'saved',
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
      // Update local state
      setIsSigned(true);
            toast.success('Document signed successfully!');
            console.log("Save receipt:", saveReceipt);
            console.log("Sign receipt:", signReceipt);
    
        } catch (error) {
            console.error("Error during signing process:", error);
            toast.error(`Failed to sign document`);
        } finally {
            setLoading(false);
        }
    }; 

    const fetchDocumentContent = async () => {
      if (isFetching.current) return; // Prevent duplicate fetch requests
      isFetching.current = true;

      try {
          const response = await axios.get('http://localhost:5000/api/documents/getDocument', {
              params: { documentId },
          });

          const { content: newContent = '', lastEdited: newLastEdited } = response.data || {};
          setContent(newContent);
          setLastEdited(newLastEdited);
      } catch (error) {
          console.error('Error fetching document:', error);
      } finally {
          isFetching.current = false;
      }
  };

  // Handle setting password
const handleSetPassword = () => {
  if (!password) {
    toast.error('Please enter a password.');
    return;
  }
  toast.success('Password set successfully.');
};

const handleGenerateLink = async () => {
  if (!password) {
    toast.error('Please set a password first.');
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post('http://localhost:5000/api/documents/shareDocument', {
      documentId,
      password,
    });

    const { shareLink } = response.data;
    setGeneratedLink(shareLink);
    toast.success('Link generated successfully.');
  } catch (error) {
    console.error('Error generating link:', error);
    toast.error('Failed to generate link.');
  } finally {
    setLoading(false);
  }
};

    // Function to add a static watermark to the PDF
    const addWatermarkToEditor = () => {
      const watermarkHTML = `
        <div 
          style="
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 14px;
            color: rgba(150, 150, 150, 0.5);
            pointer-events: none;
            user-select: none;
            transform: rotate(-30deg);
          "
        >
          CONFIDENTIAL
        </div>
      `;
    
      // Append the watermark to the editor content
      const updatedContent = `
        <div style="position: relative;">
          ${watermarkHTML}
          ${content}
        </div>
      `;
      setContent(updatedContent);
      toast.success('Watermark added to document');
    };

    const closeSignPopup = () => setShowModal(false); // Close the popup
    
    const dropdownItems = [
        { icon: <Save className="h-4 w-4" />, label: 'Save', action: 'save' },
        { icon: <UserPlus className="h-4 w-4" />, label: 'Sign', action: 'sign' },
        { icon: <UserPlus className="h-4 w-4" />, label: 'Collaborate', action: 'collaborate' },
        { icon: <Download className="h-4 w-4" />, label: 'Share', action: 'share' },
        { icon: <Image className="h-4 w-4" />, label: 'Watermark', action: 'watermark' },
        { icon: <X className="h-4 w-4" />, label: 'Cancel', action: 'cancel' }
      ];
    
      return (
        <div className="doc-editor-container">
          <div className="doc-editor-header">
            <ToastContainer />
            <h1 className="doc-editor-title">{document.title}</h1>
            <p className="doc-editor-description">{document.description}</p>
            <div className="doc-editor-tags">
              <span className="doc-editor-role">
                Role: {document.role}
              </span>
            </div>
          </div>
    
          <div className="doc-editor-controls">
            <button
              className="doc-editor-refresh-btn"
              onClick={fetchDocumentContent}
              title="Refresh Content"
            >
              <RefreshCcw className="doc-editor-icon" />
            </button>
    
            <div className="doc-editor-settings">
              <button
                className={`doc-editor-settings-btn ${isDropdownOpen ? "rotate" : ""}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Settings className="doc-editor-icon" />
              </button>
              
              {isDropdownOpen && (
                <div className="doc-editor-dropdown">
                  {dropdownItems.map((item, index) => {
                    const isAllowed = isActionAllowed(item.action);
                    return (
                      <button
                        key={index}
                        className={`doc-editor-dropdown-item ${!isAllowed ? "disabled" : ""}`}
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
              toolbar: isSigned ? false : 'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | pagebreak | help',
              readonly: isSigned || !canUserEdit()
            }}
            onEditorChange={handleEditorChange}
            value={content}
            content={content}
            disabled={isSigned || !canUserEdit()}
          />
    
          {/* Modals */}
          {showCollaborateModal && (
            <div className="doc-editor-modal-overlay">
              <div className="doc-editor-modal">
                <CollaborateModal
                  documentId={documentId}
                  closeModal={() => setShowCollaborateModal(false)}
                />
              </div>
            </div>
          )}
    
          {showCancelDialog && (
            <div className="doc-editor-modal-overlay">
              <div className="doc-editor-cancel-modal">
                <button className="doc-editor-close-btn" onClick={() => setShowCancelDialog(false)}>
                  <FaTimes />
                </button>
                <h3 className='heading-cancel'>Are you sure?</h3>
                <p className='subheading-cancel'>Do you really want to cancel? Unsaved changes will be lost.</p>
                <div className="doc-editor-modal-actions">
                  <button
                    className="doc-editor-confirm-btn"
                    onClick={() => {
                      setShowCancelDialog(false);
                      navigate('/');
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className="doc-editor-cancel-btn"
                    onClick={() => setShowCancelDialog(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
    
          {showPasswordModal && (
            <div className="doc-editor-modal-overlay">
              <div className="doc-editor-password-modal">
                <button
                  className="doc-editor-close-btn"
                  onClick={() => setShowPasswordModal(false)}
                >
                  <FaTimes />
                </button>
                <h2 className='heading-share'>Share Document</h2>
                <div className="doc-editor-input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="doc-editor-input-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="doc-editor-modal-actions">
                  <button
                    className="doc-editor-password-btn"
                    onClick={handleSetPassword}
                  >
                    Set Password
                  </button>
                  <button
                    className="doc-editor-generate-btn"
                    onClick={handleGenerateLink}
                  >
                    Generate Link
                  </button>
                </div>
                {generatedLink && (
                  <div className="doc-editor-link-container">
                    <p>Shareable Link:</p>
                    <a
                      href={generatedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {generatedLink}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
    
          {showSignModal && (
            <div className="doc-editor-modal-overlay">
              <div className="doc-editor-sign-modal">
                <button className="doc-editor-close-btn" onClick={closeSignPopup}>
                  <FaTimes />
                </button>
                <h3 className='heading-sign'>Once signed, you cannot edit the document. Proceed?</h3>
                <div className="doc-editor-modal-actions">
                  <button 
                    className="doc-editor-sign-btn"
                    onClick={confirmSign} 
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Save and Sign'}
                  </button>
                  <button 
                    className="doc-editor-cancel-btn"
                    onClick={() => setShowSignModal(false)} 
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
                {loading && <p>Processing blockchain transaction...</p>}
              </div>
            </div>
          )}
        </div>
      );
    };
export default EditDocument;
