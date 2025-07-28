    const mongoose = require('mongoose');
    const bcrypt = require('bcrypt');

    const userSchema = new mongoose.Schema({
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minLength: 6
        },
        token: {
            type: String,
        }
        
    },{ timestamps: true });

    const User = mongoose.model('User', userSchema);
    module.exports = User;