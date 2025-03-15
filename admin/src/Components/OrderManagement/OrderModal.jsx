import React from 'react';
import './OrderModal.css';

const OrderModal = ({ order, onClose }) => {
  return (
    <div className="order-modal-overlay">
      <div className="order-modal">
        <h2>Detalles de la Orden</h2>
        <p><strong>ID de Orden:</strong> {order._id}</p>
        <p><strong>ID de Usuario:</strong> {order.user_id}</p>
        <p><strong>Nombre del Usuario:</strong> {order.user_name}</p>
        <p><strong>Productos:</strong></p>
        <ul>
          {order.products.map(product => (
            <li key={product.product_id}>
              <p><strong>ID del Producto:</strong> {product.product_id}</p>
              <p><strong>Nombre del Producto:</strong> {product.product_name}</p>
              <p><strong>Cantidad:</strong> {product.quantity}</p>
              <p><strong>Precio:</strong> {product.price}</p>
            </li>
          ))}
        </ul>
        <p><strong>Total:</strong> {order.total}</p>
        <p><strong>Estado:</strong> {order.status}</p>
        <p><strong>Fecha:</strong> {new Date(order.date).toLocaleString()}</p>
        <div className="order-modal-actions">
          <button onClick={() => onClose()}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;