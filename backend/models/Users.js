const mongoose = require('mongoose');

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
}); 

module.exports = mongoose.model("Users", UsersSchema);