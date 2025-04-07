const mongoose = require("mongoose");
const { getColombiaTime } = require("../utils/timezone"); // Asegúrate de tener esta función para ajustar la fecha al timezone de Colombia

const CommentSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

// Middleware para ajustar la fecha antes de guardar
CommentSchema.pre("save", function (next) {
    this.date = getColombiaTime();
    next();
});

module.exports = mongoose.model("Comment", CommentSchema);