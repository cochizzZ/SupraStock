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

  // Función para manejar el clic en "Ver más"
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => Math.min(prevCount + 4, filteredProducts.length));
  };

  return (
    <div className='shop-category'>
      <img className='shopcategory-banner' src={props.banner} alt="" />
      <div className="shopcategory-indexSort">
        <p>
          <span>Mostrando 1 - {Math.min(visibleCount, filteredProducts.length)}</span> de {filteredProducts.length} productos
        </p>
        <div className="shopcategory-sort">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>
      <div className="shopcategory-products">
        {filteredProducts.slice(0, visibleCount).map((item, i) => (
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
      {visibleCount < filteredProducts.length && (
        <div>
          <button className="shopcategory-loadmore"onClick={handleLoadMore}>Ver más</button>
        </div>
      )}
    </div>
  );
};

export default ShopCategory;