import React, { useEffect, useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [statistics, setStatistics] = useState({});
  const [users, setUsers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await fetch('http://localhost:4000/api/statistics');
        if (!statsResponse.ok) throw new Error('Error fetching statistics');
        const statsData = await statsResponse.json();
        setStatistics(statsData);

        const usersResponse = await fetch('http://localhost:4000/api/users');
        if (!usersResponse.ok) throw new Error('Error fetching users');
        const usersData = await usersResponse.json();
        setUsers(usersData);

        const salesResponse = await fetch('http://localhost:4000/api/sales');
        if (!salesResponse.ok) throw new Error('Error fetching sales');
        const salesData = await salesResponse.json();
        setSales(salesData);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="dashboard">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <div className="dashboard-item">
          <h2>Estadísticas</h2>
          <p>Total de Productos: {statistics.totalProducts}</p>
          <p>Total de Usuarios: {statistics.totalUsers}</p>
          <p>Total de Órdenes: {statistics.totalOrders}</p>
          <p>Total de Ventas: ${statistics.totalSales}</p>
        </div>
        <div className="dashboard-item">
          <h2>Usuarios</h2>
          <ul>
            {users.map(user => (
              <li key={user._id}>{user.name} - {user.email}</li>
            ))}
          </ul>
        </div>
        <div className="dashboard-item">
          <h2>Ventas</h2>
          <ul>
            {sales.map(sale => (
              <li key={sale._id}>Orden ID: {sale._id} - Total: ${sale.total}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;