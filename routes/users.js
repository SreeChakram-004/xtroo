const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected route that requires access token verification
router.get('/userProfile', authMiddleware.verifyToken, (req, res) => {
  // Access the user data from the request object
  const user = req.user;
  res.json({ status: true, user });
});

module.exports = router;
