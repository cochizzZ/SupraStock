import React from 'react'
import './Footer.css'
import footer_logo from '../Assets/logo.jpg'
import instagram_icon from '../Assets/instagram_icon.png'
import whatsapp_icon from '../Assets/whatsapp_icon.png'

const Footer = () => {
  return (
    <div className='footer'>
      <div className="footer-logo">
        <img src={footer_logo} alt="" />
        <p>BoutiqueAntojitos</p>
      </div>
      <ul className="footer-links">
        <li>¿Quienes somos?</li>
        <li>Ayuda</li>
        <li>Contacto</li>
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
        <p>Copyright @ 2025 - All Right Reserved</p>
      </div>
    </div>
  )
}

export default Footer
