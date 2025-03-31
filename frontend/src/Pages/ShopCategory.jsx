import React, { useContext, useState } from 'react';
import './CSS/ShopCategory.css';
import { ShopContext } from '../Context/ShopContext';
import dropdown_icon from '../Components/Assets/dropdown_icon.png';
import Item from '../Components/Item/Item';

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);

  // Filtrar los productos por categoría
  const filteredProducts = all_product.filter(
    (product) => product.category === props.category
  );

  // Estado para controlar cuántos productos se muestran
  const [visibleCount, setVisibleCount] = useState(4);

  // Estado para controlar el criterio de ordenación
  const [sortCriteria, setSortCriteria] = useState(); // Default: Fecha descendente

  // Función para manejar el clic en "Ver más"
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + 4, filteredProducts.length));
  };

  // Función para ordenar los productos según el criterio seleccionado
  const sortProducts = (products) => {
    switch (sortCriteria) {
      case 'date-desc':
        return [...products].sort((a, b) => new Date(b.date) - new Date(a.date)); // Más reciente a más antiguo
      case 'date-asc':
        return [...products].sort((a, b) => new Date(a.date) - new Date(b.date)); // Más antiguo a más reciente
      case 'name-asc':
        return [...products].sort((a, b) => a.name.localeCompare(b.name)); // Alfabéticamente A-Z
      case 'name-desc':
        return [...products].sort((a, b) => b.name.localeCompare(a.name)); // Alfabéticamente Z-A
      default:
        return products;
    }
  };

  // Productos ordenados según el criterio seleccionado
  const sortedProducts = sortProducts(filteredProducts);

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Mostrando 1 - {Math.min(visibleCount, sortedProducts.length)}</span> de {sortedProducts.length} productos
        </p>
        <div className="shopcategory-sort">
          <label htmlFor="sort-select"></label>
          <select
            id="sort-select"
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value)}>
            <option value="order-by">Ordenar por:</option>
            <option value="date-desc">Fecha (Más reciente)</option>
            <option value="date-asc">Fecha (Más antiguo)</option>
            <option value="name-asc">Nombre (A-Z)</option>
            <option value="name-desc">Nombre (Z-A)</option>
          </select>
        </div>
      </div>
      <div className="shopcategory-products">
        {sortedProducts.slice(0, visibleCount).map((item, i) => (
          <Item
            key={i}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
            sizes={item.sizes}
          />
        ))}
      </div>
      {visibleCount < sortedProducts.length && (
        <div>
          <button className="shopcategory-loadmore" onClick={handleLoadMore}>Ver más</button>
        </div>
      )}
    </div>
  );
};

export default ShopCategory;