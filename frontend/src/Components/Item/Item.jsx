import React, { useContext, useCallback } from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import addToCartIcon from '../Assets/add_to_cart_icon.png';

const Item = ({ id, image, name, new_price, old_price }) => {
  const { addToCart } = useContext(ShopContext);

  const handleAddToCart = useCallback(() => {
    if (!id) {
      console.error("El ID del producto no está definido.");
      return;
    }
    addToCart(id);
  }, [id, addToCart]); // Dependencias para evitar recreación innecesaria

  return (
    <div className='item'>
      <Link to={`/product/${id}`}>
        <img onClick={() => window.scrollTo(0, 0)} src={image} alt={name} />
      </Link>
      <p>{name}</p>
      <div className="container-items-info">
        <div className="item-prices"> 
          <div className="item-price-new">${new_price}</div>
          <div className="item-price-old">${old_price}</div>
        </div>
        <button onClick={handleAddToCart} className="cart">
          <img src={addToCartIcon} alt="Agregar al carrito" />
        </button>
      </div>
    </div>
  );
};

export default Item;
