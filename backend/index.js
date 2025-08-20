const dotenv = require('dotenv');
dotenv.config();
const {connectDB}=require('./src/db/mongodb.js')
const express = require('express');
// const bodyParser = require('body-parser');
const userRoutes = require('./src/routes/user.route.js');
const messageRoutes = require('./src/routes/message.route.js');
const chatRoutes = require('./src/routes/chat.route.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:3000", // for local dev
  "https://ai-employee-manager.vercel.app", // your frontend on vercel
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// app.use(bodyParser.json());

app.use("/api/user", userRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/chat', chatRoutes);


app.get('/', (req, res) => {
    res.send('Service is running');
});

app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
    connectDB();
});