const port = 4000;
const express = require("express");
const router = express.Router(); // Asegurar que router está definido
const User = require('./models/User'); // Importar el modelo de usuario si no lo tienes
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');
const { clear } = require("console");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/users', userRoutes);

// Conexion con la base de datos de MongoDB
mongoose.connect("mongodb+srv://JuanRM:JuanTDP10@stp.jlm2k.mongodb.net/suprastock", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Conectado a la base de datos');
}).catch((error) => {
    console.error('Error al conectar a la base de datos:', error);
});

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

// Esquema para la creación de productos

const Product = mongoose.model("Product", new mongoose.Schema({
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
    description: {
        type: String,
        required: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    }
}));

// Endpoint para agregar un producto
app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

        const { name, image, category, new_price, old_price, description, stock } = req.body;

        // Validar que los campos obligatorios no estén vacíos
        if (!name || !image || !category || !new_price || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos (name, image, category, new_price, stock) son obligatorios.",
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

// Creación de API para obtener todos los productos

app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All products Fetched");
    res.send(products);
})

//creación de schema para el modelo de usuario

const Users = mongoose.model('Users', new mongoose.Schema({
    name: {type: String,required: true,},
    email: {type: String,unique: true,required: true,},
    password: {type: String,required: true,},
    photo: {type: String,},
    address: {type: String,},
    city: { type: String, required: true },
    postal_code: { type: String, required: true },
    phone: {type: String,},
    wishlist: {type: Array,default: [],},
    cartData: {type: Object,},
    date: {type: Date,default: Date.now,},
    role: {type: String,default: 'user',},
}));

//creación de schema para el modelo de ordenes
const OrderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
        {
            product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
    address: { type: String, required: true },
    city: { type: String, required: true },
    postal_code: { type: String, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Processing", "Shipped", "Completed", "Cancelled"], default: "Pending" },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },

    // Información del pago
    payment_info: {
        method: { type: String, required: true }, // "PSE", "Tarjeta de crédito"
        status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
        transaction_id: { type: String } // Se asigna solo si el pago es exitoso
    }
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;


// Modificación en el endpoint de registro (signup)
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "Se ha encontrado un usuario con la misma dirección de correo electrónico" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }

    try {
        // Generamos el "sal" para reforzar el hash
        const salt = await bcrypt.genSalt(10);
        // Ciframos la contraseña antes de almacenarla
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new Users({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            role: req.body.role || 'user',
            cartData: cart,
        });

        await user.save();

        const data = { user: { id: user.id } };
        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token, username: user.name, userId: user.id });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
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
    let products = await Product.find({});
    let newcollection = products.slice(0).slice(-8);
    console.log("newcollection: " + newcollection);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})

//creación de un punto final para la sección de mujeres populares
app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let popular_in_women = products.slice(0, 4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})

// crear middleware para obtener usuario

const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ errors: "Autenticacion requerida:ingresa un token valido" })
    }
    else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next();
        } catch (error) {
            res.status(401).send({ errors: "Autenticacion requerida:ingresa un token valido" })
        }
    }
}

//crear punto de conexion para agregar productos en  CarData
app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        console.log("Producto agregado al carrito", req.body.itemId, req.body.quantity);

        if (!userData) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
        let cartData = { ...userData.cartData };
        cartData[req.body.itemId] = (cartData[req.body.itemId] || 0) + req.body.quantity;

        await Users.findOneAndUpdate(
            { _id: req.user.id },
            { cartData: cartData }
        );

        res.json({ success: true, message: "Producto agregado al carrito" });

    } catch (error) {
        console.error("Error al agregar al carrito:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

//crear punto de conexion para eliminar productos en CartData
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        console.log("Producto eliminado del carrito", req.body.itemId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        let cartData = { ...userData.cartData };

        if (cartData[req.body.itemId] && cartData[req.body.itemId] > 0) {
            cartData[req.body.itemId] -= 1;

            if (cartData[req.body.itemId] === 0) {
                delete cartData[req.body.itemId];
            }
        } else {
            return res.status(400).json({ success: false, message: "El producto no está en el carrito" });
        }

        await Users.findOneAndUpdate(
            { _id: req.user.id },
            { cartData: cartData }
        );

        console.log("Producto eliminado del carrito:", req.body.itemId);
        res.json({ success: true, message: "Producto eliminado del carrito" });

    } catch (error) {
        console.error("Error al eliminar del carrito:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

//Crear Punto de conexion para obtener datos del carrito
app.post('/getcart', fetchUser, async (req, res) => {
    console.log("Obtener Carrito");
    let userData = await Users.findOne({ _id: req.user.id });

    // Obtener todos los productos disponibles
    let allProducts = await Product.find({});
    let validProductIds = new Set(allProducts.map(product => product.id));

    // Filtrar productos eliminados del carrito
    let validCartData = {};
    for (let itemId in userData.cartData) {
        if (validProductIds.has(Number(itemId))) {
            validCartData[itemId] = userData.cartData[itemId];
        }
    }

    res.json(validCartData);
})

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
        const { id, name, description, new_price, old_price, category, image, stock } = req.body;

        // Validar que los campos obligatorios no estén vacíos
        if (!id || !name || !description || !new_price || !category || stock === undefined) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos (id, name, description, new_price, category, stock) son obligatorios.",
            });
        }

        // Determinar el estado de disponibilidad basado en el stock
        const available = stock > 0;

        const updatedProduct = await Product.findOneAndUpdate(
            { id: id },
            { name, description, new_price, old_price, category, image, stock, available },
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
        const { name, email, photo, address, phone } = req.body;
        const userId = req.params.id;

        // Verificar si el usuario existe
        let user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        // Actualizar el usuario
        user = await Users.findByIdAndUpdate(userId, { name, email, photo, address, phone }, { new: true });

        res.json({ success: true, message: "Usuario actualizado", user });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ success: false, message: "Error del servidor" });
    }
});

