// Creación mediante node create_database.js
// Conexión a MongoDB
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://JuanRM:JuanTDP10@stp.jlm2k.mongodb.net/?retryWrites=true&w=majority"; // Reemplaza con tu URI de conexión
const client = new MongoClient(uri);

async function createDatabase() {
    try {
        await client.connect();
        console.log("Conexión exitosa a MongoDB");

        const db = client.db("SupraStock"); // Nombre de la base de datos

        // Crear colección de productos
        const productsCollection = db.collection("products");
        await productsCollection.insertMany([
            {
                "_id": { "$oid": "67d107a0f6b41df10c69de56" },
                "id": 2,
                "name": "Conjunto niño osito",
                "image": "http://localhost:4000/images/product_1741752224470.jpg",
                "category": "kid",
                "new_price": 5000,
                "old_price": 50000,
                "available": false,
                "description": "Conjunto para niño super comodo color café y negro",
                "date": { "$date": "2025-03-12T04:03:44.584Z" },
                "__v": 0,
                "stock": 10,
                "size": "M",
                "sizes": { "XS": 5, "M": 5 }
            },
            {
                "_id": { "$oid": "67d3643c4d45a92d8daec248" },
                "id": 7,
                "name": "Pantalón Skinny",
                "image": "http://localhost:4000/images/product_1741907004814.jpg",
                "category": "men",
                "new_price": 29998,
                "old_price": 30000,
                "available": true,
                "description": "Pantalón skinny para hombre",
                "date": { "$date": "2025-03-13T23:03:24.939Z" },
                "__v": 0,
                "stock": 10,
                "size": "XL",
                "sizes": { "L": 5, "M": 5 }
            },
        ]);
        console.log("Colección 'products' creada con datos iniciales");

        // Crear colección de usuarios
        const usersCollection = db.collection("users");
        await usersCollection.insertMany([
            {
                "_id": { "$oid": "67d0c5f7a2668867278aefb3" },
                "name": "Admin",
                "email": "Administrador@gmail.com",
                "password": "$2b$10$UNZc31fRdo9.8lNdbt9.velvqOgebFm6b1Ay.2N.ZDxez.qxEOBy.",
                "role": "admin",
                "date": { "$date": "2025-03-11T23:23:35.158Z" },
                "__v": 63,
                "address": "",
                "city": "",
                "phone": "3003567911",
                "postal_code": "",
                "cartData": [],
                "wishlist": []
            },
            {
                "_id": { "$oid": "67d37fc9d75095107d9cadd2" },
                "name": "Natalia",
                "email": "nata.ospinap@gmail.com",
                "password": "$2b$10$BcVV/09o9/9Qdxmx64ktsOAlIcvi7Ld5bEtGfDE9oVnhWCi/uv6uS",
                "cartData": [],
                "role": "user",
                "date": { "$date": "2025-03-14T01:00:57.184Z" },
                "__v": 0,
                "address": "crr 42 #70-25",
                "phone": "3045980819"
            },
        ]);
        console.log("Colección 'users' creada con datos iniciales");

        // Crear colección de órdenes
        const ordersCollection = db.collection("orders");
        await ordersCollection.insertMany([
            {
                "_id": { "$oid": "67dc586d20ea87f9542c91ff" },
                "user_id": { "$oid": "67d84035d73adbab54c281ca" },
                "products": [
                    {
                        "product_id": { "$oid": "67d107a0f6b41df10c69de56" },
                        "quantity": 1,
                        "price": 5000,
                        "_id": { "$oid": "67dc586d20ea87f9542c9200" }
                    }
                ],
                "address": "Carrera 29 # 79 a 11",
                "city": "Medellín",
                "postal_code": "050011",
                "total": 5000,
                "status": "Pending",
                "date": { "$date": "2025-03-20T08:03:25.711Z" },
                "available": false,
                "payment_info": {
                    "method": "PSE",
                    "status": "Pending",
                    "transaction_id": "1234567890"
                },
                "__v": 0
            },
        ]);
        console.log("Colección 'orders' creada con datos iniciales");

        // Crear colección de comentarios
        const commentsCollection = db.collection("comments");
        await commentsCollection.insertMany([
            {
                "_id": { "$oid": "67e799b1c92951d0e65ce750" },
                "productId": { "$oid": "67d3643c4d45a92d8daec248" },
                "author": "Natalia",
                "text": "Muchas gracias muy amable",
                "date": { "$date": "2025-03-29T06:56:49.951Z" },
                "__v": 0
            },
        ]);
        console.log("Colección 'comments' creada con datos iniciales");

    } catch (error) {
        console.error("Error al crear la base de datos:", error);
    } finally {
        await client.close();
        console.log("Conexión cerrada");
    }
}

createDatabase();