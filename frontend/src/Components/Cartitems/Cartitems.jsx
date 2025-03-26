import React, { useContext } from 'react';
import './Cartitems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importar Swal

const Cartitems = () => {
    const { getTotalCartAmount, all_product, cartItems, removeFromCart, updateCart, userId, clearCart } = useContext(ShopContext);
    const navigate = useNavigate();

    const updateCartQuantity = (productId, newQuantity, size) => {
        const product = all_product.find(p => p._id === productId);

        if (!product) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Producto no encontrado.',
            });
            return;
        }

        const availableQuantity = product.sizes[size];

        if (newQuantity > availableQuantity) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Solo hay ${availableQuantity} unidades disponibles en la talla ${size}.`,
            });
            return;
        }

        if (newQuantity >= 1) {
            updateCart(productId, newQuantity, size);
        }
    };

    const handleProceedToCheckout = () => {
        if (!userId) {
            // Guardar los productos seleccionados en el almacenamiento local
            const selectedProducts = all_product.filter(product => cartItems.some(item => item.product_id._id === product._id && item.quantity > 0)).map(product => ({
                productId: product._id,
                quantity: cartItems.find(item => item.product_id._id === product._id).quantity
            }));
            localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));

            // Redirigir al usuario a la página de registro/login
            navigate('/login');
            return;
        }

        // Si el usuario está logueado, proceder al formulario de orden
        const selectedProducts = all_product.filter(product => cartItems.some(item => item.product_id._id === product._id && item.quantity > 0)).map(product => ({
            productId: product._id,
            quantity: cartItems.find(item => item.product_id._id === product._id).quantity
        }));

        const orderData = {
            userId,
            products: selectedProducts,
            totalAmount: getTotalCartAmount()
        };

        // Almacenar la información de la orden en el almacenamiento local
        localStorage.setItem('orderData', JSON.stringify(orderData));

        // Redirigir a la página de creación de la orden
        navigate('/order');
    };

    return (
        <div className='cartitems'>
            <div className='empty-cart'> <button onClick={clearCart}>Limpiar carrito</button> </div>
            <h1>Carrito</h1>
            <div className="cartitems-format-main">
                <p>Productos</p>
                <p>Título</p>
                <p>Precio</p>
                <p>Talla</p>
                <p>Cantidad</p>
                <p>Total</p>
                <p>Eliminar</p>
            </div>
            <hr />
            {Array.isArray(cartItems) && cartItems.map((item) => {
                const product = item.product_id; // Acceder al producto dentro del objeto
                if (item.quantity > 0) {
                    return (
                        <div key={`${item._id}-${item.size}`}>
                            <div className="cartitems-format cartitems-format-main" id={`${product._id}-${item.size}`}>
                                <img src={product.image} alt={product.name} className='carticon-product-icon' />
                                <p>{product.name}</p>
                                <p>${product.new_price}</p>
                                <p>{item.size}</p> {/* Mostrar la talla del producto */}
                                <input
                                    type="number"
                                    className="cartitems-quantity-input"
                                    min="0"
                                    value={item.quantity}
                                    onChange={(event) => updateCartQuantity(product._id, Number(event.target.value), item.size)}
                                />
                                <p>${product.new_price * item.quantity}</p>
                                <img
                                    className='cartitems-remove-icon'
                                    src={remove_icon}
                                    onClick={() => removeFromCart(product._id, item.size)}
                                    alt="Eliminar"
                                />
                            </div>
                            <hr />
                        </div>
                    );
                }
                return null;
            })}
            <div className="cartitems-down">
                <div className="cartitems-total">
                    <h1>Total</h1>
                    <div>
                        <div className="cartitems-total-item">
                            <p>Subtotal</p>
                            <p>${getTotalCartAmount()}</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <p>Precio de envio</p>
                            <p>Free</p>
                        </div>
                        <hr />
                        <div className="cartitems-total-item">
                            <h3>Total</h3>
                            <h3>${getTotalCartAmount()}</h3>
                        </div>
                    </div>
                    <button onClick={handleProceedToCheckout}>Proceder al pago</button>
                </div>
            </div>
            <div className="cartitems-empty">
                {cartItems.length === 0 && <h1>El carrito está vacío</h1>}
            </div>
        </div>
        
    );
};

export default Cartitems;
