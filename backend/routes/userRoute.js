import express from 'express';
import { body, validationResult } from 'express-validator'; // Untuk validasi input
import { User } from '../models/userModel.js'; // Import model User
import jwt from 'jsonwebtoken'; // Import jsonwebtoken

const router = express.Router();

const JWT_SECRET = 'qwijjsdju2eukjne9w33ehihhvfiqdiy';

// Fungsi helper untuk menghasilkan JWT
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '1h', // Token berlaku selama 1 jam
  });
};

// ===============================================
// Route untuk Registrasi User (Signup)
// ===============================================
router.post(
  '/register',
  [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email address'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = request.body;

    try {
      // Cek apakah user sudah ada
      const userExists = await User.findOne({ email });
      if (userExists) {
        return response.status(400).json({ message: 'User with this email already exists' });
      }

      // Buat user baru (password akan otomatis di-hash oleh middleware 'pre save')
      const user = await User.create({
        username,
        email,
        password,
      });

      // Jika user berhasil dibuat, kirim data user dan token
      if (user) {
        response.status(201).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id), // Buat dan kirim JWT
        });
      } else {
        response.status(400).json({ message: 'Invalid user data' });
      }
    } catch (error) {
      console.error(error.message);
      response.status(500).send({ message: 'Server Error during registration' });
    }
  }
);

// ===============================================
// Route untuk Login User
// ===============================================
router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const { email, password } = request.body;

    try {
      // Cari user berdasarkan email
      const user = await User.findOne({ email });

      // Jika user ditemukan dan password cocok
      if (user && (await user.matchPassword(password))) {
        response.status(200).json({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id), // Buat dan kirim JWT
        });
      } else {
        // Jika user tidak ditemukan atau password tidak cocok
        response.status(401).json({ message: 'Invalid email or password' }); // 401 Unauthorized
      }
    } catch (error) {
      console.error(error.message);
      response.status(500).send({ message: 'Server Error during login' });
    }
  }
);

export default router;