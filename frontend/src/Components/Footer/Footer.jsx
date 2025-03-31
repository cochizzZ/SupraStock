import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import footer_logo from '../Assets/logo.jpg';
import instagram_icon from '../Assets/instagram_icon.png';
import whatsapp_icon from '../Assets/whatsapp_icon.png';

const Footer = () => {
  const email = "domastore17@gmail.com";
  const subject = encodeURIComponent("Solicitud de ayuda");
  const body = encodeURIComponent("Hola, tengo una consulta sobre...");

  const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;

  return (
    <div className='footer'>
      <div className="footer-logo">
        <img src={footer_logo} alt="Logo BoutiqueAntojitos" />
        <p>BoutiqueAntojitos</p>
      </div>
      <ul className="footer-links">
        <li><Link to="/about">¿Quiénes somos?</Link></li>
        <li>
          <a href={gmailLink} target="_blank" rel="noopener noreferrer" className="footer-link">Ayuda</a>
        </li>
        <li>
          <a href={gmailLink} target="_blank" rel="noopener noreferrer" className="footer-link">Contacto</a>
        </li>
      </ul>
      <div className="footer-social-icon">
        <div className="footer-icons-container">
          <a href="https://www.instagram.com/domastore17?igsh=bXZ4NGZ2MnV5c21r" target="_blank" rel="noopener noreferrer">
            <img src={instagram_icon} alt="Instagram" />
          </a>
        </div>
        <div className="footer-icons-container">
          <a href="https://wa.me/message/GTJSO3MSQQHMJ1" target="_blank" rel="noopener noreferrer">
            <img src={whatsapp_icon} alt="WhatsApp" />
          </a>
        </div>
      </div>
      <div className="footer-copyright">
        <hr />
        <p>Copyright @ 2025 - All Rights Reserved</p>
      </div>
    </div>
  );
}

export default Footer;
