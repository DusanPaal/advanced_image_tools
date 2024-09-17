import React, { useEffect, useState } from 'react';
import './App.css';
import Index from './index';

document.cookie = 'auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMDAwMDI0LCJleHBpcmVzIjoiMjAyNC0wOS0wMiJ9.V-6xWYFM8a3nlrdsD2sVDj58_frXu03nnF8e7TqGLuk'
function App() {

  // State to manage token validity
  const [isTokenValid, setIsTokenValid] = useState(null);

  // Function to get cookie by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Function to validate token
  useEffect(() => {

    const validateToken = async () => {

      const auth_url = 'http://localhost:5000/authenticate';
      const token = getCookie('auth_token');

      if (!token) {
        // No token found
        setIsTokenValid(false);
        return;
      }

      try {

        const response = await fetch(auth_url, {
          method: 'POST',
          headers: {
            'authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Ensure response is ok
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }

        if (response.status == 401) {
          // Set state to indicate invalid token
          setIsTokenValid(false);
        } else {
          // Set state to indicate valid token
          setIsTokenValid(true);
        }

      } catch (error) {
        // Handle errors
        console.error('Error validating token:', error);
        setIsTokenValid(false);
      }

    };

    validateToken();

  }, []); // Empty dependency array ensures this runs once on mount

  // Conditionally render based on token validity
  if (isTokenValid === null) {
    // Show loading state while checking
    return <div>Authenticating user...</div>;
  }

  if (isTokenValid === false) {
    // Redirect to login
    window.location.href = 'http://localhost:5000/login';
    // No need to render anything
    return null;
  }

  return (
    // Render the Index component if the token is valid
    <div className="App"><Index /> { }</div>
  );
}

export default App;