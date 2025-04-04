//const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

exports.allProducts = async (req, res) => {
    try {
        const products = await Product.find({ available: true });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.removeProduct = async (req, res) => {
    try {
        let producto = await Product.findOne({ id: req.body.id });
        if (!producto) {
            return res.status(404).json({ success: false, message: "Producto no encontrado" });
        }

        console.log(producto);
        producto.available = false;
        await producto.save();

        console.log("Producto actualizado a no disponible");
        res.json({
            success: true,
            message: "Producto actualizado a no disponible",
            name: req.body.name
        });
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

exports.addProduct = async (req, res) => {
    try {
        let products = await Product.find({});
        let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

        const { name, image, category, new_price, old_price, description, stock, sizes } = req.body;

        // Validar que los campos obligatorios no estén vacíos
        if (!name || !image || !category || !new_price || stock === undefined || sizes === undefined) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos (name, image, category, new_price, stock, sizes) son obligatorios.",
            });
        }

        const product = new Product({
            id: id,
            name: name,
            image: image,
            category: category,
            new_price: new_price,
            old_price: old_price || 0,
            description: description,
            sizes: sizes,
            stock: stock
        });

        await product.save();
        console.log("Producto guardado:", product);

        res.json({
            success: true,
            message: "Producto agregado correctamente",
        });
    } catch (error) {
        console.error("Error al agregar producto:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
};

exports.fullProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.newCollections = async (req, res) => {
    let products = await Product.find({ available: true });
    let newcollection = products.slice(0).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
};

exports.popularinWomen = async (req, res) => {
    try {
        const popular_in_women = await Product.find({ category: "women", available: true }) // Filtrar por categoría y disponibilidad
            .sort({ date: -1 }) // Ordenar por fecha de creación descendente
            .limit(4); // Limitar a los 4 productos más recientes

        console.log("Popular in women fetched");
        res.status(200).json(popular_in_women);
    } catch (error) {
        console.error("Error fetching popular in women:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id, name, description, new_price, old_price, category, image, stock, sizes } = req.body;

        // Validar que los campos obligatorios no estén vacíos
        if (!id || !name || !description || !new_price || !category || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos (id, name, description, new_price, category, stock) son obligatorios.",
            });
        }

        // Validar que la cantidad total de tallas no sea mayor que el stock general
        const totalSizeStock = Object.values(sizes).reduce((acc, curr) => acc + parseInt(curr), 0);
        if (totalSizeStock > stock) {
            return res.status(400).json({
                success: false,
                message: "La cantidad total de tallas no puede ser mayor que la cantidad de stock general.",
            });
        }

        // Determinar el estado de disponibilidad basado en el stock
        const available = stock > 0;

        const updatedProduct = await Product.findOneAndUpdate(
            { id: id },
            { name, description, new_price, old_price, category, image, stock, available, sizes },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado.",
            });
        }

        res.json({
            success: true,
            message: "Producto actualizado correctamente",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
};

//Endpoint para obtener detalles de un producto
exports.productDetails = async (req, res) => {
    try {
        console.log("Product ID:", req.params.productId);
        const product = await Product.findById(req.params.productId);
        console.log("Product:", product);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};