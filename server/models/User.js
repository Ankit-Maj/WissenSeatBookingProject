const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  batch: { type: String },
  squad: { type: String }
});

module.exports = mongoose.model("User", userSchema);