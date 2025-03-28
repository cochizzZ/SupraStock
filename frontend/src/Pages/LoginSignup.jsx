import React, { useState, useContext } from 'react';
import './CSS/LoginSignup.css';
import { ShopContext } from '../Context/ShopContext';
import axios from 'axios'; // Importar axios
import Swal from 'sweetalert2'; // Importar SweetAlert2

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
      state === "Iniciar Sesión" ? login() : handleSignup();
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
          localStorage.setItem('userRole', 'admin');
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

  const handleSignup = async () => {
    try {
        console.log("SignUp Function Executed", formData);

        const response = await axios.post("http://localhost:4000/signup", formData, {
            headers: { "Content-Type": "application/json" }
        });

        const responseData = response.data;

        if (responseData.success) {
            // Guardar datos en localStorage
            localStorage.setItem("auth-token", responseData.token);
            localStorage.setItem("username", responseData.username);
            localStorage.setItem("userId", responseData.userId);

            console.log("Usuario registrado con éxito:", responseData);

            // Restaurar los productos seleccionados en el carrito
            const selectedProducts = JSON.parse(localStorage.getItem("selectedProducts")) || [];
            if (selectedProducts.length > 0) {
                for (const product of selectedProducts) {
                    await axios.post("http://localhost:4000/addtocart", {
                        itemId: product.productId,
                        quantity: product.quantity,
                    }, {
                        headers: { "auth-token": responseData.token }
                    });
                }
                localStorage.removeItem("selectedProducts"); // Limpiar productos seleccionados
            }

            // Redirigir al usuario
            window.location.replace("/");
        } else {
            Swal.fire({
                title: "Error",
                text: responseData.errors || "Hubo un problema con el registro.",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    } catch (error) {
        console.error("Error al registrarse:", error);
        Swal.fire({
            title: "Error",
            text: "No se pudo completar el registro. Inténtalo más tarde.",
            icon: "error",
            confirmButtonText: "OK"
        });
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
        <button onClick={() => { state === "Iniciar Sesión" ? login() : handleSignup() }}>Continuar</button>
        {state === "Registro"
          ? <p className="loginsignup-login">¿Ya tienes una cuenta? <span id="span-login" onClick={() => { setState("Iniciar Sesión") }}>Inicia sesión aquí</span></p>
          : <p className="loginsignup-login">¿Crear una cuenta? <span id="span-login" onClick={() => { setState("Registro") }}>Haz clic aquí</span></p>}
      </div>
    </div>
  );
};

export default LoginSignup;