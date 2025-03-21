import React from 'react';
import './Offers.css';
import exclusive_image from '../Assets/exclusive_image.png'; 

const Offers = () => {
  return (
    <div className='offers'>
      <div className="offers-left">
        <h1> Ofertas Exclusivas solo para ti</h1>
        <p>LOS MEJORES PRODUCTOS AL MEJOR PRECIO</p>
      </div>
      <div className="offers-right">
        <img src={exclusive_image} alt="" />
      </div>
    </div>
  );
};

export default Offers;
