
const mongoose = require('mongoose');
module.exports = mongoose.model("Homework", new mongoose.Schema({
  title: String,
  due: String,
  createdAt: { type: Date, default: Date.now }
}));
