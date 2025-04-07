const mongoose = require('mongoose');
const { getColombiaTime } = require("../utils/timezone");

const UsersSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    photo: { type: String },
    address: { type: String },
    city: { type: String },
    postal_code: { type: String },
    phone: { type: String },
    cartData: [
        {
            product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            size: { type: String, required: true },
            quantity: { type: Number, required: true }
        }
    ],
    date: { type: Date, default: Date.now },
    role: { type: String, default: 'user' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isVerified: { type: Boolean, default: false }, // Nuevo campo
    verificationToken: { type: String }, // Nuevo campo
    active: { type: Boolean, default: true }, // Nuevo campo
});

// Middleware para ajustar la fecha antes de guardar
UsersSchema.pre("save", function (next) {
    this.date = getColombiaTime();
    next();
});

module.exports = mongoose.model("Users", UsersSchema);