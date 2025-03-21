import React, { useState, useContext } from 'react';
import './CSS/LoginSignup.css';
import { ShopContext } from '../Context/ShopContext';

const LoginSignup = () => {
  const { handleLogin } = useContext(ShopContext);
  const [state, setState] = useState("Iniciar Sesión");
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: ""
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      state === "Iniciar Sesión" ? login() : signup();
    }
  };

  const login = async () => {
    console.log("Login Function Executed", formData);
    let responseData;
    await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
            Accept: 'application/form-data',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        localStorage.setItem('username', responseData.username);
        localStorage.setItem('userId', responseData.userId);
        if (responseData.role === 'admin'){
          window.open("http://localhost:5173/?token=" + responseData.token, "_blank");
        }
        // Restaurar los productos seleccionados en el carrito
        const selectedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
        if (selectedProducts.length > 0) {
            for (const product of selectedProducts) {
                await fetch("http://localhost:4000/addtocart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": responseData.token
                    },
                    body: JSON.stringify({ itemId: product.productId, quantity: product.quantity })
                });
            }
            localStorage.removeItem('selectedProducts'); // Limpiar los productos seleccionados
        }

        window.location.replace("/");
    } else {
        alert(responseData.errors);
    }
};

const signup = async () => {
    console.log("SignUp Function Executed", formData);
    let responseData;
    await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
            Accept: 'application/form-data',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    }).then((response) => response.json()).then((data) => responseData = data);

    if (responseData.success) {
        localStorage.setItem('auth-token', responseData.token);
        localStorage.setItem('username', responseData.username);
        localStorage.setItem('userId', responseData.userId);

        // Restaurar los productos seleccionados en el carrito
        const selectedProducts = JSON.parse(localStorage.getItem('selectedProducts')) || [];
        if (selectedProducts.length > 0) {
            for (const product of selectedProducts) {
                await fetch("http://localhost:4000/addtocart", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": responseData.token
                    },
                    body: JSON.stringify({ itemId: product.productId, quantity: product.quantity })
                });
            }
            localStorage.removeItem('selectedProducts'); // Limpiar los productos seleccionados
        }

        window.location.replace("/");
    } else {
        alert(responseData.errors);
    }
};

  return (
    <div className='loginsignup'>
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Registro" ? <input name='name' value={formData.name} onChange={changeHandler} onKeyDown={handleKeyDown} type="text" placeholder='Tu nombre' /> : <></>}
          <input name='email' value={formData.email} onChange={changeHandler} onKeyDown={handleKeyDown} type="email" placeholder='Correo Electrónico' />
          <input name='password' value={formData.password} onChange={changeHandler} onKeyDown={handleKeyDown} type="password" placeholder='Contraseña' />
        </div>
        <button onClick={() => { state === "Iniciar Sesión" ? login() : signup() }}>Continuar</button>
        {state === "Registro"
          ? <p className="loginsignup-login">¿Ya tienes una cuenta? <span id="span-login" onClick={() => { setState("Iniciar Sesión") }}>Inicia sesión aquí</span></p>
          : <p className="loginsignup-login">¿Crear una cuenta? <span id="span-login" onClick={() => { setState("Registro") }}>Haz clic aquí</span></p>}
      </div>
    </div>
  );
};

export default LoginSignup;