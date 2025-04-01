import React, { useState } from "react";
import emailjs from "emailjs-com";
import "./NewsLetter.css";

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Por favor, introduce un correo válido.");
      return;
    }

    // Parámetros que se enviarán a EmailJS (deben coincidir con los de la plantilla)
    const templateParams = {
      user_email: email, // Asegúrate de que la variable coincide con la plantilla
    };

    emailjs
      .send(
        "service_6b4pczn", // Reemplaza con tu Service ID
        "template_f5qqlbk", // Reemplaza con tu Template ID
        templateParams,
        "pCiLGuVDOzMzIJ2Jl" // Reemplaza con tu Public Key
      )
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          setMessage("¡Suscripción exitosa! Revisa tu correo.");
          setEmail("");
        },
        (error) => {
          console.error("Error al enviar el correo: ", error);
          setMessage("Hubo un error. Inténtalo nuevamente.");
        }
      );
  };

  return (
    <div className="newsletter">
      <h1>Obtén Ofertas Exclusivas</h1>
      <p>Suscríbete a nuestra tienda y mantente actualizado</p>
      <form onSubmit={handleSubscribe}>
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Suscribirse</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default NewsLetter;
