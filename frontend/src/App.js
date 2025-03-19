import React from 'react';
import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Shop from './Pages/Shop';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import Cart from './Pages/Cart';
import Footer from './Components/Footer/Footer';
import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kid_banner from './Components/Assets/banner_kids.png';
import UserProfile from './Pages/UserProfile';
import UserOrders from './Components/UserOrders/UserOrders';
import Cartitems from './Components/Cartitems/Cartitems';
import ShopContextProvider from './Context/ShopContext';
import OrderForm from './Components/OrderForm/OrderForm';
import LoginSignup from './Pages/LoginSignup';
import AboutUs from './Pages/AboutUs';

const App = () => {
    return (
        <ShopContextProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path='/' element={<Shop />} />
                    <Route path="/login" element={<LoginSignup />} />
                    <Route path='/about' element={<AboutUs />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/orders" element={<UserOrders />} />
                    <Route path='/mens' element={<ShopCategory banner={men_banner} category="men" />} />
                    <Route path='/womens' element={<ShopCategory banner={women_banner} category="women" />} />
                    <Route path='/kids' element={<ShopCategory banner={kid_banner} category="kid" />} />
                    <Route path="/product" element={<Product />}>
                        <Route path=':productId' element={<Product />} />
                    </Route>
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/login' element={<LoginSignup />} />
                    <Route path="/" element={<Cartitems />} />
                    <Route path="/order" element={<OrderForm />} />
                </Routes>
                <Footer />
            </Router>
        </ShopContextProvider>
    );
};

export default App;
