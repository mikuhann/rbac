const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const connectDB = require('./config/mongodb');

const User = require('./models/UserModel');
const routes = require('./routes/routes');

const app = express();

const PORT = process.env.PORT || 5002;

require('dotenv').config({
  path: path.join(__dirname, './.env')
});

connectDB();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(async (req, res, next) => {
  if (req.headers['x-access-token']) {
    const accessToken = req.headers['x-access-token'];
    const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
    if (exp < Date.now().valueOf() / 1000) {
      return res.status(401).json({
        error: 'JWT token expired, please, login to obtain a new one',
      });
    }
    res.locals.loggedInUser = await User.findById(userId);
    next();
  } else {
    next();
  }
});

app.use('/', routes);
app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`)
});
