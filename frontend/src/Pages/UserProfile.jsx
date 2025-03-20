import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import './CSS/UserProfile.css';

const UserProfile = () => {
  const { user, updateUser } = useContext(UserContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    postal_code: user?.postal_code || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
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
        {/* Sección de Datos del Usuario */}
        <div className="user-info-section">
          <h2>Datos del Usuario</h2>
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
        </div>

        {/* Sección de Dirección */}
        <div className="address-section">
          <h2>Datos de Envio</h2>
          <label>
            Dirección de Envío:
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </label>
          <label>
            Municipio:
            <select name="city" value={formData.city} onChange={handleChange}>
              <option value="">Seleccione un municipio</option>
              <option value="Medellín">Medellín</option>
              <option value="Envigado">Envigado</option>
              <option value="Itagüí">Itagüí</option>
              <option value="Bello">Bello</option>
              <option value="Sabaneta">Sabaneta</option>
              <option value="La Estrella">La Estrella</option>
              <option value="Caldas">Caldas</option>
            </select>
          </label>
          <label>
            Código Postal:
            <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} />
          </label>
        </div>

        <button type="submit">Actualizar Perfil</button>
      </form>
    </div>
  );
};

export default UserProfile;