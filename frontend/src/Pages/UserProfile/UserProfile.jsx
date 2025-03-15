import React from 'react';
import UserOrders from '../../Components/UserOrders/UserOrders';
import './UserProfile.css';

const UserProfile = () => {
  return (
    <div className="user-profile">
      <h1>Perfil del Usuario</h1>
      <UserOrders />
    </div>
  );
};

export default UserProfile;