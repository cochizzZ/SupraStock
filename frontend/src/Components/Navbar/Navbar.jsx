import React, { useState, useRef, useContext } from 'react';
import './Navbar.css';
import logo from '../Assets/logo.jpg';
import cart_icon from '../Assets/cart_icon.png';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import { UserContext } from '../../Context/UserContext';
import nav_dropdown from '../Assets/nav_dropdown.png';
import SearchBar from '../SearchBar/SearchBar';
import SearchModal from '../SearchModal/SearchModal';

const Navbar = () => {
  const [menu, setMenu] = useState("shop");
  const { getTotalCartItems } = useContext(ShopContext);
  const { user } = useContext(UserContext);
  const menuRef = useRef(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  };

  const handleSearch = () => {
    setIsModalOpen(true);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.replace('/');
  };

  return (
    <div className='navbar'>
      <a id="nav-logo-click" href="/">
        <div className="nav-logo">
          <img src={logo} alt="" />
        </div>
      </a>
      <SearchBar onSearch={handleSearch} />
      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <img className='nav-dropdown' onClick={dropdown_toggle} src={nav_dropdown} alt='dropdown button' />
      <ul ref={menuRef} className="nav-menu">
        <li onClick={() => { setMenu("shop") }}><Link style={{ textDecoration: 'none' }} to='/'>Tienda</Link>{menu === "shop" ? <hr /> : <></>}</li>
        <li onClick={() => { setMenu("mens") }}><Link style={{ textDecoration: 'none' }} to='/mens'>Hombres</Link>{menu === "mens" ? <hr /> : <></>}</li>
        <li onClick={() => { setMenu("womens") }}><Link style={{ textDecoration: 'none' }} to='/womens'>Mujeres</Link>{menu === "womens" ? <hr /> : <></>}</li>
        <li onClick={() => { setMenu("kids") }}><Link style={{ textDecoration: 'none' }} to='/kids'>Niños</Link>{menu === "kids" ? <hr /> : <></>}</li>
      </ul>
      <div className="nav-login-cart">
        {!localStorage.getItem('auth-token') && <Link to='/login'><button className='login-button'>Iniciar Sesión</button></Link>}
        <Link to='/cart'><img className="cart-img" src={cart_icon} alt="" /></Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
        {user && (
          <div className="navbar-user">
            <button onClick={toggleDropdown} className="dropdown-toggle">
              {user.name} <span className="dropdown-icon">▼</span>
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <p>{user.name}</p>
                <Link to="/profile">Perfil</Link>
                <Link to="/orders">Historial de Compras</Link> {/* Agregar Historial de Compras */}
                {user.role === 'admin' && <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">Panel de Admin</a>}
                <button onClick={handleLogout} className="logout-button">Cerrar Sesión</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;