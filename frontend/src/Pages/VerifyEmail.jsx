import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const VerifyEmail = () => {
    const { token } = useParams();
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(`http://localhost:4000/verify-email/${token}`);
                setMessage(response.data.message);
                Swal.fire({
                    title: "Éxito",
                    text: response.data.message,
                    icon: "success",
                    confirmButtonText: "OK",
                });
            } catch (error) {
                console.error("Error al verificar el correo:", error);
                Swal.fire({
                    title: "Error",
                    text: error.response?.data?.message || "Hubo un problema al verificar el correo.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="verify-email-container">
            <h1>{message}</h1>
        </div>
    );
};

export default VerifyEmail;