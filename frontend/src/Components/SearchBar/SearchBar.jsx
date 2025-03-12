import React, { useContext } from 'react';
import { ProductContext } from '../../Context/ProductContext';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const { searchTerm, setSearchTerm } = useContext(ProductContext);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <input
      type="search"
      placeholder="Buscar productos..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onKeyDown={handleKeyDown}
      className="search-bar"
      id="search"
    />
  );
};

export default SearchBar;