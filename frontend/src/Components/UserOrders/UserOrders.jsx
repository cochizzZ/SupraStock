import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserOrders.css';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/user/orders', {
          headers: {
            'auth-token': localStorage.getItem('auth-token')
          }
        });
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    try {
      await axios.put(`http://localhost:4000/api/user/orders/${orderId}/cancel`, {}, {
        headers: {
          'auth-token': localStorage.getItem('auth-token')
        }
      });
      const response = await axios.get('http://localhost:4000/api/user/orders', {
        headers: {
          'auth-token': localStorage.getItem('auth-token')
        }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error canceling order:', error);
    }
  };

  return (
    <div className="user-orders-container">
      <h2>Historial de Compras</h2>
      <table className="user-orders-table">
        <thead>
          <tr>
            <th>ID de Orden</th>
            <th>Productos</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>
                <ul>
                  {order.products.map(product => (
                    <li key={product.product_id}>
                      {product.product_id} - Cantidad: {product.quantity} - Precio: {product.price}
                    </li>
                  ))}
                </ul>
              </td>
              <td>{order.total}</td>
              <td>{order.status}</td>
              <td>{new Date(order.date).toLocaleString()}</td>
              <td>
                {order.status === 'Pending' && (
                  <button onClick={() => cancelOrder(order._id)}>Cancelar</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserOrders;