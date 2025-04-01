import React, { useContext, useEffect } from 'react';
import { ProductContext } from '../../Context/ProductContext';
import { Link } from 'react-router-dom';
import './SearchModal.css';
import { blockScroll, allowScroll } from '../../Utils/ScrollBlock'; // Cambiar la ruta si mueves el archivo

const SearchModal = ({ isOpen, onClose }) => {
  const { filteredProducts } = useContext(ProductContext);

  useEffect(() => {
    if (isOpen) {
      blockScroll(); // Bloquear el scroll cuando el modal está abierto
    } else {
      allowScroll(); // Permitir el scroll cuando el modal está cerrado
    }

    // Limpiar el efecto al desmontar el componente
    return () => allowScroll();
  }, [isOpen]);

  if (!isOpen) {
    return null; // No renderizar el modal si no está abierto
  }

  return (
    <div className="search-modal">
      <div className="search-modal-content">
        <button className="close-button" onClick={onClose}>X</button>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="search-result-item"
              onClick={onClose} // Cerrar el modal al hacer clic en un producto
            >
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