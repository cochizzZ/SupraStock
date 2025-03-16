import React from 'react';
import './UsersModal.css';

const UsersModal = ({ users, onClose }) => {
  return (
    <div className="users-modal-overlay">
      <div className="users-modal">
        <h2>Todos los Usuarios</h2>
        <ul>
          {users.map(user => (
            <li key={user._id}>
              <p><strong>Nombre:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Fecha:</strong> {new Date(user.date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default UsersModal;