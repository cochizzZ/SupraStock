const Users = require('../models/Users');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const validatePassword = require('../utils/validatePassword');
const bcrypt = require("bcryptjs");
const validateName = require('../utils/validateName');
const testingUser = "AlexanderMoneque"

// Endpoint para verificar el rol de administrador

exports.verifyAdmin = async (req, res) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ success: false, errors: "Autenticación requerida: ingresa un token válido" });
    }
    try {
        const data = jwt.verify(token, 'secret_ecom');
        const user = await Users.findById(data.user.id);
        if (user.role !== 'admin') {
            return res.status(403).send({ success: false, errors: "Acceso denegado: no tienes permisos de administrador" });
        }
        res.send({ success: true });
    } catch (error) {
        res.status(401).send({ success: false, errors: "Autenticación requerida: ingresa un token válido" });
    }
};

// Endpoint de registro de usuario

exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validar el nombre del usuario
        const nameError = validateName(name);
        if (nameError) {
            return res.status(400).json({
                success: false,
                message: nameError,
            });
        }

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

        if (testingUser === name) {
            // Activar automáticamente el usuario si es el usuario de prueba
            user.active = true;
            await user.save();
            return res.status(200).json({
                success: true,
                message: "Usuario de prueba activado automáticamente.",
            });
        }


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

        return res.json({
            success: true,
            message: "Cuenta creada. Por favor, verifica tu correo electrónico para activar tu cuenta.",
        });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
};

// Endpoint de inicio de sesión

exports.login = async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    console.log("User:", user);
    if (user) {
        const passCompare = await bcrypt.compare(req.body.password, user.password);
        if (passCompare) {
            // Validar si el usuario está activo
            if (!user.active) {
                return res.json({
                    success: false,
                    errors: "Usuario desactivado por la administración, comunícate por medio de la sección de contacto",
                });
            }

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
};