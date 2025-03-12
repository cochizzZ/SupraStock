import React, { useContext } from 'react';
import { ProductContext } from '../../Context/ProductContext';
import { Link } from 'react-router-dom';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
  const { filteredProducts } = useContext(ProductContext);

  if (!isOpen) return null;

  return (
    <div className="search-modal">
      <div className="search-modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="search-result-item">
              <img src={product.image} alt={product.name} />
              <div>
                <h3>{product.name}</h3>
                <p>${product.new_price}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>No se encontraron productos.</p>
        )}
      </div>
    </div>
  );
};

export default SearchModal;