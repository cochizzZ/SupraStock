import React from 'react';
import './Admin.css';
import Sidebar from '../../Components/Sidebar/Sidebar';
import { Routes, Route } from 'react-router-dom';
import AddProduct from '../../Components/AddProduct/AddProduct';
import ListProduct from '../../Components/ListProduct/ListProduct';
import Logout from '../../Components/Logout/Logout';
import Dashboard from '../../Components/Dashboard/Dashboard';
import OrderManagement from '../../Components/OrderManagement/OrderManagement'; // Importar OrderManagement

const Admin = () => {
  return (
    <div className='admin'>
      <Sidebar />
      <div className="admin-content">
        <Routes>
          <Route path="/" element={
            <div className="admin-welcome">
              <h1>Bienvenido al Panel de Administrador</h1>
              <p>Gestiona tus productos de manera fácil y eficiente.</p>
              <div className="admin-guide">
                <p> - <strong>Añadir Productos:</strong> Usa la opción "Agregar Producto" para añadir nuevos productos.</p>
                <p> - <strong>Lista de Productos:</strong> Entra en "Lista de Productos" para visualizar o eliminar los productos existentes.</p>
                <p> - <strong>Cerrar Sesión:</strong> Puedes salir en cualquier momento con la opción "Cerrar Sesión".</p>
              </div>
              <p className="admin-note">Usa el menú lateral para navegar entre las secciones.</p>
            </div>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/addproduct" element={<AddProduct />} />
          <Route path="/listproduct" element={<ListProduct />} />
          <Route path="/orders" element={<OrderManagement />} /> {/* Agregar la ruta para OrderManagement */}
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
