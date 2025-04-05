const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Ruta para servir imágenes estáticas
router.use('/images', express.static('upload/images'));

// Ruta para subir imágenes
router.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${process.env.PORT}/images/${req.file.filename}`
    });
});

module.exports = router;