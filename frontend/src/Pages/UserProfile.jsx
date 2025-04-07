import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../Context/UserContext';
import Swal from 'sweetalert2'; // Importar SweetAlert2
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await updateUser(formData); // Llamar a la función para actualizar el perfil
        if (response.success) {
            Swal.fire({
                title: '¡Éxito!',
                text: 'Tu perfil ha sido actualizado correctamente.',
                icon: 'success',
                confirmButtonText: 'OK',
            });
        }
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al actualizar tu perfil.',
            icon: 'error',
            confirmButtonText: 'Cerrar',
        });
    }
    return false; // Evita cualquier comportamiento adicional del navegador
};

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="user-profile">
      <h1>Perfil de Usuario</h1>
      <form onSubmit={handleSubmit}>
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

        <div className="address-section">
          <h2>Dirección</h2>
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