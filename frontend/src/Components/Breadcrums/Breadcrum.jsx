import React from 'react';
import './Breadcrum.css';
import arrow_icon from '../Assets/breadcrum_arrow.png';

const Breadcrum = (props) => {
    const { product } = props;

    if (!product || !product.category) {
        return <div>Producto no encontrado</div>;
    }

    const categoryMap = {
        men: 'Hombre',
        women: 'Mujer',
        kid: 'Niños'
    };

    const categoryDisplay = categoryMap[product.category] || product.category;

    return (
        <div className='breadcrum'>
            Inicio <img src={arrow_icon} alt="" /> Tienda <img src={arrow_icon} alt="" /> {categoryDisplay} <img src={arrow_icon} alt="" /> {product.name}
        </div>
    );
};

export default Breadcrum;