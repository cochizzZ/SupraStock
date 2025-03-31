import React, { useState, useEffect } from 'react';
import './Hero.css';
import hand_icon from '../Assets/hand_icon.png';
import hero_image from '../Assets/hero_image.png';

const Hero = () => {
  const [currentColor, setCurrentColor] = useState(0);

  const colors = ['rgba(255, 87, 51, 0.5)', 'rgba(51, 255, 87, 0.5)', 'rgba(51, 87, 255, 0.5)', 'rgba(255, 51, 161, 0.5)', 'rgba(255, 195, 0, 0.5)']; // Colores dinámicos con transparencia

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentColor((prevColor) => (prevColor + 1) % colors.length);
    }, 3000); // Cambiar color cada 3 segundos

    return () => clearInterval(interval); // Limpiar el intervalo al desmontar
  }, []);

  return (
    <div className="hero">
      <div className="hero-left">
        <div>
          <div
            className="hero-hand-icon"
            style={{
              background: `linear-gradient(90deg, #fde1ff, #e1ffea22), ${colors[currentColor]}`, // Superponer degradado y color dinámico
            }}
          >
            <p>Nuevos</p>
            <img src={hand_icon} alt="" />
          </div>
          <p>lanzamientos</p>
          <p>para todos</p>
        </div>
      </div>
      <div className="hero-right">
        <img src={hero_image} alt="" />
      </div>
    </div>
  );
};

export default Hero;
