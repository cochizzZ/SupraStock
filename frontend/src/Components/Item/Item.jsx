import React, { useContext } from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import addToCartIcon from '../Assets/add_to_cart_icon.png'; // Asegúrate de tener este ícono

const Item = (props) => {
  const { addToCart } = useContext(ShopContext);

  const handleAddToCart = () => {
    addToCart(props.id);
  };

  return (
    <div className='item'>
      <Link to={`/product/${props.id}`}>
        <img onClick={() => window.scrollTo(0, 0)} src={props.image} alt="" />
      </Link>
      <p>{props.name}</p>
      <div className="container-items-info">
      <div className="item-prices"> 
        <div className="item-price-new">
          ${props.new_price}
        </div>
        <div className="item-price-old">
          ${props.old_price}
          
        </div>
      </div>
      <button onClick={handleAddToCart} className="cart">
        <img src={addToCartIcon} alt="Agregar al carrito" />
      </button>
      </div>
    </div>
  );
};

export default Item;
