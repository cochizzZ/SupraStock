const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");
const { log } = require("console");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conexion con la base de datos de MongoDB
mongoose.connect("mongodb+srv://JuanRM:JuanTDP10@stp.jlm2k.mongodb.net/suprastock",);

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
    let producto = await Product.findOne({ id: req.body.id });
    console.log(producto);
    let productImage = producto.image.split('/').slice(-1)[0];
    console.log(productImage);
    fs.unlinkSync(`./upload/images/${productImage}`);
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed product and image");
    res.json({
        success: true,
        name: req.body.name
    })
})

// Creación de API para obtener todos los productos

app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All products Fetched");
    res.send(products);
})

//creación de schema para el modelo de usuario

const Users = mongoose.model('Users', new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
    },
    wishlist: {
        type: Array,
        default: [],
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        default: 'user',
    },
}));

// Esquema para la creación de órdenes
const Order = mongoose.model("Order", new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    products: [
        {
            product_id: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    date: {
        type: Date,
        default: Date.now,
    },
}));

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
        res.json({ success: true, token, username: user.name });
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

// Modificación en el endpoint de login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = await bcrypt.compare(req.body.password, user.password);
        if (passCompare) {
            const data = { user: { id: user.id } };
            const token = jwt.sign(data, 'secret_ecom');
            if (user.role === 'admin') {
                return res.json({ success: true, token, role: 'admin', username: user.name });
            } else {
                return res.json({ success: true, token, username: user.name });
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
    console.log("products: "+products)
    let newcollection = products.slice(0).slice(-8);
    console.log("newcollection: "+newcollection);
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
            // const data = jwt.verify(token, 'secret_ecom');
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
        console.log("Producto agregado al carrito", req.body.itemId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }
        let cartData = { ...userData.cartData };
        cartData[req.body.itemId] = (cartData[req.body.itemId] || 0) + 1;

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

//crear punto de conexion para eliminar productos en  CartData
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        let userData = await Users.findOne({ _id: req.user.id });
        console.log("Producto elimado del carrito", req.body.itemId);

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
    res.json(userData.cartData);
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
        const { name, photo, address, phone, email } = req.body;
        const user = await Users.findByIdAndUpdate(req.user.id, { name, photo, address, phone, email }, { new: true });
        res.json({ success: true, user });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

// Endpoint para agregar nuevas órdenes
app.post('/addorder', async (req, res) => {
    try {
        const { user_id, products, total, status } = req.body;

        if (!user_id || !products || !total) {
            return res.status(400).json({
                success: false,
                message: "Los campos user_id, products y total son obligatorios.",
            });
        }

        const order = new Order({
            user_id,
            products,
            total,
            status: status || 'Pending',
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
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    res.status(500).send(error);
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

// Endpoint para actualizar un producto
app.post('/updateproduct', async (req, res) => {
    try {
        const { id, name, description, new_price, old_price, category, image } = req.body;

// Validar que los campos obligatorios no estén vacíos
        if (!id || !name || !description || !new_price || !category) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos (id, name, description, new_price, category) son obligatorios.",
            });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { id: id },
            { name, description, new_price, old_price, category, image },
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

// Endpoint para actualizar el ID del usuario en las órdenes
app.post('/api/update-user-id-in-orders', async (req, res) => {
  const { oldUserId, newUserId } = req.body;

  if (!oldUserId || !newUserId) {
    return res.status(400).json({
      success: false,
      message: "Los campos oldUserId y newUserId son obligatorios.",
    });
  }

  try {
    const result = await Order.updateMany(
      { user_id: oldUserId },
      { $set: { user_id: newUserId } }
    );

    res.json({
      success: true,
      message: "ID del usuario actualizado en las órdenes correctamente",
      result,
    });
  } catch (error) {
    console.error("Error al actualizar el ID del usuario en las órdenes:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
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

// Iniciar el servidor
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " + port);
    } else {
        console.log("Error : " + error);
    }
})