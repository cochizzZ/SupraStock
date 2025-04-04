const jwt = require("jsonwebtoken");
const Users = require("../models/Users");

exports.fetchUser = async (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({ message: "Autenticación requerida" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await Users.findById(decoded.user.id);
        next();
    } catch (error) {
        res.status(401).json({ message: "Token inválido" });
    }
};