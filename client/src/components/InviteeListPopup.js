import React, { useState, useEffect } from 'react';

const InviteeListPopup = ({ inviteList, documentId, currentUserEmail, onClose }) => {
  const [inviteeData, setInviteeData] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [owners, setOwners] = useState([]);

  useEffect(() => {
    fetchOwners();
    initializeInviteeData();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await fetch(`/api/owners/${documentId}`);
      const data = await response.json();
      if (data.success) {
        setOwners(data.owners);
        setIsOwner(data.owners.includes(currentUserEmail));
      }
    } catch (error) {
      console.error("Error fetching owners:", error);
    }
  };

  const initializeInviteeData = () => {
    setInviteeData(inviteList.map(invitee => ({
      email: invitee.email,
      role: invitee.role || '',
      team: invitee.team || '',
      position: invitee.position || '',
      permission: invitee.permission || ''
    })));
  };

  const handleSaveAssignments = async () => {
    try {
      const response = await fetch(`/api/assign-roles/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignments: inviteeData })
      });

      const data = await response.json();
      if (data.success) {
        alert("Roles assigned successfully!");
        fetchOwners(); // Refresh owners list
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error saving assignments:", error);
      alert("Error saving assignments");
    }
  };

  const handleInputChange = (index, field, value) => {
    setInviteeData(prevData =>
      prevData.map((invitee, i) =>
        i === index ? { ...invitee, [field]: value } : invitee
      )
    );
  };
  
  const handleCloseModal = () => {
    if (onClose) {
      onClose(); // Call the parent-provided onClose function
    }
  };

  return (
    <div className="overlay">
      <div className="popup">
        <h3>Manage Invitees</h3>
        {isOwner ? (
          <>
            <table className="inviteeListTable">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Position</th>
                  <th>Permission</th>
                </tr>
              </thead>
              <tbody>
                {inviteeData.map((invitee, index) => (
                  <tr key={index}>
                    <td>{invitee.email}</td>
                    <td>
                      <select
                        value={invitee.role}
                        onChange={(e) => handleInputChange(index, 'role', e.target.value)}
                      >
                        <option value="">Select Role</option>
                        <option value="Owner">Owner</option>
                        <option value="Team Head">Team Head</option>
                        <option value="Team Lead">Team Lead</option>
                        <option value="Team Member">Team Member</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={invitee.team}
                        onChange={(e) => handleInputChange(index, 'team', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={invitee.position}
                        onChange={(e) => handleInputChange(index, 'position', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        value={invitee.permission}
                        onChange={(e) => handleInputChange(index, 'permission', e.target.value)}
                      >
                        <option value="">Select Permission</option>
                        <option value="Full Access">Full Access</option>
                        <option value="Edit">Edit</option>
                        <option value="Comment">Comment</option>
                        <option value="View Only">View Only</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleSaveAssignments} className="saveButton">
              Save Assignments
            </button>
          </>
        ) : (
          <p>You don't have permission to manage roles.</p>
        )}
        <button onClick={handleCloseModal} className="closeButton">
          Close
        </button>
      </div>
    </div>
  );
};

export default InviteeListPopup;