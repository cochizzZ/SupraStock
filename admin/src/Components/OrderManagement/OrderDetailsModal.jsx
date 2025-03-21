import React from "react";
import "./OrderManagement.css";

const OrderDetailsModal = ({
  selectedOrder,
  showFullOrderId,
  showFullUserId,
  toggleOrderIdVisibility,
  toggleUserIdVisibility,
  closeModal,
  translateStatus,
  formatPrice,
}) => {
  if (!selectedOrder) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>
          &times;
        </span>
        <h2>Detalles de la Orden</h2>
        <div className="order-details">
          <div className="section">
            <h3>Información de la Venta</h3>
            <div className="label">ID de Orden:</div>
            <div className="value">
              {showFullOrderId ? selectedOrder._id : ""}
              <button
                onClick={toggleOrderIdVisibility}
                className="toggle-id-visibility"
              >
                {showFullOrderId ? "Ocultar ID" : "Visualizar ID"}
              </button>
            </div>
            <div className="label">Estado:</div>
            <div className="value status">
              {translateStatus(selectedOrder.status)}
            </div>
            <div className="label">Fecha:</div>
            <div className="value">
              {new Date(selectedOrder.date).toLocaleString()}
            </div>
            <div className="label">Total:</div>
            <div className="value">${formatPrice(selectedOrder.total)}</div>
            <div className="label">Productos:</div>
            <div className="value">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Precio por Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.products.map((product) => (
                    <tr key={product.product_id._id}>
                      <td>
                        <img
                          src={product.product_id.image}
                          alt={product.product_id.name}
                          style={{ width: "50px", height: "50px" }}
                        />
                      </td>
                      <td>{product.product_id.name}</td>
                      <td>{product.quantity}</td>
                      <td>${formatPrice(product.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section">
            <h3>Información de Contacto</h3>
            <div className="label">ID de Usuario:</div>
            <div className="value">
              {showFullUserId ? selectedOrder.user_id._id : ""}
              <button
                onClick={toggleUserIdVisibility}
                className="toggle-id-visibility"
              >
                {showFullUserId ? "Ocultar ID" : "Visualizar ID"}
              </button>
            </div>
            <div className="label">Nombre:</div>
            <div className="value">{selectedOrder.user_id?.name || "N/A"}</div>
            <div className="label">Correo:</div>
            <div className="value">{selectedOrder.user_id?.email || "N/A"}</div>
            <div className="label">Teléfono:</div>
            <div className="value">{selectedOrder.user_id?.phone || "N/A"}</div>
          </div>

          <div className="section">
            <h3>Información de Envío</h3>
            <div className="label">Ciudad:</div>
            <div className="value">{selectedOrder.city || "N/A"}</div>
            <div className="label">Dirección:</div>
            <div className="value">{selectedOrder.address || "N/A"}</div>
            <div className="label">Código Postal:</div>
            <div className="value">{selectedOrder.postal_code || "N/A"}</div>
          </div>
        </div>
        <button className="close-modal" onClick={closeModal}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsModal;