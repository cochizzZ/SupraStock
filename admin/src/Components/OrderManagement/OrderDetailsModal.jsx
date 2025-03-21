import React from "react";
import { jsPDF } from "jspdf"; // Importar jsPDF
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

  const generatePDF = () => {
    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(18);
    doc.text("Detalles de la Orden", 10, 10);

    // Información de la venta
    doc.setFontSize(14);
    doc.text("Información de la Venta", 10, 20);
    doc.text(`ID de Orden: ${selectedOrder._id}`, 10, 30);
    doc.text(`Estado: ${translateStatus(selectedOrder.status)}`, 10, 40);
    doc.text(`Fecha: ${new Date(selectedOrder.date).toLocaleString()}`, 10, 50);
    doc.text(`Total: $${formatPrice(selectedOrder.total)}`, 10, 60);

    // Productos
    doc.text("Productos:", 10, 70);
    let y = 80;
    selectedOrder.products.forEach((product, index) => {
      doc.text(
        `${index + 1}. ${product.product_id.name} - Cantidad: ${
          product.quantity
        } - Precio: $${formatPrice(product.price)}`,
        10,
        y
      );
      y += 10;
    });

    // Información de contacto
    y += 10;
    doc.text("Información de Contacto", 10, y);
    y += 10;
    doc.text(`Nombre: ${selectedOrder.user_id?.name || "N/A"}`, 10, y);
    y += 10;
    doc.text(`Correo: ${selectedOrder.user_id?.email || "N/A"}`, 10, y);
    y += 10;
    doc.text(`Teléfono: ${selectedOrder.user_id?.phone || "N/A"}`, 10, y);

    // Información de envío
    y += 20;
    doc.text("Información de Envío", 10, y);
    y += 10;
    doc.text(`Ciudad: ${selectedOrder.city || "N/A"}`, 10, y);
    y += 10;
    doc.text(`Dirección: ${selectedOrder.address || "N/A"}`, 10, y);
    y += 10;
    doc.text(`Código Postal: ${selectedOrder.postal_code || "N/A"}`, 10, y);

    // Guardar el PDF
    doc.save(`Orden_${selectedOrder._id}.pdf`);
  };

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
        <button className="generate-pdf" onClick={generatePDF}>
          Generar PDF
        </button>
        <button className="close-modal" onClick={closeModal}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsModal;