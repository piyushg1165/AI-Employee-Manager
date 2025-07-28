const jwt = require('jsonwebtoken');

 const Token = (userId, res) => {
    const token = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
    });

    res.cookie("jwt", token, {
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV !== "development",
    });

    return token;

};

module.exports = Token;