import React, { useContext, useEffect, useState } from 'react';
import './Cartitems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Importar Swal
import defaultImage from '../Assets/404.jpg';

const Cartitems = () => {
    const { all_product, cartItems, removeFromCart, updateCart, userId, clearCart } = useContext(ShopContext);
    const navigate = useNavigate();

    const [guestCart, setGuestCart] = useState([]); // Estado para el carrito temporal

    // Cargar el carrito temporal desde localStorage si el usuario no está autenticado
    useEffect(() => {
        if (!localStorage.getItem("auth-token")) {
            const storedCart = JSON.parse(localStorage.getItem("guestCart")) || [];
            setGuestCart(storedCart);
        }
    }, []);

    // Actualizar la cantidad de un producto en el carrito temporal
    const updateGuestCartQuantity = (productId, newQuantity, size) => {
        const updatedCart = guestCart.map(item => {
            if (item.productId === productId && item.size === size) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(item => item.quantity > 0); // Eliminar productos con cantidad 0

        setGuestCart(updatedCart);
        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    };

    // Eliminar un producto del carrito temporal
    const removeFromGuestCart = (productId, size) => {
        const updatedCart = guestCart.filter(item => !(item.productId === productId && item.size === size));
        setGuestCart(updatedCart);
        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
    };

    // Calcular el total del carrito (autenticado o no autenticado)
    const getTotalCartAmount = () => {
        if (localStorage.getItem("auth-token")) {
            return cartItems.reduce((total, item) => total + (item.product_id.new_price * item.quantity), 0);
        } else {
            return guestCart.reduce((total, item) => {
                const product = all_product.find(p => p.id === item.productId);
                return total + (product ? product.new_price * item.quantity : 0);
            }, 0);
        }
    };

    const handleProceedToCheckout = () => {
        if (!localStorage.getItem("auth-token")) {
            Swal.fire({
                title: "Inicia sesión o regístrate",
                text: "Debes iniciar sesión para proceder al pago.",
                icon: "info",
                showCancelButton: true,
                confirmButtonText: "Iniciar sesión",
                cancelButtonText: "Cancelar",
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = "/login";
                }
            });
        } else {
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
        }
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
            {localStorage.getItem("auth-token") ? (
                // Mostrar productos del carrito autenticado
                Array.isArray(cartItems) && cartItems.map((item) => {
                    const product = item.product_id; // Acceder al producto dentro del objeto
                    if (item.quantity > 0) {
                        return (
                            <div key={`${item._id}-${item.size}`}>
                                <div className="cartitems-format cartitems-format-main" id={`${product._id}-${item.size}`}>
                                    <img src={product.image} alt={product.name} className='carticon-product-icon' onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultImage;
                                        }}/>
                                    <p>{product.name}</p>
                                    <p>${product.new_price}</p>
                                    <p>{item.size}</p> {/* Mostrar la talla del producto */}
                                    <input
                                        type="number"
                                        className="cartitems-quantity-input"
                                        min="0"
                                        value={item.quantity}
                                        onChange={(event) => updateCart(product._id, Number(event.target.value), item.size)}
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
                })
            ) : (
                // Mostrar productos del carrito temporal
                guestCart.map((item) => {
                    const product = all_product.find(p => p.id === item.productId);
                    if (product) {
                        return (
                            <div key={`${item.productId}-${item.size}`}>
                                <div className="cartitems-format cartitems-format-main" id={`${item.productId}-${item.size}`}>
                                    <img src={product.image} alt={product.name} className='carticon-product-icon' onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = defaultImage;
                                        }}/>
                                    <p>{product.name}</p>
                                    <p>${product.new_price}</p>
                                    <p>{item.size}</p> {/* Mostrar la talla del producto */}
                                    <input
                                        type="number"
                                        className="cartitems-quantity-input"
                                        min="0"
                                        value={item.quantity}
                                        onChange={(event) => updateGuestCartQuantity(item.productId, Number(event.target.value), item.size)}
                                    />
                                    <p>${product.new_price * item.quantity}</p>
                                    <img
                                        className='cartitems-remove-icon'
                                        src={remove_icon}
                                        onClick={() => removeFromGuestCart(item.productId, item.size)}
                                        alt="Eliminar"
                                    />
                                </div>
                                <hr />
                            </div>
                        );
                    }
                    return null;
                })
            )}
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
                {cartItems.length === 0 && guestCart.length === 0 && <h1>El carrito está vacío</h1>}
            </div>
        </div>
    );
};

export default Cartitems;