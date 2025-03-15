import React from 'react';
import './SalesModal.css';

const SalesModal = ({ sales, onClose }) => {
  return (
    <div className="sales-modal-overlay">
      <div className="sales-modal">
        <h2>Todas las Ventas</h2>
        <ul>
          {sales.map((sale, index) => (
            <li key={sale._id}>
              <h3>Orden #{index + 1}</h3>
              {sale.products.map(product => (
                <div key={product.product_id}>
                  <p><strong>Producto:</strong> {product.product_name}</p>
                  <p><strong>Total a Pagar:</strong> ${product.price * product.quantity}</p>
                  <p><strong>Fecha:</strong> {new Date(sale.date).toLocaleDateString()}</p>
                </div>
              ))}
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
};

export default SalesModal;