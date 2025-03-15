import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './OrderManagement.css';
import OrderModal from './OrderModal';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/orders');
        const ordersWithDetails = await Promise.all(response.data.map(async (order) => {
          try {
            const userResponse = await axios.get(`http://localhost:4000/api/users/${order.user_id}`);
            const productsWithNames = await Promise.all(order.products.map(async (product) => {
              try {
                const productResponse = await axios.get(`http://localhost:4000/api/products/${product.product_id}`);
                return {
                  ...product,
                  product_name: productResponse.data.name,
                };
              } catch (productError) {
                console.error(`Error fetching product ${product.product_id}:`, productError);
                return product;
              }
            }));
            return {
              ...order,
              user_name: userResponse.data.name,
              products: productsWithNames,
            };
          } catch (userError) {
            console.error(`Error fetching user ${order.user_id}:`, userError);
            return order;
          }
        }));
        setOrders(ordersWithDetails);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const generateTestData = async () => {
    try {
      await axios.post('http://localhost:4000/api/orders/generate-test-data');
      const response = await axios.get('http://localhost:4000/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error generating test data:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:4000/api/orders/${orderId}`, { status: newStatus });
      const response = await axios.get('http://localhost:4000/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      await axios.delete(`http://localhost:4000/api/orders/${orderId}`);
      const response = await axios.get('http://localhost:4000/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.user_name?.toLowerCase().includes(searchUser.toLowerCase()) &&
    (filterStatus === '' || order.status === filterStatus) &&
    (filterDate === '' || new Date(order.date).toLocaleDateString() === new Date(filterDate).toLocaleDateString())
  );

  return (
    <div className="order-management-container">
      <h2>Gestión de Órdenes</h2>
      <div className="order-management-content">
        <div className="order-management-filters">
          <input
            type="text"
            placeholder="Buscar por Usuario"
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">Todos los Estados</option>
            <option value="Pending">Pendiente</option>
            <option value="Completed">Completada</option>
            <option value="Shipped">Enviado</option>
          </select>
        </div>
        <div className="order-management-cards">
          {filteredOrders.map(order => (
            <div className="order-card" key={order._id}>
              <p><strong>Usuario:</strong> {order.user_name || order.user_id}</p>
              <p><strong>Producto:</strong> {order.products[0].product_name || order.products[0].product_id}</p>
              <p><strong>Total Productos:</strong> {order.products.length}</p>
              <p><strong>Total a Pagar:</strong> {order.total}</p>
              <button onClick={() => setSelectedOrder(order)}>Visualizar</button>
            </div>
          ))}
        </div>
      </div>
      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default OrderManagement;