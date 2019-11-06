const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { basic } = require('../models/constant');
const { roles } = require('../roles');

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function validatePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

exports.signUp = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = new User({ email, password: hashedPassword, role: role || basic});
    const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    newUser.accessToken = accessToken;
    await newUser.save();
    res.json({
      data: newUser,
      accessToken,
    });
  } catch (e) {
    next(e)
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new Error('Email does not exist'));
    }
    const validPassword = await validatePassword(password, user.password);
    if (!validPassword) {
      return next(new Error('Password is not correct'));
    }
    const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });
    await User.findByIdAndUpdate(user._id, { accessToken });
    res.status(200).json({
      data: { email: user.email, role: user.role },
      accessToken,
    });
  } catch (e) {
    next(e)
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      data: users,
    });
  } catch (e) {
    next(e)
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const update = req.body;
    const userId = req.params.userId;
    await User.findByIdAndUpdate(userId, update);
    const user = await User.findById(userId);
    res.status(200).json({
      data: user,
      message: 'User has been updated',
    });
  } catch (e) {
    next(e)
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);
    res.status(200).json({
      data: null,
      message: 'User has been deleted',
    });
  } catch (e) {
    next(e)
  }
};

exports.grantAccess = function (action, resource) {
  return async (req, res, next) => {
    try {
      const permission = roles.can(req.user.role)[action](resource);
      if (!permission.granted) {
        return res.status(401).json({
          error: `You don't have permission to perform this action`
        });
      }
      next()
    } catch (e) {
      next(e)
    }
  }
};

exports.allowIfLoggedin = async (req, res, next) => {
  try {
    const user = res.locals.loggedInUser;
    if (!user) {
      return res.status(401).json({
        error: 'You need to be logged in to access this route'
      });
    }
    req.user = user;
    next()
  } catch (e) {
    next(e)
  }
};
