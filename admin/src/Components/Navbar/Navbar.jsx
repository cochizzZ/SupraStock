import React from 'react';
import { Link } from 'react-router-dom'; // Importamos Link
import './Navbar.css';
import navlogo from '../../assets/nav-logo.svg';

const Navbar = () => {
  return (
    <div className='navbar'>
      <Link to="/" className="nav-home"> {/* Enlace envolviendo logo y título */}
        <img src={navlogo} alt="Logo" className="nav-logo" />
        <h1 className="nav-title">Panel de Administrador</h1>
      </Link>
    </div>
  );
}

export default Navbar;
