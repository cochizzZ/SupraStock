const Order = require('../models/Orders');
const Product = require('../models/Product');
const Users = require('../models/Users');
const mongoose = require('mongoose');
const stripe = require('stripe')('sk_test_51R6cNaBLRCJFKBKAttNOUBrZeJ83hiT7urfBaLEhNONIKDeqO9YeiAUmn0Pq5Ox23iseYtgbKX10s2IJuxTO0UFk00wjtRk5MZ');

exports.addOrder = async (req, res) => {
    try {
        const { user_id, products, total, customer_info } = req.body;

        if (!user_id || !products || !total || !customer_info) {
            return res.status(400).json({
                success: false,
                message: "Los campos user_id, products, total y customer_info son obligatorios.",
            });
        }

        const order = new Order({
            user_id,
            products,
            total,
            customer_info,
            status: 'Pending',
        });

        await order.save();
        console.log("Orden guardada:", order);

        res.json({
            success: true,
            message: "Orden agregada correctamente",
        });
    } catch (error) {
        console.error("Error al agregar orden:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate({
                path: 'products.product_id',
                select: 'name image', // Selecciona los campos necesarios
            })
            .populate({
                path: 'user_id',
                select: 'name email phone', // Incluye el nombre y el email del usuario
            });

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).send(error);
    }
};

// Endpoint para obtener las órdenes de un usuario específico
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user.id });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};

// Endpoint para actualizar una orden
exports.updateOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const updatedOrder = await Order.findByIdAndUpdate(orderId, req.body, { new: true });
        if (!updatedOrder) {
            return res.status(404).send('Order not found');
        }
        res.send(updatedOrder);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Endpoint para actualizar el estado de una orden
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID de la orden desde los parámetros
        const { status } = req.body; // Obtener el nuevo estado desde el cuerpo de la solicitud

        // Buscar la orden por ID
        const order = await Order.findById(id).populate('products.product_id'); // Poblar los productos para acceder a sus detalles

        if (!order) {
            return res.status(404).json({ message: "Orden no encontrada" });
        }

        // Si el estado cambia a "Shipped", actualizar las cantidades de los productos
        if (status === "Shipped") {
            for (const productItem of order.products) {
                const product = productItem.product_id; // Producto asociado
                const size = productItem.size; // Talla del producto
                const quantity = productItem.quantity; // Cantidad de la talla

                // Verificar si el producto y la talla existen
                if (product && product.sizes.has(size)) {
                    // Reducir la cantidad de la talla
                    const currentSizeStock = product.sizes.get(size);
                    product.sizes.set(size, currentSizeStock - quantity);

                    // Actualizar el stock general
                    const totalStock = Array.from(product.sizes.values()).reduce((acc, curr) => acc + curr, 0);
                    product.stock = totalStock;

                    // Guardar los cambios en el producto
                    await product.save();
                } else {
                    return res.status(400).json({
                        message: `La talla ${size} no está disponible para el producto ${product.name}.`,
                    });
                }
            }
        }

        // Actualizar el estado de la orden
        order.status = status;
        const updatedOrder = await order.save();

        res.json(updatedOrder); // Enviar la orden actualizada como respuesta
    } catch (error) {
        console.error("Error al actualizar la orden:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Endpoint para crear una orden 
exports.createOrder = async (req, res) => {
    try {
        const { user_id, products, total, address, city, postal_code, payment_info } = req.body;
        console.log("Orden recibida:", req.body);

        // Validar que todos los campos obligatorios estén presentes
        if (!user_id || !products || !total || !address || !city || !postal_code || !payment_info) {
            return res.status(400).json({
                success: false,
                message: "Los campos user_id, products, total, address, city, postal_code y payment_info son obligatorios.",
            });
        }

        // Validar que todos los productos tengan un _id válido
        if (products.some(p => !mongoose.Types.ObjectId.isValid(p.product_id))) {
            return res.status(400).json({
                success: false,
                message: "Uno o más product_id no son válidos.",
            });
        }

        // Ajustar la fecha a la zona horaria de Colombia
        const now = new Date();
        const colombiaOffset = -5 * 60; // Colombia está en UTC-5
        const localOffset = now.getTimezoneOffset();
        const colombiaTime = new Date(now.getTime() + (colombiaOffset - localOffset) * 60 * 1000);

        // Crear la nueva orden con los datos proporcionados
        const newOrder = new Order({
            user_id,
            products, // Usar directamente los productos proporcionados
            total,
            address,
            city,
            postal_code,
            payment_info,
            status: 'Pending',
            date: colombiaTime, // Establecer la fecha ajustada
        });

        console.log("Orden creada:", newOrder);
        await newOrder.save();
        res.status(201).send(newOrder);
    } catch (error) {
        console.error('Error al crear la orden:', error);
        res.status(500).send({ message: 'Error al crear la orden', error });
    }
};

// Endpoint para crear un pago con Stripe
exports.createPayment = async (req, res) => {
    try {
        const { amount, currency } = req.body;

        // Crear un PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount, // Monto en centavos (por ejemplo, $10.00 = 1000)
            currency, // Moneda (por ejemplo, "usd")
            metadata: { userId: req.user.id }, // Agregar metadatos opcionales
        });

        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret, // Enviar el client_secret al frontend
        });
    } catch (error) {
        console.error('Error al crear PaymentIntent:', error);
        res.status(500).json({ success: false, message: 'Error al procesar el pago' });
    }
};

// Endpoint para obtener estadisticas del sitio
exports.getStatistics = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({});
        const totalUsers = await Users.countDocuments({});
        const totalOrders = await Order.countDocuments({});
        const totalSales = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);

        res.json({
            totalProducts,
            totalUsers,
            totalOrders,
            totalSales: totalSales[0] ? totalSales[0].total : 0
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};

// Endpoint para obtener las ordenes para estadisticas
exports.getOrdersForStatistics = async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
        });
    }
};