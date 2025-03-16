import React from 'react';
import './Sidebar.css';
import { Link } from 'react-router-dom';
import dashboard_icon from '../../assets/dashboard_icon.svg';
import add_product_icon from '../../assets/Product_Cart.svg';
import list_product_icon from '../../assets/Product_list_icon.svg';
import orders_icon from '../../assets/orders_icon.svg';
import users_icon from '../../assets/users_icon.svg'; // Asegúrate de agregar este icono en assets
import logout_icon from '../../assets/logout-svgrepo-com.svg';

const Sidebar = () => {
  return (
    <div className='sidebar'>
        <Link to={'/dashboard'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={dashboard_icon} alt="Dashboard" />
                <p>Dashboard</p>
            </div>
        </Link>
        <Link to={'/addproduct'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={add_product_icon} alt="Agregar Producto" />
                <p>Agregar Producto</p>
            </div>
        </Link>
        <Link to={'/listproduct'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={list_product_icon} alt="Lista de productos" />
                <p>Lista de productos</p>
            </div>
        </Link>
        <Link to={'/orders'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={orders_icon} alt="Lista de Órdenes" />
                <p>Lista de Órdenes</p>
            </div>
        </Link>
        <Link to={'/users'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={users_icon} alt="Lista de Usuarios" />
                <p>Lista de Usuarios</p>
            </div>
        </Link>
        <Link to={'/logout'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={logout_icon} alt="Cerrar sesión" />
                <p>Cerrar sesión</p>
            </div>
        </Link>
    </div>
  );
};

export default Sidebar;
