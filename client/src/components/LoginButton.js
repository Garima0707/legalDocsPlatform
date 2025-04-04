// LoginButton.js
import React from 'react';
import axios from 'axios'; 
import { useAuth0 } from '@auth0/auth0-react';

function LoginButton() {
  const { loginWithRedirect, logout, user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithRedirect();
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  const fetchToken = async () => {
    if (isAuthenticated) {
      try {
        // Get the access token from Auth0
        const token = await getAccessTokenSilently();
        if (!token) {
          console.error('No token found!');
          return;
        }

        // Send the token with the document creation request
        const response = await axios.post(
          'http://localhost:5000/api/documents/create',  // Replace with your API endpoint
          { title: 'My Document', description: 'Document description', type: 'pdf' },
          {
            headers: {
              Authorization: `Bearer ${token}`  // Attach token in the Authorization header
            }
          }
        );
        console.log('Document created:', response.data);
      } catch (error) {
        console.error('Error fetching token or making request:', error);
      }
    }
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={handleLogin}>Login</button>
      ) : (
        <div>
          <button onClick={fetchToken}>Create Document</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default LoginButton;
