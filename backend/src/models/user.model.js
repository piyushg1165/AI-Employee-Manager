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
        },
        profilePic: {
            type: String,
            default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.istockphoto.com%2Fphotos%2Fuser-profile&psig=AOvVaw3qIfanXxJ6JRqTt2oG2O6c&ust=1754383101386000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKido77g8I4DFQAAAAAdAAAAABAE"
        }
        
    },{ timestamps: true });

    const User = mongoose.model('User', userSchema);
    module.exports = User;