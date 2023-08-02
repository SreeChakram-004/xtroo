const {Shop , User} = require('../models');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, 'your-secret-key', {
    expiresIn: '1h', // Token will expire in 1 hour
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, 'your-refresh-secret-key', {
    expiresIn: '7d', // Refresh token will expire in 7 days
  });
};

// Joi schema for user registration validation
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .max(20)
    .pattern(
      new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$')
    )
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 20 characters',
      'string.pattern.base':
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  shopName: Joi.string().required().messages({
    'any.required': 'Shop name is required',
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 20 characters',
  }),
});

// Joi schema for user login validation
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

const registerUser = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  const { email, password, shopName } = req.body;
  try {
    // Find the shop based on the given shopName
    let shop = await Shop.findOne({ where: { shopName } });

    if (shop) {
      // If the shop already exists, throw an error
      return res.status(400).json({ status: false, message: 'Shop already exists.' });
    }

    // Create a new shop
     shop = await Shop.create({ shopName });

    // Create the user with the associated shopId
    const user = await User.create({ email, password, shopId: shop.id });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.status(201).json({ status: true, accessToken, refreshToken, expiresIn: '1h' });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ status: false, message: 'Email address already registered.' });
    } else if (err.name === 'SequelizeValidationError') {
      const errorMessages = err.errors.map((error) => error.message);
      return res.status(400).json({ status: false, message: errorMessages });
    } else {
      console.error(err);
      return res.status(500).json({ status: false, message: 'An error occurred during registration.' });
    }
  }
};


const loginUser = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ status: false, message: error.details[0].message });
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Shop, attributes: ['shopName'] }],
    });

    if (!user) {
      return res.status(401).json({ status: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: false, message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.status(200).json({
      status: true,
      accessToken,
      refreshToken,
      expiresIn: '1h',
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: 'An error occurred during login.' });
  }
};


module.exports = {
  registerUser,
  loginUser,
};
