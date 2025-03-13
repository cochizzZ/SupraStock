import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import ShopProvider from './Context/ShopContext';

ReactDOM.render(
  <ShopProvider>
    <Router>
      <App />
    </Router>
  </ShopProvider>,
  document.getElementById('root')
);