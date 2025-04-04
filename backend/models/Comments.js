const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", CommentSchema);