
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Import bcryptjs

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Pastikan username unik
      trim: true,
      minlength: 3, // Minimal 3 karakter
    },
    email: {
      type: String,
      required: true,
      unique: true, // Pastikan email unik
      trim: true,
      lowercase: true, // Simpan email dalam huruf kecil
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'], // Validasi format email
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Minimal 6 karakter
    },
    // Anda bisa menambahkan peran (role) jika ada admin, user, dll.
    // role: {
    //   type: String,
    //   enum: ['user', 'admin'],
    //   default: 'user',
    // },
  },
  {
    timestamps: true, // Untuk createdAt dan updatedAt
  }
);

// --- Middleware Mongoose untuk Hashing Password ---
// Ini akan dijalankan SEBELUM menyimpan dokumen user ke database
userSchema.pre('save', async function (next) {
  // Hanya jalankan fungsi ini jika password telah dimodifikasi (atau baru)
  if (!this.isModified('password')) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10); // Hasilkan salt dengan 10 putaran
  this.password = await bcrypt.hash(this.password, salt); // Hash password dengan salt
  next();
});

// --- Metode untuk Membandingkan Password ---
// Menambahkan metode ke skema untuk membandingkan password yang dimasukkan
// oleh user saat login dengan password yang tersimpan (hashed) di database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);