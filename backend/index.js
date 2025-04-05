require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const connectDB = require('./config/database');

const app = express();
const port = process.env.PORT;

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productsRoutes = require('./routes/productsRoutes');
const cartRoutes = require('./routes/cartRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conexión a la base de datos
connectDB();

app.use(uploadRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(productsRoutes);
app.use(cartRoutes);
app.use(ordersRoutes);
app.use(commentsRoutes);

// Iniciar el servidor
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port" + port)
    }
    else {
        console.log("Error : " + error)
    }
})