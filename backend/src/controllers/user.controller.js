const User = require('../models/user.model.js');
const bcrypt = require('bcrypt');
const Token = require('../utils/token.js');
const upload = require("../middleware/multer.js");

const register = async (req, res) => {
    const {firstName, lastName, email, password} = req.body;
    try {
         if(!firstName || !lastName || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters"});
        }

        const user = await User.findOne({email});

        if(user){
            return res.status(400).json({message: "Email already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        if(newUser){
            Token(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                 _id: newUser._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
            
            });
        } else {
            res.status(400).json({message: "Invalid User data"})
        }

    } catch (error) {
        console.log("Error in register controller", error);
        res.status(500).json({message: "Internal Server Error"})
    }

    
};

const login = async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});

    try {
        if(!user){
            return res.status(404).json({message: "Invalid Credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message: "Invalid Credentials"});
        }

        Token(user._id,res);

        res.status(200).json({
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
        });
    } catch (error) {
        console.log("Error in login controller", error);
        res.status(500).json({message: "Internal Server Error"})    }
};

 const logout = (req, res) => {
    try {
        const user = req.user;

        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "none",
            secure: process.env.NODE_ENV !== "development",
        });
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({message: "Internal Server Error"})
        
    }
};

const getCurrentUser = async (req, res) => {
    const {id} = req.user;
    try {
        const user = await User.findById(id).select("-password");
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getCurrentUser controller", error);
        res.status(500).json({message: "Internal Server Error"})
    }
};

const updateUser = async(req, res) => {
    const { id } = req.user;
    const { firstName, lastName, email, password } = req.body;
    let hashedPassword;
    
    if(password){
        const salt = await bcrypt.genSalt(10);
     hashedPassword = await bcrypt.hash(password, salt);
    }     
    try {
        const updatedData = {
            firstName,
            lastName,
            email,
        }
        if (req.file && req.file.path) {
      updatedData.profilePic = req.file.path; // Save Cloudinary URL
    }
         if (password) updatedData.password = hashedPassword;
        const updatedUser = await User.findByIdAndUpdate(id, updatedData, {new: true});
        if(!updatedUser){
            return res.status(404).json({message: "User not found"});
        }
        console.log(updatedUser)
          res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateUser controller", error);
        res.status(500).json({message: "Internal Server Error"})
    }
};




module.exports = { register, login, logout, getCurrentUser, updateUser }
 

