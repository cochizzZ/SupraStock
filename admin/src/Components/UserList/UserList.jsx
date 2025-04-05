import React, { useEffect, useState } from 'react';
import './UserList.css';
import cross_icon from '../../assets/cross_icon.png';
import lapicito from '../../assets/lapicito.svg';
import EditUser from '../EditUser/EditUser';
import Swal from 'sweetalert2';


const UserList = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  // Obtener lista de usuarios
  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users');
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      alert('No se pudieron cargar los usuarios.');
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Eliminar usuario
  const removeUser = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
  
    if (!result.isConfirmed) return;
  
    try {
      const response = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (!response.ok) {
        throw new Error('No se pudo eliminar el usuario');
      }
  
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El usuario ha sido eliminado correctamente.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
  
      console.log(`Usuario con ID ${id} eliminado correctamente`);
  
      // Actualizar lista de usuarios después de eliminar
      fetchUsers();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el usuario.',
        icon: 'error',
      });
    }
  };
  // Abrir el formulario de edición
  const handleEdit = (user) => {
    console.log('Editando usuario:', user);
    if (!user._id) {
      alert('Error: el usuario no tiene un ID válido.');
      return;
    }
    setEditingUser(user);
  };

  // Actualizar la lista de usuarios después de editar
  const handleUpdate = () => {
    setEditingUser(null); // Cierra el formulario de edición
    fetchUsers(); // Refresca la lista de usuarios
  };

  return (
    <div className="user-container">
      {editingUser ? (
        <div className="edit-user-container">
          <button className="back-button" onClick={() => setEditingUser(null)}>⬅ Regresar</button>
          <EditUser user={editingUser} onUpdate={handleUpdate} />
        </div>
      ) : (
        <>
          <h1>Gestión de Usuarios</h1>
          <div className="user-grid">
            {users.length > 0 ? (
              users.map((user) => (
                
                <div className="user-card" key={user._id}>
                  <p><strong>Usuario:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Rol:</strong> {user.role}</p>
                  <p><strong>Estado: </strong> {user.active ? 'Activo' : 'Inactivo'}</p>
                  <div className="user-actions">
                    <button className="edit-btn" onClick={() => handleEdit(user)}>
                      <img src={lapicito} alt="Editar" />
                    </button>
                    <button className="delete-btn" onClick={() => {
                     console.log("Eliminando usuario con ID:", user._id); // 👀 Verifica aquí
                      removeUser(user._id);
                      }}>
                     <img src={cross_icon} alt="Eliminar" />
                      </button>

                  </div>
                </div>
              ))
            ) : (
              <p>No hay usuarios registrados.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserList;
