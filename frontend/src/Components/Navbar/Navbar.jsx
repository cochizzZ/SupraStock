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

  const getUsername = () => {
    if (localStorage.getItem('auth-token')) {
      return localStorage.getItem('username');
    }
  };

  const dropdown_toggle = (e) => {
    menuRef.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  };

  const handleSearch = () => {
    setIsModalOpen(true);
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
        {localStorage.getItem('auth-token')
          ? <button onClick={() => {
            localStorage.removeItem('auth-token');
            localStorage.removeItem('username');
            window.location.replace('/');
          }}>
            Logout
          </button>

          : <Link to='/login'><button>Login</button></Link>}
        <Link to='/cart'><img className="cart-img" src={cart_icon} alt="" /></Link>
        <div className="nav-cart-count">{getTotalCartItems()}</div>
        {user && <Link to="/profile" className="username">{user.name}</Link>}
      </div>
      
    </div>
  );
};

export default Navbar;