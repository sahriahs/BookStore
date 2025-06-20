// frontend/src/pages/ShowBook.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
// import Spinner from '../components/Spinner'; // Jika ada komponen spinner Anda
import { useAuth } from '../contexts/AuthContext';

function ShowBook() {
  const [book, setBook] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Mengambil ID buku dari URL
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      if (!token) {
        setError('No token found. Please login.');
        setLoading(false);
        logout(); // Log out if no token
        return;
      }

      try {
        const response = await axios.get(`/books/${id}`, { // Mengambil detail buku berdasarkan ID
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBook(response.data); // Asumsi respons adalah objek buku itu sendiri
        setLoading(false);
      } catch (err) {
        console.error("Error fetching book details:", err);
        if (err.response && err.response.status === 401) {
          setError('Unauthorized: Your session has expired. Please log in again.');
          logout(); // Auto-logout on 401
        } else if (err.response && err.response.status === 404) {
            setError('Book not found.');
        } else {
            setError('Failed to fetch book details. Make sure your backend is running.');
        }
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, token, logout]); // Dependensi: id, token, dan logout

  if (loading) {
    return (
        <div className='p-4 bg-gray-50 min-h-screen flex justify-center items-center'>
            {/* <Spinner /> */}
            <p className="text-xl text-blue-500">Loading book details...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className='p-4 bg-gray-50 min-h-screen'>
            <BackButton />
            <p className="text-center text-red-600 text-xl mt-10">{error}</p>
        </div>
    );
  }

  // Pastikan objek book tidak kosong sebelum menampilkan
  if (!book || Object.keys(book).length === 0) {
    return (
        <div className='p-4 bg-gray-50 min-h-screen'>
            <BackButton />
            <p className="text-center text-gray-600 text-xl mt-10">No book details available.</p>
        </div>
    );
  }

  return (
    <div className='p-4 bg-gray-50 min-h-screen'>
      <BackButton />
      <h1 className='text-3xl font-bold text-center my-8 text-gray-800'>Book Details</h1>

      <div className='flex flex-col border-2 border-sky-400 rounded-xl w-full md:w-3/4 lg:w-1/2 p-4 mx-auto bg-white shadow-lg'>
        {/* <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Id:</span>
          <span>{book._id}</span>
        </div> */}
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Title:</span>
          <span>{book.title}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Author:</span>
          <span>{book.author}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Publish Year:</span>
          <span>{book.publishYear}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Status:</span>
          <span>{book.status}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Current Page:</span>
          <span>{book.currentPage}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Total Pages:</span>
          <span>{book.totalPages}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Rating:</span>
          <span>{book.rating === 0 ? 'Not yet rated' : `${book.rating} / 5`}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Notes:</span>
          <span>{book.notes || 'N/A'}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Cover Image:</span>
          {book.coverImage ? (
            <img src={book.coverImage} alt="Cover" className="w-32 h-48 object-contain border border-gray-200 rounded mt-2" />
          ) : (
            <span>N/A</span>
          )}
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Format:</span>
          <span>{book.format}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Start Date:</span>
          <span>{book.startDate ? new Date(book.startDate).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>End Date:</span>
          <span>{book.endDate ? new Date(book.endDate).toLocaleDateString() : 'N/A'}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Create Time:</span>
          <span>{new Date(book.createdAt).toString()}</span>
        </div>
        <div className='my-4'>
          <span className='text-xl mr-4 text-gray-700 font-semibold'>Last Update Time:</span>
          <span>{new Date(book.updatedAt).toString()}</span>
        </div>
      </div>
    </div>
  );
}

export default ShowBook;