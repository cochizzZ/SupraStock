import React, { createContext, useState, useContext } from 'react';
import { ShopContext } from './ShopContext';

export const ProductContext = createContext();

const ProductContextProvider = ({ children }) => {
  const { all_product } = useContext(ShopContext);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = all_product.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProductContext.Provider value={{ searchTerm, setSearchTerm, filteredProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContextProvider;