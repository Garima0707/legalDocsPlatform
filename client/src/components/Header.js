import React, { useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/Header.css";
import VerifyInviteCode from "./VerifyInviteCode";
import DocumentList from "./DocumentList";
import ProfileModal from "./ProfileModal";
import logo from "../styles/logo.jpeg";

const Header = ({ isLoggedIn, username, onLoginClick }) => {
  const { user, isAuthenticated, logout } = useAuth0();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCollabModalOpen, setIsCollabModalOpen] = useState(false);
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const profileIcon = username ? username.charAt(0).toUpperCase() : "";

  const handleCloseCollabModal = useCallback(() => {
    setIsCollabModalOpen(false);
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(prev => !prev);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  return (
    <header>
      <div className="nav">
        <img src={logo} alt="logo" width="40" height="40" />
        <h1>SecureDocs</h1>
        <ul>
          <li><a href="#about">About Us</a></li>
          <li><a href="#products">Products</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#contact">Contact Us</a></li>
          {isLoggedIn ? (
            <li
              className="profile-section"
              onClick={toggleDropdown}
              onMouseLeave={handleMouseLeave}
            >
              <span className="profile-icon">{profileIcon}</span>
              <span className="username">{username}</span>

              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button
                    className="menu-item"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    Profile
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => setIsCollabModalOpen(true)}
                  >
                    Collaborate
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => setIsDocumentOpen(true)}
                  >
                    Documents
                  </button>
                  <button
                    className="menu-item"
                    onClick={() => logout({ returnTo: window.location.origin })}
                  >
                    Logout
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li>
              <button onClick={onLoginClick}>Login</button>
            </li>
          )}
        </ul>
      </div>

      <VerifyInviteCode
        isOpen={isCollabModalOpen}
        onClose={() => setIsCollabModalOpen(false)}
      />

      {isDocumentOpen && (
        <DocumentList 
          onClose={() => setIsDocumentOpen(false)}
        />
      )}

      {isProfileModalOpen && (
        <ProfileModal
          user={user}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;