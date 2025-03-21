import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderManagement.css";
import OrderDetailsModal from "./OrderDetailsModal";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
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
      await axios.put(`http://localhost:4000/api/orders/${orderId}`, {
        available: false,
      });
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

  const filteredOrders = orders
    .filter(
      (order) =>
        order.available === !showDeleted &&
        (searchUser === "" ||
          order.user_id?.name
            ?.toLowerCase()
            .includes(searchUser.toLowerCase())) && // Filtrar por nombre del usuario
        (filterStatus === "" || order.status === filterStatus) // Filtrar por estado
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Ordenar por fecha descendente

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

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
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
              <div className="label">Orden #{filteredOrders.length - index}</div>
              <div className="label">Nombre:</div>
              <div className="value">{order.user_id?.name || "N/A"}</div>

              <div className="label">Correo:</div>
              <div className="value">{order.user_id?.email || "N/A"}</div>

              <div className="label">Teléfono:</div>
              <div className="value">{order.user_id?.phone || "N/A"}</div>

              <div className="label">Fecha:</div>
              <div className="value">
                {new Date(order.date).toLocaleString()}
              </div>

              <div className="label">Estado:</div>
              <div className="value status">
                {translateStatus(order.status)}
              </div>
            </div>

            <div className="order-actions">
              <button className="view" onClick={() => handleViewOrder(order)}>
                Visualizar
              </button>
              {!showDeleted && (
                <button
                  className="delete"
                  onClick={() => handleDeleteOrder(order._id)}
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <OrderDetailsModal
        selectedOrder={selectedOrder}
        showFullOrderId={showFullOrderId}
        showFullUserId={showFullUserId}
        toggleOrderIdVisibility={toggleOrderIdVisibility}
        toggleUserIdVisibility={toggleUserIdVisibility}
        closeModal={closeModal}
        translateStatus={translateStatus}
        formatPrice={formatPrice}
      />
    </div>
  );
};

export default OrderManagement;