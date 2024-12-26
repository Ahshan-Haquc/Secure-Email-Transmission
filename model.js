const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    batch: { type: String, required: true },
    studentId: { type: String, unique: true, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);
