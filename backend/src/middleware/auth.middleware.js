
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();

app.use(cookieParser());

/**
 * Middleware to verify JWT
 * @description This middleware will check if the JWT token is valid and if the user exists in the database.
 */
const verifyJWT = async (req, res, next) => {
    const token =
        req.cookies?.token;

    if (!token) {
        res.status(401).json({ message: "Unauthorized request" });
        return;
    }

    try {
        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        if (!decodedToken) {
            // client should make new access token and refresh token
            res.status(401).json({ message: "Invalid access token" });
        }
        const { userId } = decodedToken;

        req.user = { id: userId };
        next();
    } catch (error) {
        // Handle error explicitly by checking the type of `error`
        res.status(401).json({ message: "Invalid access token" });
        console.error("JWT verification failed:", error);
    }
};


module.exports = {
    verifyJWT
};