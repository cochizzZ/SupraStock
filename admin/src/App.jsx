import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Admin from './Pages/Admin/Admin';

const App = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      localStorage.setItem('auth-token', token);
      window.close(); // Close the popup window
      return;
    }

    const authToken = localStorage.getItem('auth-token');
    console.log('authToken:', authToken);
    if (!authToken) {
      window.location.replace('http://localhost:3000/login');
    } else {
      fetch('http://localhost:4000/verifyAdmin', {
        method: 'GET',
        headers: {
          'auth-token': authToken,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (!data.success) {
            window.location.replace('http://localhost:3000/login');
          }
        })
        .catch((error) => {
          console.error('Error verifying admin:', error);
          window.location.replace('http://localhost:3000/login');
        });
    }
  }, [navigate]);

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/*" element={<Admin />} />
      </Routes>
    </div>
  );
};

export default App;