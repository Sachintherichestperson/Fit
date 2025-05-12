const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/mydatabase");

module.exports = mongoose;  