const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number },
    stock: { type: Number, required: true },
    sizes: { type: Map, of: Number, default: {} },
    available: { type: Boolean, default: true },
});

module.exports = mongoose.model("Product", ProductSchema);