const jwt = require('jsonwebtoken');

 const Token = (userId, res) => {
    const token = jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '15d',
    });

    const isProduction = process.env.NODE_ENV === "production";

    const options = {
      maxAge: 24 * 60 * 60 * 1000 * 7, // Cookie will expire after 7 day
      httpOnly: true, // Cookie is only accessible via HTTP(S) and not client-side JavaScript
      secure: process.env.NODE_ENV === 'production', // Cookie will only be sent over HTTPS if in production
      sameSite: 'strict', // SameSite attribute to prevent CSRF attacks
    };
    // Set the cookie in the response
res.cookie("token", token, options);



    return token;

};

module.exports = Token;