import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import SalesModal from './SalesModal';
import UsersModal from './UsersModal';
import { jsPDF } from 'jspdf';

const Dashboard = () => {
  const [statistics, setStatistics] = useState({});
  const [users, setUsers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);

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

        // Fetch product details for each sale
        const salesWithProductDetails = await Promise.all(salesData.map(async (sale) => {
          const productsWithNames = await Promise.all(sale.products.map(async (product) => {
            const productResponse = await fetch(`http://localhost:4000/api/products/${product.product_id}`);
            const productData = await productResponse.json();
            return {
              ...product,
              product_name: productData.name,
            };
          }));
          return {
            ...sale,
            products: productsWithNames,
          };
        }));

        setSales(salesWithProductDetails);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generatePDF = (section) => {
    const doc = new jsPDF();
    let y = 10;

    if (section === 'statistics') {
      doc.text('Estadísticas', 10, y);
      y += 10;
      doc.text(`Total de Productos: ${statistics.totalProducts}`, 10, y);
      y += 10;
      doc.text(`Total de Usuarios: ${statistics.totalUsers}`, 10, y);
      y += 10;
      doc.text(`Total de Órdenes: ${statistics.totalOrders}`, 10, y);
      y += 10;
      doc.text(`Total de Ventas: $${statistics.totalSales}`, 10, y);
    } else if (section === 'users') {
      doc.text('Usuarios', 10, y);
      y += 10;
      users.forEach(user => {
        doc.text(`Nombre: ${user.name}`, 10, y);
        y += 10;
        doc.text(`Email: ${user.email}`, 10, y);
        y += 10;
        doc.text(`Fecha: ${new Date(user.date).toLocaleDateString()}`, 10, y);
        y += 10;
        y += 10; // Agregar espacio entre usuarios
      });
    } else if (section === 'sales') {
      doc.text('Última Venta', 10, y);
      y += 10;
      if (sales.length > 0) {
        const latestSale = sales[sales.length - 1];
        latestSale.products.forEach(product => {
          doc.text(`Producto: ${product.product_name}`, 10, y);
          y += 10;
          doc.text(`Total a Pagar: $${product.price * product.quantity}`, 10, y);
          y += 10;
          doc.text(`Fecha: ${new Date(latestSale.date).toLocaleDateString()}`, 10, y);
          y += 10;
          y += 10; // Agregar espacio entre productos
        });
      } else {
        doc.text('No hay ventas disponibles', 10, y);
      }
    }

    doc.save(`${section}.pdf`);
  };

  if (loading) {
    return <div className="dashboard">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard">{error}</div>;
  }

  const latestSale = sales[sales.length - 1];
  const latestUsers = users.slice(-2);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-content">
        <div className="dashboard-item">
          <h2>Estadísticas</h2>
          <div className="statistics-item">
            <i className="fas fa-box"></i>
            <p>Total de Productos Disponibles: {statistics.totalProducts}</p>
          </div>
          <div className="statistics-item">
            <i className="fas fa-users"></i>
            <p>Total de Usuarios: {statistics.totalUsers}</p>
          </div>
          <div className="statistics-item">
            <i className="fas fa-shopping-cart"></i>
            <p>Total de Órdenes: {statistics.totalOrders}</p>
          </div>
          <div className="statistics-item">
            <i className="fas fa-dollar-sign"></i>
            <p>Total de Ventas: ${statistics.totalSales}</p>
          </div>
          <div className="button-container">
            <button onClick={() => generatePDF('statistics')}>Imprimir</button>
          </div>
        </div>
        <div className="dashboard-item">
          <h2>Usuarios</h2>
          <ul>
            {latestUsers.map(user => (
              <li key={user._id}>
                <p><strong>Nombre:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Fecha:</strong> {new Date(user.date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
          <div className="button-container">
            <button onClick={() => setShowUsersModal(true)}>Ver más</button>
            <button onClick={() => generatePDF('users')}>Imprimir</button>
          </div>
        </div>
        <div className="dashboard-item">
          <h2>Última Venta</h2>
          {latestSale ? (
            <ul>
              {latestSale.products.map(product => (
                <li key={product.product_id}>
                  <p><strong>Producto:</strong> {product.product_name}</p>
                  <p><strong>Total a Pagar:</strong> ${product.price * product.quantity}</p>
                  <p><strong>Fecha:</strong> {new Date(latestSale.date).toLocaleDateString()}</p>
                </li>
              ))}
              <div className="button-container">
                <button onClick={() => setShowSalesModal(true)}>Ver más</button>
                <button onClick={() => generatePDF('sales')}>Imprimir</button>
              </div>
            </ul>
          ) : (
            <p>No hay ventas disponibles</p>
          )}
        </div>
      </div>
      {showSalesModal && (
        <SalesModal sales={sales} onClose={() => setShowSalesModal(false)} />
      )}
      {showUsersModal && (
        <UsersModal users={users} onClose={() => setShowUsersModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;