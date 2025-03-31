import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:4000/forgot-password', { email });
            Swal.fire({
                title: 'Éxito',
                text: response.data.message,
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error("Error al solicitar restablecimiento:", error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Hubo un problema. Inténtalo más tarde.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <div>
            <h1>Restablecer Contraseña</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Correo Electrónico:
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Enviar</button>
            </form>
        </div>
    );
};

export default ForgotPassword;