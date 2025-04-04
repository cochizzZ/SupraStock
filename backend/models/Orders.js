const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true }, // Cambiado de "User" a "Users"
    products: [
        {
            product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            size: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
        },
    ],
    address: { type: String, required: true },
    city: { type: String, required: true },
    postal_code: { type: String, required: true },
    total: { type: Number, required: true },
    status: { type: String, enum: ["Pending", "Shipped", "Completed", "Cancelled"], default: "Pending" },
    date: { type: Date, default: Date.now },
    available: { type: Boolean, default: true },
    payment_info: {
        method: { type: String, required: true },
        status: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
        transaction_id: { type: String },
    },
});

module.exports = mongoose.model("Orders",  OrderSchema);