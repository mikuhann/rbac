const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');

router.post(
  '/signup',
  UserController.signUp
);
router.post(
  '/login',
  UserController.login
);
router.get(
  '/user/:userId',
  UserController.allowIfLoggedin,
  UserController.getUser
);
router.get(
  '/users',
  UserController.allowIfLoggedin,
  UserController.grantAccess('readAny', 'profile'),
  UserController.getUsers
);
router.put(
  '/users/:userId',
  UserController.allowIfLoggedin,
  UserController.grantAccess('updateAny', 'profile'),
  UserController.updateUser
);
router.delete(
  '/users/:userId',
  UserController.allowIfLoggedin,
  UserController.grantAccess('deleteAny', 'profile'),
  UserController.deleteUser
);

module.exports = router;