router.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log("ID recibido en el backend:", id); // 👀 Verifica si el ID llega correctamente

        // Verificar si el ID es válido en MongoDB
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

module.exports = router;
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


app.put('/api/orders/:orderId', async (req, res) => {
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

module.exports = router;
// Endpoint para crear una orden
app.post('/api/orders', async (req, res) => {
    try {
        const { user_id, products, total, address, city, postal_code, payment_info } = req.body;
        console.log("Orden recibida:", req.body);

        if (!user_id || !products || !total || !address || !city || !postal_code || !payment_info) {
            return res.status(400).json({
                success: false,
                message: "Los campos user_id, products, total, address, city, postal_code y payment_info son obligatorios.",
            });
        }

        // Validar y convertir los product_id a ObjectId
        const productIds = products.map(p => p.product_id);
        const existingProducts = await Product.find({ id: { $in: productIds } });

        if (existingProducts.length !== productIds.length) {
            return res.status(400).json({
                success: false,
                message: "Uno o más productos no existen en la base de datos.",
            });
        }

        // Mapear los productos con sus ObjectIds
        const productIdMap = existingProducts.reduce((map, product) => {
            map[product.id] = product._id;
            return map;
        }, {});

        const updatedProducts = products.map(p => ({
            product_id: productIdMap[p.product_id],
            quantity: p.quantity,
            price: p.price,
        }));

        // Ajustar la fecha a la zona horaria de Colombia
        const now = new Date();
        const colombiaOffset = -5 * 60; // Colombia está en UTC-5
        const localOffset = now.getTimezoneOffset();
        const colombiaTime = new Date(now.getTime() + (colombiaOffset - localOffset) * 60 * 1000);

        // Crear la nueva orden con la fecha ajustada
        const newOrder = new Order({
            user_id,
            products: updatedProducts,
            total,
            address,
            city,
            postal_code,
            payment_info,
            status: 'Pending',
            date: colombiaTime // Establecer la fecha ajustada
        });

        console.log("Orden creada:", newOrder);
        await newOrder.save();
        res.status(201).send(newOrder);
    } catch (error) {
        console.error('Error al crear la orden:', error);
        res.status(500).send({ message: 'Error al crear la orden', error });
    }
});

// Endpoint para crear un pago
app.post('/api/payments', async (req, res) => {
    try {
        const newPayment = new Payment(req.body);
        await newPayment.save();
        res.status(201).send(newPayment);
    } catch (error) {
        res.status(500).send({ message: 'Error al crear el pago', error });
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


app.delete('/clearcart', async (req, res) => {
    try {
        console.log("Limpiar carrito:", req.body);
        let userData = await Users.findOne({ _id
            : req.body.user_id });
        let cartData = { ...userData.cartData };
        for (let itemId in cartData) {
            cartData[itemId] = 0;
        }
        await Users.findOneAndUpdate(
            { _id: req.body.user_id },
            { cartData: cartData }
        );
        res.json({ success: true, message: "Carrito limpiado" });
    } catch (error) {
        console.error("Error al limpiar el carrito:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
}
);