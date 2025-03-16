const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Asegúrate de que el modelo está bien importado
const mongoose = require('mongoose');

// Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

// Eliminar un usuario por ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID no válido" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "ID no válido" });
      }
  
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
  
      res.json(user);
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  });
  
module.exports = router;
