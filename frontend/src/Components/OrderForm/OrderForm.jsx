import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import './OrderForm.css';
import { ShopContext } from '../../Context/ShopContext';

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
        if (window.confirm('¿Estás seguro de que deseas confirmar la compra?')) {
            console.log('Order submitted:', formData);

            // Obtener los productos seleccionados del carrito
            const selectedProducts = all_product.filter(product => cartItems[product.id] > 0).map(product => ({
                product_id: product.id,
                quantity: cartItems[product.id],
                price: product.new_price,
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
                    status: 'Pending',
                    transaction_id: '1234567890', // Simulación de un ID de transacción
                },
            };

            console.log('Order data:', orderData);

            try {
                const orderResponse = await axios.post('http://localhost:4000/api/orders', orderData);
                console.log('Order created successfully:', orderResponse.data);

                // Limpiar el almacenamiento local después de crear la orden
                localStorage.removeItem('orderData');
            } catch (error) {
                console.error('Error creating order:', error);
                if (error.response) {
                    console.error('Error response:', error.response.data);
                }
            }
        }
    };

    return (
        <div className="order-form">
            <h1>Formulario de Orden de Compra</h1>
            <form onSubmit={handleSubmit}>
                {/* Mostrar información del usuario */}
                <label>
                    Nombre del Usuario:
                    <input type="text" value={userData.name} disabled /> {/* Mostrar el nombre del usuario */}
                </label>
                <label>
                    Email:
                    <input type="email" value={userData.email} disabled /> {/* Mostrar el email del usuario */}
                </label>
                <label>
                    Número de Celular:
                    <input type="tel" name="phone" value={userData.phone} disabled /> {/* Mostrar el teléfono */}
                </label>
                <label>
                    Dirección:
                    <input type="text" name="address" value={formData.address} onChange={handleChange} /> {/* Permitir editar la dirección */}
                </label>
                <label>
                    Ciudad:
                    <select name="city" value={formData.city} onChange={handleChange}>
                        <option value="">Seleccione una ciudad</option>
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
                    <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} /> {/* Permitir editar el código postal */}
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
                <button type="submit">Confirmar Orden</button>
            </form>
        </div>
    );
};

export default OrderForm;