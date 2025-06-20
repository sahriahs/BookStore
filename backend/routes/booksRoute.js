import express from 'express';
import { Book } from '../models/bookModel.js';
import { query, validationResult } from 'express-validator';
import { protect } from '../middleware/authMiddleware.js';
import axios from 'axios';

const router = express.Router();

// --- ROUTE BARU: Mencari Buku dari Google Books API ---
router.get('/external-search', protect, async (req, res) => {
    try {
        const { q } = req.query; // Dapatkan query pencarian dari parameter URL 'q'

        if (!q) {
            return res.status(400).json({ message: 'Query parameter "q" (e.g., title, author, ISBN) is required for external search.' });
        }

        // URL dasar Google Books API
        // encodeURIComponent untuk memastikan query aman di URL
        const googleBooksApiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}`;

        // Melakukan request ke Google Books API
        const response = await axios.get(googleBooksApiUrl);

        // Mengembalikan data mentah dari Google Books API
        // Di frontend, Anda bisa memilih field mana yang relevan (misalnya title, author, publishYear, coverImage, dll.)
        return res.status(200).json(response.data);

    } catch (error) {
        console.error("Error fetching from Google Books API:", error.message);
        // Penanganan error lebih lanjut dari Axios
        if (error.response) {
            // Request dibuat dan server merespons dengan status di luar 2xx
            return res.status(error.response.status).json({ message: error.response.data });
        } else if (error.request) {
            // Request dibuat tapi tidak ada respons diterima
            return res.status(500).json({ message: 'No response received from Google Books API.' });
        } else {
            // Ada masalah saat menyiapkan request
            return res.status(500).json({ message: error.message });
        }
    }
});

// route untuk delete
router.delete('/:id', protect, async (req, res) => {
  try {
    // 1. Ambil ID dari Parameter URL
    const { id } = req.params;

    // 2. Cari dan Hapus Buku di Database
    // Menggunakan Book.findByIdAndDelete(id) untuk mencari dan menghapus dokumen
    const result = await Book.findOneAndDelete({ _id: id, user: req.user._id });

    // 3. Periksa Jika Buku Tidak Ditemukan
    if (!result) {
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }

    // 4. Kirim Respons Sukses
    // Status 200 (OK) dan pesan sukses. Biasanya tidak perlu mengirim kembali data buku yang dihapus.
    return res.status(200).send({ message: 'Buku berhasil dihapus' });

  } catch (error) {
    // 5. Tangani Error
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
});


// 3. Contoh Rute POST untuk Menambahkan Item Baru
// Rute ini akan menerima data dari klien untuk membuat item baru
router.post(
  '/',
  protect,
  async (req, response) => {
    const errors = validationResult(req);
    if (
      !req.body.title ||
      !req.body.author ||
      !req.body.publishYear ||
      !req.body.status || // Pastikan status dikirim
      !req.body.totalPages // Pastikan totalPages dikirim
    ) {
      return response.status(400).send({
        message: 'Send all required fields: title, author, publishYear',
      });
    }
    try {

      const newBook = {
        title: req.body.title,
        author: req.body.author,
        publishYear: req.body.publishYear,
        coverImage: req.body.coverImage,
        status: req.body.status,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        currentPage: req.body.currentPage,
        totalPages: req.body.totalPages,
        rating: req.body.rating,
        notes: req.body.notes,
        format: req.body.format,
        user: req.user._id,
      };

      const book = await Book.create(newBook);
      return response.status(201).send(book);

    } catch (error) {
      console.log(error.message);
      response.status(500).send({ message: error.message });
    }
  });

// GET --------------------------------------------------
router.get('/', protect, async (req, res) => {
  try {
    // Menggunakan Book.find({}) untuk mencari semua dokumen di koleksi 'books'
    const query = { user: req.user._id };
    const sort = {};

    if (req.query.search) {
      const searchKeyword = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchKeyword },
        { author: searchKeyword },
      ]
    }

    // 3. Implementasi Filter
    if (req.query.status) {
      // Pastikan status yang diminta valid (misalnya 'To Read', 'Reading', 'Completed', dll.)
      // Anda bisa menambahkan validasi lebih ketat di sini jika perlu
      query.status = req.query.status;
    }
    if (req.query.format) { // Contoh filter lain berdasarkan format
      query.format = req.query.format;
    }
    // Tambahkan filter lain sesuai kebutuhan (misal: rating minimal, publishYear tertentu)
    if (req.query.minRating) {
      query.rating = { $gte: Number(req.query.minRating) };
    }
    if (req.query.maxRating) {
      query.rating = { ...query.rating, $lte: Number(req.query.maxRating) };
    }


    // 4. Implementasi Sorting
    if (req.query.sortBy) {
      const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // -1 untuk descending, 1 untuk ascending
      sort[req.query.sortBy] = sortOrder; // Misal: { publishYear: -1 } atau { title: 1 }
    } else {
      // Default sorting jika tidak ada parameter sortBy
      sort.createdAt = -1; // Urutkan berdasarkan waktu pembuatan terbaru secara default
    }


    const books = await Book.find(query).sort(sort);

    // Mengirim respons sukses (200 OK) dengan data buku dalam format JSON
    return res.status(200).json({
      count: books.length,
      data: books,
    });

  } catch (error) {
    // Menangani error
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
});


router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({ _id: id, user: req.user._id });

    if (!book) {
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }

    return res.status(200).json(book);

  } catch (error) {
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
});

// route for update
router.put('/:id', protect, async (req, res) => {
  try {
    // 1. Validasi Data yang Diterima
    // Kita masih perlu memastikan field yang wajib ada jika ingin diupdate
    if (
      !req.body.title ||
      !req.body.author ||
      !req.body.publishYear ||
      !req.body.status ||
      !req.body.totalPages
    ) {
      return res.status(400).send({
        message: 'Kirim semua field yang dibutuhkan untuk update: title, author, publishYear',
      });
    }
    const { id } = req.params;
    const result = await Book.findOneAndUpdate(
      { _id: id, user: req.user._id }, // Filter by _id AND user_id
      req.body,
      { new: true } // Mengembalikan dokumen yang sudah diupdate
    );

    if (!result) {
      console.log(error.message)
      return res.status(404).json({ message: 'Buku tidak ditemukan' });
    }

    return res.status(200).send({ message: 'Buku berhasil diupdate', book: result });

  } catch (error) {
    // 6. Tangani Error
    console.log(error.message);
    res.status(500).send({ message: error.message });
  }
});


export default router;