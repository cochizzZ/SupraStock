require('dotenv').config();
const port = process.env.PORT;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51R6cNaBLRCJFKBKAttNOUBrZeJ83hiT7urfBaLEhNONIKDeqO9YeiAUmn0Pq5Ox23iseYtgbKX10s2IJuxTO0UFk00wjtRk5MZ');
const { clear } = require("console");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const connectDB = require('./config/database');
const Product = require('./models/Product');
const Users = require('./models/Users');
const Order = require('./models/Orders');
const Comment = require('./models/Comments');
const validatePassword = require('./utils/validatePassword');

// Conexión a la base de datos
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Creacion de API
app.get("/", (req, res) => {
    res.send("Express App is Running")
})

// Creacion de API para subir imagenes
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })

// Creacion de API para subir imagenes

app.use('/images', express.static('upload/images'))

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    })
})

// Endpoint para agregar un producto
app.post('/addproduct', async (req, res) => {
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
});

// Creacion de API para Remover Productos
app.post('/removeproduct', async (req, res) => {
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
});


// Endpoint para obtener todos los productos
app.get('/allproducts', async (req, res) => {
    try {
        const products = await Product.find({ available: true });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Endpoint para obtener todos los productos (incluyendo no disponibles)
app.get('/fullproducts', async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Modificación en el endpoint de registro (signup)
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body)

        // Validar la contraseña
        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({
                success: false,
                message: passwordError,
            });
        }

        // Verificar si el correo ya está registrado
        let existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "El correo ya está registrado.",
            });
        }

        // Generar el "salt" y cifrar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generar un token único para la verificación
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Crear el nuevo usuario (sin activar)
        const user = new Users({
            name,
            email,
            password: hashedPassword,
            role: 'user',
            isVerified: false, // Nuevo campo para verificar si el usuario está autenticado
            verificationToken,
        });

        await user.save();

        // Configurar el transporte de correo
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'nata.ospinap@gmail.com',
                pass: 'aejx sqnh crfi wubd',
            },
        });

        // Enviar el correo de verificación
        const verificationUrl = `http://localhost:3000/verify-email/${verificationToken}`;
        const mailOptions = {
            to: email,
            subject: 'Verificación de correo electrónico',
            text: `Haz clic en el siguiente enlace para verificar tu correo electrónico: ${verificationUrl}`,
        };

        await transporter.sendMail(mailOptions);

        res.json({
            success: true,
            message: "Cuenta creada. Por favor, verifica tu correo electrónico para activar tu cuenta.",
        });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
});


// Modificación en el endpoint de login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    console.log("User:", user);
    if (user) {
        const passCompare = await bcrypt.compare(req.body.password, user.password);
        if (passCompare) {
            const data = { user: { id: user._id } };
            const token = jwt.sign(data, 'secret_ecom');
            console.log("_id:", user._id);
            console.log("data:", data.user.id);
            if (user.role === 'admin') {
                return res.json({
                    success: true,
                    token,
                    userId: user._id, // ← Enviar el userId al frontend
                    role: 'admin',
                    username: user.name
                });
            } else {
                return res.json({
                    success: true,
                    token,
                    userId: user._id, // ← Enviar el userId al frontend
                    username: user.name
                });
            }
        } else {
            return res.json({ success: false, errors: "Contraseña incorrecta" });
        }
    } else {
        return res.json({ success: false, errors: "ID de correo electrónico incorrecto" });
    }
});


//creación de un punto final para los datos de newcollection
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({ available: true });
    let newcollection = products.slice(0).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})

//creación de un punto final para la sección de mujeres populares
app.get('/popularinwomen', async (req, res) => {
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
});

// crear middleware para obtener usuario

// Crear middleware para obtener usuario
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Autenticacion requerida: ingresa un token valido" });
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "Autenticacion requerida: ingresa un token valido" });
        }
    }
};

// Endpoint para agregar un producto al carrito

app.post('/addtocart', fetchUser, async (req, res) => {
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
});
//crear punto de conexion para eliminar productos en CartData
app.post('/removefromcart', fetchUser, async (req, res) => {
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
});

//Crear Punto de conexion para obtener datos del carrito
app.post('/getcart', fetchUser, async (req, res) => {
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
});

// Endpoint para limpiar completamente el carrito
app.delete('/clearcart', fetchUser, async (req, res) => {
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
});

// Endpoint para actualizar el carrito
app.post('/updatecart', fetchUser, async (req, res) => {
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
});

// Endpoint para verificar si el usuario es administrador
app.get('/verifyAdmin', async (req, res) => {
    const token = req.header('auth-token');
    console.log('Verifying admin:', token);
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
});

// Endpoint para obtener el perfil del usuario
app.get('/user', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id);
        res.json({ user });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

// Endpoint para actualizar el perfil del usuario
app.post('/updateProfile', fetchUser, async (req, res) => {
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
});

// Endpoint para agregar nuevas órdenes
app.post('/addorder', async (req, res) => {
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
});

// Endpoint para obtener todas las órdenes
app.get('/api/orders', async (req, res) => {
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
});

// Endpoint para actualizar un producto
app.post('/updateproduct', async (req, res) => {
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
});
// Endpoint para obtener estadísticas
app.get('/api/statistics', async (req, res) => {
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
});

// Endpoint para obtener todos los usuarios
app.get('/api/users', async (req, res) => {
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
});

// Endpoint para obtener detalles de un usuario
app.put('/api/users/:id', async (req, res) => {
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
});

app.delete('/api/users/:id', async (req, res) => {
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
});

// Endpoint para obtener detalles de un usuario
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await Users.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Endpoint para obtener detalles de un producto
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.json(product);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Endpoint para obtener los detalles de un producto por ID
app.get('/api/products/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Endpoint para obtener las órdenes de un usuario específico
app.get('/api/user/orders', fetchUser, async (req, res) => {
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
});

// Ruta para actualizar una orden
app.put('/orders/:orderId', async (req, res) => {
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
});

// Endpoint para actualizar el estado de una orden
app.put('/api/orders/:id', async (req, res) => {
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
});

exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) {
            return res.status(404).send({ message: 'Order not found' });
        }
        res.send(order);
    } catch (error) {
        res.status(500).send({ message: 'Error updating order', error });
    }
};

// Endpoint para crear una orden
app.post('/api/orders', async (req, res) => {
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
});

// Endpoint para crear un pago con Stripe
app.post('/api/create-payment-intent', fetchUser, async (req, res) => {
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
});

// Iniciar el servidor
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port" + port)
    }
    else {
        console.log("Error : " + error)
    }
})

// Endpoint para obtener comentarios de un producto
app.get('/api/comments/:productId', async (req, res) => {
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
});

// Endpoint para agregar un comentario
app.post('/api/comments', fetchUser, async (req, res) => {
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
});

// Endpoint para eliminar un comentario (solo admin)
app.delete('/api/comments/:id', fetchUser, async (req, res) => {
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
});

// Endpoint para solicitar restablecimiento de contraseña
app.post('/forgot-password', async (req, res) => {
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
});

// Endpoint para restablecer la contraseña
app.post('/reset-password/:token', async (req, res) => {
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
});

// Endpoint para obtener todas las órdenes
app.get('/api/sales', async (req, res) => {
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
});

app.get('/verify-email/:token', async (req, res) => {
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
});

app.post('/check-email', async (req, res) => {
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
});