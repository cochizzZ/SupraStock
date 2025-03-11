import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Eliminar el token del localStorage
    localStorage.removeItem('auth-token');
  }, [navigate]);

  return null;
};

export default Logout;