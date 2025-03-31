import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const { token } = useParams(); // Obtener el token desde la URL
    const [newPassword, setNewPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`http://localhost:4000/reset-password/${token}`, { newPassword });
            Swal.fire({
                title: 'Éxito',
                text: response.data.message,
                icon: 'success',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error("Error al restablecer contraseña:", error);
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
            <h1>Establecer Nueva Contraseña</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Nueva Contraseña:
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit">Restablecer</button>
            </form>
        </div>
    );
};

export default ResetPassword;