import React, { useEffect, useState } from "react";
import axios from "axios";
import "./OrderManagement.css";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");

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

  const filteredOrders = orders.filter(
    (order) =>
      order.user_id.toLowerCase().includes(searchUser.toLowerCase()) &&
      (filterStatus === "" || order.status === filterStatus) &&
      (filterDate === "" ||
        new Date(order.date).toLocaleDateString() ===
          new Date(filterDate).toLocaleDateString())
  );

  return (
    <div className="order-management-container">
      <h2>Gestión de Órdenes</h2>
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

      <div className="order-management-list">
        {filteredOrders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-grid">
              <div className="label">ID de Orden:</div>
              <div className="value">{order._id}</div>

              <div className="label">ID de Usuario:</div>
              <div className="value">{order.user_id}</div>

              <div className="label">Productos:</div>
              <div className="value">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products.map((product) => (
                      <tr key={product.product_id}>
                        <td>{product.product_id}</td>
                        <td>{product.quantity}</td>
                        <td>${formatPrice(product.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="label">Total:</div>
              <div className="value">${formatPrice(order.total)}</div>

              <div className="label">Estado:</div>
              <div className="value status">{translateStatus(order.status)}</div>

              <div className="label">Fecha:</div>
              <div className="value">{new Date(order.date).toLocaleString()}</div>
            </div>

            <div className="order-actions">
              <button className="complete" onClick={() => console.log("Marcar como completada")}>
                Marcar como Completada
              </button>
              <button className="delete" onClick={() => console.log("Eliminar orden")}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
};

export default OrderManagement;
