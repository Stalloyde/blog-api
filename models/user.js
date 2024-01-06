const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  isMod: { type: Boolean, required: true },
});

module.exports = mongoose.model('User', userSchema);
