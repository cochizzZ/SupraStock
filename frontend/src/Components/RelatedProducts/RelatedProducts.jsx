import React, { useContext, useState, useEffect } from 'react';
import './RelatedProducts.css';
import { ShopContext } from '../../Context/ShopContext';
import Item from '../Item/Item';

const RelatedProducts = ({ category, currentProductId }) => {
  const { all_product } = useContext(ShopContext);
  const [startIndex, setStartIndex] = useState(0); // Índice inicial del slider
  const [visibleCount, setVisibleCount] = useState(4); // Número de productos visibles

  const relatedProducts = all_product.filter(
    (item) => item.category === category && item.id !== currentProductId
  );

  // Actualizar el número de productos visibles según el tamaño de la pantalla
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth <= 500) {
        setVisibleCount(2); // Mostrar 2 productos en pantallas pequeñas
      } else {
        setVisibleCount(4); // Mostrar 4 productos en pantallas grandes
      }
    };

    updateVisibleCount(); // Ejecutar al cargar el componente
    window.addEventListener('resize', updateVisibleCount); // Escuchar cambios en el tamaño de la pantalla

    return () => {
      window.removeEventListener('resize', updateVisibleCount); // Limpiar el evento al desmontar
    };
  }, []);

  const handleNext = () => {
    if (startIndex + visibleCount < relatedProducts.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const visibleProducts = relatedProducts.slice(startIndex, startIndex + visibleCount);

  return (
    <div className="relatedproducts">
      <h1>Productos Similares</h1>
      <hr />
      <div className="relatedproducts-slider-container">
        <button className="slider-arrow left-arrow" onClick={handlePrev} disabled={startIndex === 0}>
          &#8249;
        </button>
        <div className="relatedproducts-slider">
          {visibleProducts.map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))}
        </div>
        <button
          className="slider-arrow right-arrow"
          onClick={handleNext}
          disabled={startIndex + visibleCount >= relatedProducts.length}
        >
          &#8250;
        </button>
      </div>
    </div>
  );
};

export default RelatedProducts;