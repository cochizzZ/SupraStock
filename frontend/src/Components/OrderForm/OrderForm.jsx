import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; // Importar SweetAlert2
import './OrderForm.css';
import { ShopContext } from '../../Context/ShopContext';
import Payment from '../payment/Payment'; // Ajusta la ruta según la ubicación del archivo

const OrderForm = () => {
    const { userId, cartItems, all_product, getTotalCartAmount } = useContext(ShopContext);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postal_code: '',
    });
    const [formData, setFormData] = useState({
        paymentMethod: '',
        address: '',
        city: '',
        postal_code: '',
    });
    const [isProcessing, setIsProcessing] = useState(false); // Estado para controlar el botón

    // Obtener la información del usuario desde el backend
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/api/users/${userId}`);
                const { name, email, phone, address, city, postal_code } = response.data;
                setUserData({ name, email, phone, address, city, postal_code });
                setFormData({ ...formData, address, city, postal_code });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Confirmación de compra
        const confirm = await Swal.fire({
            title: "Confirmar compra",
            text: "¿Estás seguro de que deseas confirmar la compra?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, confirmar",
        });

        if (!confirm.isConfirmed) return;

        console.log("Order submitted:", formData);

        // Deshabilitar botón mientras se procesa
        setIsProcessing(true);

        try {
            // Obtener los productos seleccionados del carrito
            const selectedProducts = cartItems.map((item) => ({
                product_id: item.product_id._id, // Accede al ID del producto
                quantity: item.quantity, // Cantidad seleccionada
                price: item.product_id.new_price, // Precio del producto
                size: item.size, // Talla seleccionada
            }));

            // Crear la orden con los datos del pago incluidos
            const orderData = {
                user_id: userId,
                products: selectedProducts,
                total: getTotalCartAmount(),
                address: formData.address,
                city: formData.city,
                postal_code: formData.postal_code,
                payment_info: {
                    method: formData.paymentMethod,
                    status: "Pending",
                    transaction_id: "1234567890", // Simulación de un ID de transacción
                },
            };

            console.log("Order data:", orderData);

            // Crear la orden en el backend
            const orderResponse = await axios.post("http://localhost:4000/api/orders", orderData);
            console.log("Order created successfully:", orderResponse.data);

            // Limpiar el carrito después de crear la orden
            const clearCartResponse = await axios.delete("http://localhost:4000/clearcart", {
                headers: { "auth-token": localStorage.getItem("auth-token") },
            });

            console.log("Cart cleared:", clearCartResponse.data);

            // Mostrar mensaje de éxito
            await Swal.fire({
                title: "¡Compra realizada!",
                text: "Tu compra ha sido confirmada con éxito.",
                icon: "success",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "OK",
            });

            // Redirigir al usuario a la página principal
            window.location.replace("/");
        } catch (error) {
            console.error("Error creating order or clearing cart:", error);
            if (error.response) {
                console.error("Error response:", error.response.data);
            }

            // Notificar al usuario en caso de error
            Swal.fire({
                title: "Error",
                text: "Hubo un problema al procesar tu compra. Inténtalo de nuevo.",
                icon: "error",
                confirmButtonColor: "#d33",
                confirmButtonText: "Cerrar",
            });
        } finally {
            setIsProcessing(false); // Habilitar botón nuevamente
        }
    };

    const totalAmount = getTotalCartAmount(); // Calcula el monto total del carrito

    return (
        <div className="order-form">
            <h1>Formulario de Orden de Compra</h1>
            <form onSubmit={handleSubmit}>
                {/* Mostrar información del usuario */}
                <label>
                    Nombre del Usuario:
                    <input type="text" value={userData.name} disabled />
                </label>
                <label>
                    Email:
                    <input type="email" value={userData.email} disabled />
                </label>
                <label>
                    Número de Celular:
                    <input type="tel" name="phone" value={userData.phone} />
                </label>
                <label>
                    Dirección:
                    <input type="text" name="address" value={formData.address} onChange={handleChange} />
                </label>
                <label>
                    Area Metropolitana:
                    <select name="city" value={formData.city} onChange={handleChange}>
                        <option value="">Seleccione un Municipio</option>
                        <option value="Medellín">Medellín</option>
                        <option value="Envigado">Envigado</option>
                        <option value="Itagüí">Itagüí</option>
                        <option value="Bello">Bello</option>
                        <option value="Sabaneta">Sabaneta</option>
                        <option value="La Estrella">La Estrella</option>
                        <option value="Caldas">Caldas</option>
                    </select>
                </label>
                <label>
                    Código Postal:
                    <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} />
                </label>

                {/* Selección del método de pago */}
                <label>
                    Método de Pago:
                    <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                        <option value="">Seleccione un método de pago</option>
                        <option value="PSE">PSE</option>
                        <option value="Credit Card">Tarjeta de Crédito</option>
                        <option value="PayPal">PayPal</option>
                    </select>
                </label>
                <button type="submit" disabled={isProcessing}>
                    {isProcessing ? "Procesando..." : "Confirmar Orden"}
                </button>
            </form>
            <Payment totalAmount={totalAmount} />
        </div>
    );
};

export default OrderForm;