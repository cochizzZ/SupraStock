import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserOrders.css';
import defaultImage from '../Assets/404.jpg';

const UserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null); // Estado para controlar el acordeón

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/user/orders', {
          headers: {
            'auth-token': localStorage.getItem('auth-token')
          }
        });
        const ordersData = response.data;
        setOrders(ordersData);

        // Fetch product details for each product in the orders
        const productIds = new Set();
        ordersData.forEach(order => {
          order.products.forEach(product => {
            productIds.add(product.product_id);
          });
        });

        const productDetails = {};
        await Promise.all([...productIds].map(async productId => {
          const productResponse = await axios.get(`http://localhost:4000/api/products/${productId}`);
          productDetails[productId] = productResponse.data;
        }));

        setProducts(productDetails);
      } catch (error) {
        console.error('Error fetching orders or products:', error);
      }
    };

    fetchOrders();
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="user-orders-container">
      <h2>Historial de Compras</h2>
      {orders.length > 0 ? (
        [...orders].reverse().map((order, index) => (
          <div key={order._id} className="order-accordion">
            <div className="order-header" onClick={() => toggleOrder(order._id)}>
              <span>Orden #{orders.length - index}</span>
              <span>Total: ${order.total}</span>
              <span>{new Date(order.date).toLocaleString()}</span>
            </div>
            {expandedOrder === order._id && (
              <div className="order-details">
                <table className="user-orders-table">
                  <thead>
                    <tr>
                      <th>Imagen</th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Total</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products.map(product => {
                      const productDetails = products[product.product_id];
                      return (
                        <tr key={product.product_id}>
                          <td>
                            {productDetails && (
                              <img
                                src={productDetails.image}
                                alt={productDetails.name}
                                className="product-image"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = defaultImage;
                                }}
                              />
                            )}
                          </td>
                          <td>{productDetails ? productDetails.name : 'Cargando...'}</td>
                          <td>{product.quantity}</td>
                          <td>${product.price}</td>
                          <td>${product.price * product.quantity}</td>
                          <td>{order.status}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>No hay órdenes disponibles</p>
      )}
    </div>
  );
};

export default UserOrders;