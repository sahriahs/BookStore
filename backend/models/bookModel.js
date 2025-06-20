import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    publishYear: {
      type: Number,
      required: true,
    },
    coverImage: {
      type: String, 
    },
    status: {
      type: String,
      required: true,
      // Membatasi nilai yang diizinkan untuk status
      enum: ['To Read', 'Reading', 'Completed', 'Dropped', 'On Hold'],
      default: 'To Read', // Status default saat pertama kali ditambahkan
    },
    startDate: {
      type: Date,
      default: null, // Tanggal mulai membaca (bisa null jika belum mulai)
    },
    endDate: {
      type: Date,
      default: null, // Tanggal selesai membaca (bisa null jika belum selesai)
    },
    currentPage: {
      type: Number,
      default: 0, // Halaman terakhir yang dibaca (untuk status 'Reading')
    },
    totalPages: {
      type: Number,
      default: 0, // Total halaman buku (penting untuk menghitung progres)
    },
    rating: {
      type: Number,
      // min: 1, // Rating minimum 1
      max: 5, // Rating maksimum 5
      default: null, // Rating pribadi pengguna (bisa null jika belum dirating)
      required: false,
    },
    notes: {
      type: String, // Catatan pribadi pengguna tentang buku
    },
    format: {
        type: String,
        // Contoh format buku yang mungkin
        enum: ['Paperback', 'Hardcover', 'Ebook', 'Audiobook', 'Other'],
        default: 'Other',
    },

    user: {
      type: mongoose.Schema.Types.ObjectId, // Tipe data ini adalah ID unik dari dokumen lain
      ref: 'User', // 'User' adalah nama model pengguna Anda (misal: export const User = mongoose.model('User', userSchema);)
      required: true, // Setiap buku harus dimiliki oleh seorang pengguna
    },
  },
  {
    timestamps: true, // ini biar otomatis ada craeteAt dan UpdateAt
  }
);


export const Book = mongoose.model('Book', bookSchema);
