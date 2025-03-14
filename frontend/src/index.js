import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ShopContextProvider from './Context/ShopContext';
import ProductContextProvider from './Context/ProductContext';
import UserContextProvider from './Context/UserContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ShopContextProvider>
    <ProductContextProvider>
      <UserContextProvider>
        <App />
      </UserContextProvider>
    </ProductContextProvider>
  </ShopContextProvider>
);