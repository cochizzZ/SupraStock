import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const { token } = useParams(); // Obtener el token desde la URL
    const [newPassword, setNewPassword] = useState('');

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
        if (!regex.test(password)) {
            console.log(password)
            return "La contraseña debe contener al menos 8 caracteres, una mayúscula, una minúscula y un carácter especial.";
        }
        return null; // Si la contraseña es válida, no hay error
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            Swal.fire({
                title: "Cambio de contraseña fallido",
                text: passwordError, // Mostrar el mensaje devuelto por la función
                icon: "error",
                confirmButtonText: "OK",
            });
            return;
        }

        try {
            const response = await axios.post(`http://localhost:4000/reset-password/${token}`, { newPassword });
            Swal.fire({
                title: "Éxito",
                text: "Tu contraseña ha sido actualizada correctamente.",
                icon: "success",
                confirmButtonText: "OK",
            });
        } catch (error) {
            console.error("Error al cambiar la contraseña:", error);
            Swal.fire({
                title: "Error",
                text: error.response?.data?.message || "Hubo un problema. Inténtalo más tarde.",
                icon: "error",
                confirmButtonText: "OK",
            });
        }
    };

    return (
        <div className="forgot-password-container">
            <h1>Establecer Nueva Contraseña</h1>
            <form onSubmit={handlePasswordChange}>
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