import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './EditUser.css'; // Importamos el CSS

const EditUser = ({ user, onUpdate }) => {
  const [userDetails, setUserDetails] = useState({
    id: '',
    name: '',
    email: '',
    role: 'user',
    address: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setUserDetails({
        id: user._id || '',
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'user',
        address: user.address || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const updateUser = async () => {
    if (!userDetails.id) {
      Swal.fire('Error', 'El usuario no tiene un ID válido.', 'error');
      return;
    }

    if (!userDetails.name || !userDetails.email) {
      Swal.fire('Error', 'Por favor, completa todos los campos obligatorios.', 'warning');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/users/${userDetails.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: No se pudo actualizar el usuario.`);
      }

      const updatedUser = await response.json();
      console.log('Usuario actualizado:', updatedUser);
      onUpdate(updatedUser);

      // Alerta de éxito con SweetAlert2
      Swal.fire({
        title: '¡Éxito!',
        text: 'Usuario actualizado correctamente',
        icon: 'success',
        confirmButtonText: 'OK',
      });

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      Swal.fire('Error', error.message || 'Error al actualizar el usuario.', 'error');
    }
  };

  const handleCancel = () => {
    setUserDetails({
      id: user._id || '',
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      address: user.address || '',
      phone: user.phone || '',
    });
    onUpdate();
  };

  return (
    <div className="edit-user-container">
      <h2>Editar Usuario</h2>

      <label>Nombre</label>
      <input type="text" name="name" value={userDetails.name} onChange={handleChange} required />

      <label>Email</label>
      <input type="email" name="email" value={userDetails.email} onChange={handleChange} required />

      <label>Rol</label>
      <select name="role" value={userDetails.role} onChange={handleChange}>
        <option value="user">Usuario</option>
        <option value="admin">Administrador</option>
      </select>

      <label>Dirección</label>
      <input type="text" name="address" value={userDetails.address} onChange={handleChange} />

      <label>Teléfono</label>
      <input type="text" name="phone" value={userDetails.phone} onChange={handleChange} />

      <button className="update-btn" onClick={updateUser}>Actualizar</button>
      <button className="cancel-btn" onClick={handleCancel}>Cancelar</button>
    </div>
  );
};

export default EditUser;
