import React from 'react'
import './Sidebar.css'
import {Link} from 'react-router-dom'
import add_product_icon from '../../assets/Product_Cart.svg'
import list_product_icon from '../../assets/Product_list_icon.svg'
import logout_icon from '../../assets/logout-svgrepo-com.svg'

const Sidebar = () => {
  return (
    <div className='sidebar'>
        <Link to={'/addproduct'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={add_product_icon} alt="" />
                <p>Agregar Producto</p>
            </div>
        </Link>
        <Link to={'/listproduct'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={list_product_icon} alt="" />
                <p>Lista de productos</p>
            </div>
        </Link>
        <Link to={'/logout'} style={{textDecoration: "none"}}>
            <div className="sidebar-item">
                <img src={logout_icon} alt="" />
                <p>Cerrar sesión</p>
            </div>
        </Link>
    </div>
  )
}

export default Sidebar