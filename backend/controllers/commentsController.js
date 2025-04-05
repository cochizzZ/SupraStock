const Product = require('../models/Product');
const Comment = require('../models/Comments');
const Users = require('../models/Users');

// Endpoint para obtener comentarios de un producto

exports.getCommentsByProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    // Validar que productId sea un número válido
    if (!Number.isInteger(Number(productId))) {
      return res.status(400).json({
        success: false,
        message: 'El ID del producto debe ser un número válido.',
      });
    }

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const comments = await Comment.find({ productId: product._id });
    res.json(comments);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// Endpoint para agregar un comentario

exports.addComment = async (req, res) => {
  try {
    const { productId, text } = req.body;

    // Validaciones
    if (!productId || !text) {
      return res.status(400).json({
        success: false,
        message: 'El ID del producto y el texto son obligatorios.',
      });
    }

    if (!Number.isInteger(Number(productId))) {
      return res.status(400).json({
        success: false,
        message: 'El ID del producto debe ser un número válido.',
      });
    }

    if (typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El texto del comentario no puede estar vacío.',
      });
    }

    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Producto no encontrado' });
    }

    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Crear y guardar el comentario
    const newComment = new Comment({
      productId: product._id,
      author: user.name,
      text,
    });
    const savedComment = await newComment.save();

    // Responder con el comentario guardado
    res.json({ success: true, comment: savedComment });
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
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
