const Product = require('../models/Product');
const Users = require('../models/Users');

// Endpoint para agregar un producto al carrito

exports.addToCart = async (req, res) => {
    try {
        console.log(req.body);
        const { itemId, size, quantity } = req.body;

        // Validar entrada
        if (!itemId || !size || !quantity || quantity <= 0) {
            return res.status(400).json({ success: false, message: "ID del producto, talla y cantidad son obligatorios y deben ser válidos." });
        }

        // Buscar el ObjectId del producto
        const product = await Product.findOne({ id: itemId });
        if (!product) {
            return res.status(404).json({ success: false, message: "Producto no encontrado." });
        }

        // Verificar que el campo sizes esté definido
        if (!product.sizes || !product.sizes.has(size)) {
            return res.status(400).json({ success: false, message: `La talla ${size} no está disponible para este producto.` });
        }

        // Verificar la cantidad disponible en la talla especificada
        const availableQuantity = product.sizes.get(size);
        if (availableQuantity < quantity) {
            return res.status(400).json({ success: false, message: `Solo hay ${availableQuantity} unidades disponibles en la talla ${size}.` });
        }

        // Buscar el usuario
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        const existingCartItem = user.cartData.find(item => item.product_id.equals(product._id) && item.size === size);
        if (existingCartItem) {
            if (existingCartItem.quantity + quantity > availableQuantity) {
                return res.status(400).json({ success: false, message: `No puedes agregar más de ${availableQuantity} unidades en la talla ${size}.` });
            }
            existingCartItem.quantity += quantity;
        } else {
            user.cartData.push({ product_id: product._id, size, quantity });
        }

        // Guardar los cambios en el usuario
        await user.save();
        res.json({ success: true, message: "Producto agregado al carrito", cart: user.cartData });
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Endpoint para eliminar un producto del carrito

exports.removeFromCart = async (req, res) => {
    try {
        const { itemId, size } = req.body;

        if (!itemId || !size) {
            return res.status(400).json({ success: false, message: "ID del producto y talla son obligatorios." });
        }

        // Buscar el usuario
        const user = await Users.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado." });
        }

        // Eliminar el producto específico del carrito
        user.cartData = user.cartData.filter(item => {
            return !(item.product_id.equals(itemId) && item.size === size);
        });

        // Guardar los cambios en el usuario
        await user.save();

        res.json({ success: true, message: "Producto eliminado del carrito", cart: user.cartData });
    } catch (error) {
        console.error("Error al eliminar del carrito:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Endpoint para obtener el carrito de un usuario

exports.getCart = async (req, res) => {
    try {
        // Obtener el usuario con los productos del carrito ya poblados
        let user = await Users.findById(req.user.id).populate({
            path: 'cartData.product_id',
            select: 'name image new_price'
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        // Filtrar productos que realmente existen (por si algunos fueron eliminados)
        let validCartData = user.cartData.filter(item => item.product_id !== null);

        res.json({ success: true, cart: validCartData });
    } catch (error) {
        console.error("Error al obtener el carrito:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Endpoint para limpiar el carrito

exports.clearCart = async (req, res) => {
    try {
        // Buscar al usuario autenticado
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        // Si el carrito ya está vacío, evitar una operación innecesaria
        if (user.cartData.length === 0) {
            return res.json({ success: true, message: "El carrito ya está vacío" });
        }

        // Limpiar el carrito
        user.cartData = [];
        await user.save();

        res.json({ success: true, message: "Carrito limpiado correctamente" });
    } catch (error) {
        console.error("Error al limpiar el carrito:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
};

// Endpoint para actualizar el carrito

exports.updateCart = async (req, res) => {
    try {
        console.log(req.body)
        const { itemId, size, quantity } = req.body;

        // Validar entrada
        if (!itemId || !size || quantity === undefined || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: "ID del producto, talla y cantidad son obligatorios y deben ser válidos.",
            });
        }

        // Buscar el usuario autenticado
        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado.",
            });
        }

        // Verificar si el producto ya está en el carrito
        const existingCartItem = user.cartData.find(item => item.product_id.toString() === itemId && item.size === size);

        if (existingCartItem) {
            if (quantity > 0) {
                // Actualizar la cantidad del producto
                existingCartItem.quantity = quantity;
            } else {
                // Eliminar el producto si la cantidad es 0
                user.cartData = user.cartData.filter(item => !(item.product_id.toString() === itemId && item.size === size));
            }
        } else if (quantity > 0) {
            // Agregar el producto al carrito si no existe y la cantidad es mayor a 0
            user.cartData.push({ product_id: itemId, size, quantity });
        }

        // Guardar los cambios en el usuario
        await user.save();

        res.json({
            success: true,
            message: "Carrito actualizado correctamente.",
            cart: user.cartData,
        });
    } catch (error) {
        console.error("Error al actualizar el carrito:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor.",
        });
    }
};