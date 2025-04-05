const Product = require('../models/Product');
const Comment = require('../models/Comments');
const Users = require('../models/Users');

// Endpoint para obtener comentarios de un producto

exports.getCommentsByProduct = async (req, res) => {
    try {
        // Buscar el producto por su campo `id` (número)
        const product = await Product.findOne({ id: req.params.productId });
        if (!product) {
            return res.status(404).json({ success: false, message: "Producto no encontrado" });
        }

        // Buscar comentarios asociados al ObjectId del producto
        const comments = await Comment.find({ productId: product._id });
        res.json(comments);
    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Endpoint para agregar un comentario

exports.addComment = async (req, res) => {
    try {
        const { productId, text } = req.body;

        // Buscar el producto por su campo `id` (número)
        const product = await Product.findOne({ id: productId });
        if (!product) {
            return res.status(404).json({ success: false, message: "Producto no encontrado" });
        }

        // Obtener el usuario autenticado
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        // Crear y guardar el comentario con el ObjectId del producto
        const newComment = new Comment({
            productId: product._id,
            author: user.name, // Usar el nombre del usuario autenticado
            text,
        });
        await newComment.save();

        res.json({ success: true, comment: newComment });
    } catch (error) {
        console.error("Error al agregar comentario:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Endpoint para eliminar un comentario (solo admin)

exports.deleteComment = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Acceso denegado" });
        }

        const deletedComment = await Comment.findByIdAndDelete(req.params.id);
        if (!deletedComment) {
            return res.status(404).json({ success: false, message: "Comentario no encontrado" });
        }

        res.json({ success: true, message: "Comentario eliminado" });
    } catch (error) {
        console.error("Error al eliminar comentario:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};
