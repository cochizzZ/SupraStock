import React, { useContext } from 'react';
import './RelatedProducts.css';
import { ShopContext } from '../../Context/ShopContext';
import Item from '../Item/Item';

const RelatedProducts = ({ category, currentProductId }) => {
  const { all_product } = useContext(ShopContext);

  return (
    <div className='relatedproducts'>
      <h1>Productos Similares</h1>
      <hr />
      <div className="relatedproducts-item">
        {all_product
          .filter(item => item.category === category && item.id !== currentProductId) // Excluir el producto actual
          .map((item, i) => (
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
    </div>
  );
};

export default RelatedProducts;