/*import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const InvitePage = () => {
  const navigate = useNavigate();
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [role, setRole] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    const validateInvite = async () => {
      try {
        const response = await fetch(`/api/invite/validate?token=${token}`);
        const data = await response.json();
        if (!data.success) {
          toast.error(data.message);
          return;
        }

        setRole(data.role);
        setRequiresApproval(data.requiresApproval);

        if (data.requiresApproval) {
          toast.info("Waiting for approval.");
        } else if (data.role === "team head") {
          navigate("/assign-roles"); // Team heads go directly
        }
      } catch (error) {
        toast.error("Error validating invite.");
      }
    };

    validateInvite();
  }, [token, navigate]);

  const checkApprovalStatus = async () => {
    try {
      const response = await fetch(`/api/user/attendance-status`, {
        method: "GET",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (data.attendanceStatus === "approved") {
        setIsApproved(true);
        toast.success("Your attendance has been approved!");
      } else {
        toast.info("Approval is still pending.");
      }
    } catch (error) {
      toast.error("Error checking approval status.");
    }
  };

  const redirectToAssignRoles = () => {
    navigate("/assign-roles");
  };

  return (
    <div>
      {requiresApproval ? (
  <div>
    <p>Please wait for approval.</p>
    <button onClick={checkApprovalStatus}>Check Approval Status</button>
    {isApproved && role === "team head" && (
      <button onClick={redirectToAssignRoles}>Go to Assign Roles</button>
    )}
  </div>
) : (
  <p>Redirecting...</p>
)}

    </div>
  );
};

export default InvitePage;
*/