const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
// const nodemon = require('nodemon');
const feedRoutes = require('./routes/tripRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.use('/feed', feedRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: any) => console.log(err));
