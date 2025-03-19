import React, { useContext, useState } from 'react';
import axios from 'axios';
import './OrderForm.css';
import { ShopContext } from '../../Context/ShopContext';

const OrderForm = () => {
    const { userId, cartItems, all_product, getTotalCartAmount } = useContext(ShopContext);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        postalCode: '',
        paymentMethod: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (window.confirm('¿Estás seguro de que deseas confirmar la compra?')) {
            console.log('Order submitted:', formData);
            alert('Orden confirmada. ¡Gracias por tu compra!');

            // Verificar que userId no sea undefined
            if (!userId) {
                console.error('Error: userId is undefined');
                return;
            }

            console.log('userId:', userId); // Verificar el valor de userId

            // Obtener los productos seleccionados del carrito
            const selectedProducts = all_product.filter(product => cartItems[product.id] > 0).map(product => ({
                product_id: product.id,
                quantity: cartItems[product.id],
                price: product.new_price
            }));

            // Crear la orden con los datos del pago incluidos
            const orderData = {
                user_id: userId,
                products: selectedProducts,
                total: getTotalCartAmount(),
                customer_info: {
                    name: formData.fullName,
                    address: formData.address,
                    city: formData.city,
                    postal_code: formData.postalCode,
                    email: formData.email,
                    phone: formData.phone,
                },
                payment_info: {
                    method: formData.paymentMethod,
                    status: 'Pending',
                    transaction_id: '1234567890', // Simulación de un ID de transacción
                }
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
                    console.error('Error response:', error.response.data); // Agregar este log para ver el error detallado
                }
            }
        }
    };

    return (
        <div className="order-form">
            <h1>Formulario de Orden de Compra</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombres y Apellidos:
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </label>
                <label>
                    Número de Celular:
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                </label>
                <label>
                    Dirección:
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                </label>
                <label>
                    Ciudad:
                    <select name="city" value={formData.city} onChange={handleChange} required>
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
                    <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} required />
                </label>
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