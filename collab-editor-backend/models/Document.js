// models/Document.js
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  _id: String,
  data: Object,
});

module.exports = mongoose.model("Document", DocumentSchema);
