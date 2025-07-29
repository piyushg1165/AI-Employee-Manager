const jwt = require('jsonwebtoken');

 const Token = (userId, res) => {
    const token = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15d',
    });

    const isProduction = process.env.NODE_ENV === "production";

res.cookie("token", token, {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  path: '/' 
});


   res.cookie("token", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
});

    return token;

};

module.exports = Token;