const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },

  batch: { 
    type: String, 
    enum: ["BatchA", "BatchB"], 
    required: true 
  },

  squad: { 
    type: String, 
    enum: ["Squad1", "Squad2", "Squad3", "Squad4", "Squad5"], 
    required: true 
  }
});

module.exports = mongoose.model("User", userSchema);