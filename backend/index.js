require('dotenv').config();
const port = process.env.PORT;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51R6cNaBLRCJFKBKAttNOUBrZeJ83hiT7urfBaLEhNONIKDeqO9YeiAUmn0Pq5Ox23iseYtgbKX10s2IJuxTO0UFk00wjtRk5MZ');
const { clear } = require("console");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const connectDB = require('./config/database');
const Product = require('./models/Product');
const Users = require('./models/Users');
const Order = require('./models/Orders');
const Comment = require('./models/Comments');
const validatePassword = require('./utils/validatePassword');
const { fetchUser } = require("./middlewares/authMiddleware.js");

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productsRoutes = require('./routes/productsRoutes');
const cartRoutes = require('./routes/cartRoutes');
const ordersRoutes = require('./routes/ordersRoutes');
const commentsRoutes = require('./routes/commentsRoutes');


// Conexión a la base de datos
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(authRoutes);
app.use(userRoutes);
app.use(productsRoutes);
app.use(cartRoutes);
app.use(ordersRoutes);
app.use(commentsRoutes);

// Creacion de API
app.get("/", (req, res) => {
    res.send("Express App is Running")
})

// Creacion de API para subir imagenes
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })

// Creacion de API para subir imagenes

app.use('/images', express.static('upload/images'))

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})

// Modificación en el endpoint de registro (signup)
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body)

        // Validar la contraseña
        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({
                success: false,
                message: passwordError,
            });
        }

        // Verificar si el correo ya está registrado
        let existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "El correo ya está registrado.",
            });
        }

        // Generar el "salt" y cifrar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generar un token único para la verificación
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Crear el nuevo usuario (sin activar)
        const user = new Users({
            name,
            email,
            password: hashedPassword,
            role: 'user',
            isVerified: false, // Nuevo campo para verificar si el usuario está autenticado
            verificationToken,
        });

        await user.save();

        // Configurar el transporte de correo
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'nata.ospinap@gmail.com',
                pass: 'aejx sqnh crfi wubd',
            },
        });

        // Enviar el correo de verificación
        const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;
        const mailOptions = {
            to: email,
            subject: 'Verificación de correo electrónico',
            text: `Haz clic en el siguiente enlace para verificar tu correo electrónico: ${verificationUrl}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "Cuenta creada. Por favor, verifica tu correo electrónico para activar tu cuenta.",
        });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
});


// Modificación en el endpoint de login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    console.log("User:", user);
    if (user) {
        const passCompare = await bcrypt.compare(req.body.password, user.password);
        if (passCompare) {
            const data = { user: { id: user._id } };
            const token = jwt.sign(data, 'secret_ecom');
            console.log("_id:", user._id);
            console.log("data:", data.user.id);
            if (user.role === 'admin') {
                return res.json({
                    success: true,
                    token,
                    userId: user._id, // ← Enviar el userId al frontend
                    role: 'admin',
                    username: user.name
                });
            } else {
                return res.json({
                    success: true,
                    token,
                    userId: user._id, // ← Enviar el userId al frontend
                    username: user.name
                });
            }
        } else {
            return res.json({ success: false, errors: "Contraseña incorrecta" });
        }
    } else {
        return res.json({ success: false, errors: "ID de correo electrónico incorrecto" });
    }
});

// Iniciar el servidor
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port" + port)
    }
    else {
        console.log("Error : " + error)
    }
})