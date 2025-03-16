import React, { useState } from 'react';
import './CSS/LoginSignup.css';

const LoginSignup = () => {
  const [state, setState] = useState("Iniciar Sesión");
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: ""
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    if (responseData.success && responseData.role === 'admin') {
      localStorage.setItem('auth-token', responseData.token);
      localStorage.setItem('username', responseData.username);
      window.open("http://localhost:5173/?token=" + responseData.token, "_blank");
      window.location.replace("/");
    } else if (responseData.success) {
      localStorage.setItem('auth-token', responseData.token);
      localStorage.setItem('username', responseData.username);
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
          {state === "Registro" ? <input name='name' value={formData.name} onChange={changeHandler} type="text" placeholder='Tu nombre' /> : <></>}
          <input name='email' value={formData.email} onChange={changeHandler} type="email" placeholder='Correo Electrónico' />
          <input name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='Contraseña' />
        </div>
        <button onClick={() => { state === "Iniciar Sesión" ? login() : signup() }}>Continuar</button>
        {state === "Registro"
          ? <p className="loginsignup-login">¿Ya tienes una cuenta? <span id="span-login" onClick={() => { setState("Iniciar Sesión") }}>Inicia sesión aquí</span></p>
          : <p className="loginsignup-login">¿Crear una cuenta? <span id="span-login" onClick={() => { setState("Registro") }}>Haz clic aquí</span></p>}
        <div className="loginsignup-agree">
          <input type="checkbox" name='' id='' />
          <p>Al continuar, acepto los términos de uso y la política de privacidad.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;