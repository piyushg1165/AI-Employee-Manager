const dotenv = require('dotenv');
dotenv.config();
const {connectDB}=require('./db/mongodb')
const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/user.route.js');
const messageRoutes = require('./routes/message.route.js');
const chatRoutes = require('./routes/chat.route.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true 
}));


app.use(bodyParser.json());

app.use("/user", userRoutes);
app.use('/message', messageRoutes);
app.use('/chat', chatRoutes);


app.get('/', (req, res) => {
    res.send('Service is running');
});

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
    connectDB();
});