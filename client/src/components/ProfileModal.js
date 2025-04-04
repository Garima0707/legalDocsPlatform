import React from "react";
import "../styles/profileModal.css";

const ProfileModal = ({ user, onClose }) => {
  if (!user) return null; // Return nothing if there's no user data

  return (
    <div className="profileModal-overlay">
      <div className="profileModal-content">
        <button className="close-button" onClick={onClose}> &times;</button>
        <h2>User Profile</h2>
        <p><strong>Name:</strong></p> <p className="name"> {user.name}</p>
        <p><img src={user.picture} alt="Profile" width="100" /></p>
        <p><strong>Nickname:</strong></p> <p className="nickname"> {user.nickname}</p>
        <p><strong>Email:</strong></p> <p className="mail"> {user.email}</p>
      </div>
    </div>
  );
};

export default ProfileModal;
