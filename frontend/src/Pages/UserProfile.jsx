import React, { useContext, useState } from 'react';
import { UserContext } from '../Context/UserContext';
import './CSS/UserProfile.css';

const UserProfile = () => {
  const { user, updateUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUser(formData);
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="user-profile">
      <h1>Perfil de Usuario</h1>
      <form onSubmit={handleSubmit}>
        <div className="user-info">
          <label>
            Nombre de Usuario:
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
          </label>
          <label>
            Correo Electrónico:
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </label>
          <label>
            Número de Teléfono:
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </label>
          <label>
            Dirección de Envío:
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </label>
          <button type="submit">Actualizar Perfil</button>
        </div>
      </form>
    </div>
  );
};

export default UserProfile;