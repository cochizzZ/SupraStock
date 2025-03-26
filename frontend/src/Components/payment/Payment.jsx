import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Payment.css';

const stripePromise = loadStripe('pk_test_51R6cNaBLRCJFKBKAyV7gJZXyMuueasOHfiwItLDL7DuIh92NGsFOOO2dRsEHs6QOGO5sMk4FDM8gPqnTQm8870mf00feT86DeX'); // Reemplaza con tu clave pública de prueba

const PaymentForm = ({ totalAmount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsProcessing(true);

        try {
            // Crear un PaymentIntent desde el backend
            const response = await fetch('http://localhost:4000/api/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('auth-token'),
                },
                body: JSON.stringify({ amount: totalAmount * 100, currency: 'usd' }), // Monto en centavos
            });

            const { clientSecret } = await response.json();

            // Confirmar el pago con Stripe
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });

            if (result.error) {
                setMessage(`Error: ${result.error.message}`);
            } else if (result.paymentIntent.status === 'succeeded') {
                setMessage('¡Pago exitoso!');
                console.log('PaymentIntent:', result.paymentIntent);
            }
        } catch (error) {
            console.error('Error al procesar el pago:', error);
            setMessage('Hubo un error al procesar el pago.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <h2>Total a pagar: ${totalAmount}</h2>
            <CardElement className="card-element" />
            <button type="submit" disabled={!stripe || isProcessing}>
                {isProcessing ? 'Procesando...' : 'Pagar'}
            </button>
            {message && <p>{message}</p>}
        </form>
    );
};

const Payment = ({ totalAmount }) => (
    <Elements stripe={stripePromise}>
        <PaymentForm totalAmount={totalAmount} />
    </Elements>
);

export default Payment;