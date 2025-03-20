import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderManagement.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showFullOrderId, setShowFullOrderId] = useState(false);
  const [showFullUserId, setShowFullUserId] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const translateStatus = (status) => {
    switch (status) {
      case "Pending":
        return "Pendiente";
      case "Completed":
        return "Completada";
      case "Shipped":
        return "Enviado";
      default:
        return status;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("es-CO").format(price);
  };

  const handleDeleteOrder = async (orderId) => {
    console.log("Deleting order with ID:", orderId); // Verificar el orderId
    try {
      await axios.put(`http://localhost:4000/api/orders/${orderId}`, { available: false });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, available: false } : order
        )
      );
    } catch (error) {
      console.error("Error al eliminar la orden:", error);
    }
  };

  const toggleShowDeleted = () => {
    setShowDeleted((prev) => !prev);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.available === !showDeleted &&
      (typeof order.user_id === "string" ? order.user_id.toLowerCase().includes(searchUser.toLowerCase()) : true) &&
      (filterStatus === "" || order.status === filterStatus) &&
      (filterDate === "" ||
        new Date(order.date).toLocaleDateString() ===
        new Date(filterDate).toLocaleDateString())
  );

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const toggleOrderIdVisibility = () => {
    setShowFullOrderId((prev) => !prev);
  };

  const toggleUserIdVisibility = () => {
    setShowFullUserId((prev) => !prev);
  };

  return (
    <div className="order-management-container">
      <h2>Gestión de Órdenes</h2>
      <div className="order-management-filters">
        <button onClick={toggleShowDeleted}>
          {showDeleted ? "Ver Órdenes Activas" : "Ver Órdenes Eliminadas"}
        </button>
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

      <div className="order-management-list">
        {filteredOrders.map((order, index) => (
          <div key={order._id} className="order-card">
            <div className="order-info">
              <div className="label">Orden #{index + 1}</div>
              <div className="label">Nombre:</div>
              <div className="value">{order.user_id?.name || "N/A"}</div>

              <div className="label">Correo:</div>
              <div className="value">{order.user_id?.email || "N/A"}</div>

              <div className="label">Teléfono:</div>
              <div className="value">{order.user_id?.phone || "N/A"}</div>

              <div className="label">Fecha:</div>
              <div className="value">{new Date(order.date).toLocaleString()}</div>

              <div className="label">Estado:</div>
              <div className="value status">{translateStatus(order.status)}</div>
            </div>

            <div className="order-actions">
              <button className="view" onClick={() => handleViewOrder(order)}>
                Visualizar
              </button>
              {!showDeleted && (
                <button className="delete" onClick={() => handleDeleteOrder(order._id)}>
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Detalles de la Orden</h2>
            <div className="order-details">
              <div className="section">
                <h3>Información de la Venta</h3>
                <div className="label">ID de Orden:</div>
                <div className="value">
                  {showFullOrderId ? selectedOrder._id : ""}
                  <button onClick={toggleOrderIdVisibility} className="toggle-id-visibility">
                    {showFullOrderId ? "Ocultar ID" : "Visualizar ID"}
                  </button>
                </div>
                <div className="label">Estado:</div>
                <div className="value status">{translateStatus(selectedOrder.status)}</div>
                <div className="label">Fecha:</div>
                <div className="value">{new Date(selectedOrder.date).toLocaleString()}</div>
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
                            <img src={product.product_id.image} alt={product.product_id.name} style={{ width: '50px', height: '50px' }} />
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
                  <button onClick={toggleUserIdVisibility} className="toggle-id-visibility">
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
            <button className="close-modal" onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;