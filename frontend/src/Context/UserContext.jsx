import React, { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user data if logged in
    const fetchUserData = async () => {
      const token = localStorage.getItem('auth-token');
      if (token) {
        const response = await fetch('http://localhost:4000/user', {
          headers: {
            'auth-token': token,
          },
        });
        const data = await response.json();
        setUser(data.user);
      }
    };
    fetchUserData();
  }, []);

  const updateUser = async (updatedUser) => {
    const token = localStorage.getItem('auth-token');
    const response = await fetch('http://localhost:4000/updateProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': token,
      },
      body: JSON.stringify(updatedUser),
    });
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
    }
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;