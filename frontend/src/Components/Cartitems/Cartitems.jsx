import React, { useContext } from 'react';
import './Cartitems.css';
import { ShopContext } from '../../Context/ShopContext';
import remove_icon from '../Assets/cart_cross_icon.png';
import { useNavigate } from 'react-router-dom';

const Cartitems = () => {
    const { getTotalCartAmount, all_product, cartItems, removeFromCart, updateCart, userId } = useContext(ShopContext);
    const navigate = useNavigate();

    const updateCartQuantity = (itemId, newQuantity) => {
        if (newQuantity >= 1) {
            updateCart(itemId, newQuantity);
        }
    };

    const handleProceedToCheckout = () => {
        const selectedProducts = all_product.filter(product => cartItems[product.id] > 0).map(product => ({
            productId: product.id,
            quantity: cartItems[product.id]
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
            <div className="cartitems-format-main">
                <p>Productos</p>
                <p>Título</p>
                <p>Precio</p>
                <p>Cantidad</p>
                <p>Total</p>
                <p>Eliminar</p>
            </div>
            <hr />
            {all_product.map((e) => {
                if (cartItems[e.id] > 0) {
                    return (
                        <div key={e.id}>
                            <div className="cartitems-format cartitems-format-main" id={e.id}>
                                <img src={e.image} alt={e.name} className='carticon-product-icon' />
                                <p>{e.name}</p>
                                <p>${e.new_price}</p>
                                <input
                                    type="number"
                                    className="cartitems-quantity-input"
                                    min="1"
                                    value={cartItems[e.id]}
                                    onChange={(event) => updateCartQuantity(e.id, Number(event.target.value))}
                                />
                                <p>${e.new_price * cartItems[e.id]}</p>
                                <img className='cartitems-remove-icon' src={remove_icon} onClick={() => removeFromCart(e.id)} alt="Eliminar" />
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
                <div className="cartitems-promocode">
                    <p>If you have a promo code, enter it here</p>
                    <div className="cartitems-promobox">
                        <input type="text" placeholder='Promo code' />
                        <button>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cartitems;
