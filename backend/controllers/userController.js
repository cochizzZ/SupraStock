const Product = require('../models/Product');
const Users = require('../models/Users');
const mongoose = require('mongoose');
const validatePassword = require('../utils/validatePassword');

exports.user = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        res.json({ user });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone, address, city, postal_code } = req.body;
        const user = await Users.findByIdAndUpdate(
            req.user.id,
            { name, email, phone, address, city, postal_code },
            { new: true }
        );
        res.json({ success: true, user });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Endpoint para obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await Users.find({});
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};

// Endpoint para actualizar datos de un usuario
exports.updateUserData = async (req, res) => {
    try {
        const { name, email, photo, address, phone, role } = req.body;
        const userId = req.params.id;

        // Verificar si el usuario existe
        let user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        // Actualizar el usuario
        user = await Users.findByIdAndUpdate(userId, { name, email, photo, address, phone, role }, { new: true });

        res.json({ success: true, message: "Usuario actualizado", user });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
};

// Endpoint para eliminar un usuario
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("ID recibido en el backend:", id); // 👀 Verifica si el ID llega correctamente

        // Verificar si el ID es válido en MongoDB
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID no válido" });
        }

        const deletedUser = await Users.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Endpoint para obtener a un usuario
exports.getUser = async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Endpoint para solicitar restablecimiento de contraseña
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        // Generar un token único
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hora de validez

        // Guardar el token y su expiración en el usuario
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Configurar el transporte de correo
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'nata.ospinap@gmail.com',
                pass: 'aejx sqnh crfi wubd',
            },
        });

        // Enviar el correo con el enlace de restablecimiento
        const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
        const mailOptions = {
            to: user.email,
            subject: 'Restablecimiento de contraseña',
            text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetUrl} esta url es valida por 1 hora`,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Correo de restablecimiento enviado" });
    } catch (error) {
        console.error("Error al solicitar restablecimiento de contraseña:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Endpoint para restablecer la contraseña
exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Validar la contraseña
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            return res.status(400).json({ success: false, message: passwordError });
        }

        const user = await Users.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Verificar que el token no haya expirado
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Token inválido o expirado" });
        }

        // Actualizar la contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined; // Eliminar el token
        user.resetPasswordExpires = undefined; // Eliminar la expiración
        await user.save();

        res.json({ success: true, message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.error("Error al restablecer contraseña:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Endpoint para verificar el token de restablecimiento de contraseña
exports.verifyResetToken = async (req, res) => {
    try {
        const { token } = req.params;

        // Buscar al usuario por el token de verificación
        const user = await Users.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Token de verificación inválido o expirado.",
            });
        }

        // Activar la cuenta del usuario
        user.isVerified = true;
        user.verificationToken = undefined; // Eliminar el token de verificación
        await user.save();

        res.json({
            success: true,
            message: "Correo verificado correctamente. Ahora puedes iniciar sesión.",
        });
    } catch (error) {
        console.error("Error al verificar el correo:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
};
// Endpoint para verificar si el correo ya está registrado
exports.checkEmail = async (req, res) => {
    const email = req.body.email;

    try {
        // Verificar si el correo ya está registrado
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(200).json({ success: false, message: "El correo ya está registrado." });
        }

        res.status(200).json({ success: true, message: "El correo está disponible." });
    } catch (error) {
        console.error("Error al verificar el correo:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor." });
    }
};
