const Product = require('../models/Product');
const Users = require('../models/Users');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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