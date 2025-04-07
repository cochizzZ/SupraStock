const mongoose = require("mongoose");
const { getColombiaTime } = require("../utils/timezone");

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    new_price: { type: Number, required: true },
    old_price: { type: Number },
    description: { type: String, required: false },
    stock: { type: Number, required: true },
    sizes: { type: Map, of: Number, default: {} },
    available: { type: Boolean, default: true },
    date: { type: Date, default: () => getColombiaTime() }, // Ajustar la fecha al timezone de Colombia
});

// Middleware para ajustar la fecha antes de guardar
ProductSchema.pre("save", function (next) {
    this.date = getColombiaTime();
    next();
});

module.exports = mongoose.model("Product", ProductSchema);