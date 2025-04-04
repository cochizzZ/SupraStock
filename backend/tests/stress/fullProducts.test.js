import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    stages: [
        { duration: '10s', target: 100 }, // Ramp-up to 100 users over 10 seconds
        { duration: '10s', target: 100 }, // Stay at 100 users for 20 seconds
        { duration: '10s', target: 0 },   // Ramp-down to 0 users over 10 seconds
    ],
    thresholds: {
        http_req_duration: ['p(95)<5000'], // 95% of requests should be below 500ms
        http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
    },
};

export default function () {
    const res = http.get("http://localhost:4000/fullProducts"); // Replace with your actual endpoint URL

    const checkRes = check(res, {
        'respuesta status es 200': (r) => r.status === 200,
        'respuesta body no esta vacio': (r) => r.body && r.body.length > 0,
        'respuesta body es json': (r) => {
            try {
                JSON.parse(r.body); // Parse the response body as JSON
                return true; // If parsing is successful, return true
            } catch (error) {
                return false; // Return false if parsing fails
            }
        },
    });

    if (!checkRes) {
        console.error(`Fallo en la validación: ${res.status}`);
    }

    sleep(1); // Sleep for 1 second between iterations
}