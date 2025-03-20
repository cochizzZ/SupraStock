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

  const updateUser = async (updatedData) => {
    try {
        const response = await fetch('http://localhost:4000/updateProfile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('auth-token'),
            },
            body: JSON.stringify(updatedData),
        });

        const data = await response.json();
        if (data.success) {
            setUser(data.user); // Actualizar el estado del usuario
            alert('Perfil actualizado correctamente');
        } else {
            alert('Error al actualizar el perfil');
        }
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        alert('Error al actualizar el perfil');
    }
};

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;