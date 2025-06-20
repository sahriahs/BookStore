// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js'; // Import model User

// Middleware untuk melindungi routes
const protect = async (req, res, next) => {
  let token;

  // Cek jika header Authorization ada dan diawali 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Dapatkan token dari header
      token = req.headers.authorization.split(' ')[1]; // Format: "Bearer TOKEN_ANDA"

      // Verifikasi token
      // Kita butuh JWT_SECRET di sini
      // Jika Anda menggunakan .env: process.env.JWT_SECRET
      // Jika Anda hardcode di userRoute.js: gunakan string yang sama
      const decoded = jwt.verify(token, 'qwijjsdju2eukjne9w33ehihhvfiqdiy'); // <-- GANTI DENGAN JWT_SECRET ANDA

      // Cari user berdasarkan ID dari token yang didecode
      req.user = await User.findById(decoded.id).select('-password'); // Jangan sertakan password

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next(); // Lanjutkan ke route handler berikutnya
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // Jika tidak ada token
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export { protect };