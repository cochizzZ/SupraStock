import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <div className="dashboard-item">
          <h2>Estadísticas</h2>
          <p>Contenido de estadísticas...</p>
        </div>
        <div className="dashboard-item">
          <h2>Usuarios</h2>
          <p>Contenido de usuarios...</p>
        </div>
        <div className="dashboard-item">
          <h2>Ventas</h2>
          <p>Contenido de ventas...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;