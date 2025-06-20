// server.js
import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import booksRoute from "./routes/booksRoute.js";
import userRoute from './routes/userRoute.js';
import cors from 'cors';

const app = express();

// Middleware untuk memparsing body permintaan dalam format JSON
app.use(express.json());

// middleware cors
// allowed all
app.use(cors()); 

// --- RUTE API DASAR ---

// 1. Rute Dasar (Home Route)
// Ini adalah rute yang akan merespons ketika klien mengakses URL dasar server, misalnya http://localhost:PORT/
app.get('/', (req, res) => {
  console.log(req); // Untuk melihat detail permintaan di konsol server
  return res.status(234).send('Selamat datang di API MERN sederhana saya!');
});

app.use('/books', booksRoute)

app.use('/api/users', userRoute)
// --- END RUTE API DASAR ---



mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
