import React, { useContext, useCallback, useState, useEffect, useRef } from 'react';
import './Item.css';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import addToCartIcon from '../Assets/add_to_cart_icon.png';
import defaultImage from '../Assets/404.jpg'; // Ruta a la imagen por defecto

const Item = ({ id, image, name, new_price, old_price, sizes }) => {
  const { addToCart } = useContext(ShopContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const dropdownRef = useRef(null);

  const handleAddToCart = useCallback(() => {
    if (!id) {
      console.error("El ID del producto no está definido.");
      return;
    }
    if (!selectedSize) {
      alert("Por favor, selecciona una talla.");
      return;
    }
    if (quantity < 1) {
      alert("Por favor, selecciona una cantidad válida.");
      return;
    }
    addToCart(id, selectedSize, quantity);
    setIsDropdownOpen(false);
  }, [id, selectedSize, quantity, addToCart]);

  // Cerrar el dropdown al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='item'>
      <Link to={`/product/${id}`}>
        <img
          onClick={() => window.scrollTo(0, 0)}
          src={image}
          alt={name}
          onError={(e) => {
            e.target.onerror = null; // Evitar bucles infinitos si la imagen por defecto también falla
            e.target.src = defaultImage; // Reemplazar con la imagen por defecto
          }}
        />
      </Link>
      <p>{name}</p>
      <div className="container-items-info">
        <div className="item-prices">
          <div className="item-price-new">${new_price}</div>
          <div className="item-price-old">${old_price}</div>
        </div>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="cart">
          <img src={addToCartIcon} alt="Agregar al carrito" />
        </button>
        {isDropdownOpen && (
          <div className="item-dropdown" ref={dropdownRef}>
            <div className="item-dropdown-field">
              <label htmlFor="size-select">Talla:</label>
              <select
                id="size-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="" disabled>Seleccionar talla</option>
                {Object.entries(sizes).map(([size, quantity]) => (
                  <option key={size} value={size}>
                    {size} ({quantity} disponibles)
                  </option>
                ))}
              </select>
            </div>
            <div className="item-dropdown-field">
              <label htmlFor="quantity-input">Cantidad:</label>
              <input
                id="quantity-input"
                type="number"
                min="1"
                max={sizes[selectedSize] || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.min(e.target.value, sizes[selectedSize] || 1))}
              />
            </div>
            <button onClick={handleAddToCart} className="add-to-cart-button">
              Confirmar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Item;