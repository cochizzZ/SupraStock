import React, { useEffect } from 'react';
import './CSS/AboutUs.css';

const AboutUs = () => {
  // Hacer scroll al inicio de la página al cargar el componente
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-us">
      <h1>¿Quiénes somos?</h1>
      <section className="about-section">
        <article className="about-text">
          <h2>Nuestra Historia</h2>
          <p>
            Fundada en Medellín, nuestra tienda nació con el propósito de ofrecer ropa deportiva 
            femenina de alta calidad, combinando comodidad y estilo. Nos apasiona el 
            deporte y queremos inspirar a cada persona a moverse con confianza.
          </p>
        </article>

        <article className="about-text">
          <h2>Misión</h2>
          <p>
            Facilitar el acceso a una amplia variedad de prendas deportivas de marcas reconocidas, 
            ofreciendo un servicio excepcional y una experiencia de compra inspiradora.
          </p>
        </article>

        <article className="about-text">
          <h2>Visión</h2>
          <p>
            Ser el distribuidor online líder en ropa deportiva femenina, garantizando calidad y 
            satisfacción en cada compra.
          </p>
        </article>

        <article className="about-values">
          <h2>Valores</h2>
          <ul>
            <li>Calidad</li>
            <li>Compromiso</li>
            <li>Pasión</li>
            <li>Innovación</li>
            <li>Sostenibilidad</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

export default AboutUs;
