// frontend/src/pages/DeleteBook.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
// import Spinner from '../components/Spinner'; // Jika Anda punya komponen spinner
import { useAuth } from '../contexts/AuthContext';

function DeleteBook() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { id } = useParams(); // Mengambil ID buku dari URL
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const handleDeleteBook = async () => {
    setLoading(true);
    setMessage('');

    if (!token) {
      setMessage('You are not authenticated. Please login.');
      logout();
      setLoading(false);
      return;
    }

    try {
      await axios.delete(`/books/${id}`, { // Menggunakan DELETE untuk menghapus
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      setMessage('Book deleted successfully!');
      navigate('/'); // Kembali ke homepage setelah berhasil dihapus
    } catch (error) {
      setLoading(false);
      console.error('Error deleting book:', error);
      if (error.response && error.response.status === 401) {
        setMessage('Unauthorized: Your session has expired. Please log in again.');
        logout();
      } else if (error.response && error.response.status === 404) {
        setMessage('Book not found.');
      } else {
        setMessage(`Error deleting book: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <div className='p-4 bg-gray-50 min-h-screen'>
      <BackButton />
      <h1 className='text-3xl font-bold text-center my-8 text-gray-800'>Delete Book</h1>

      {message && (
        <p className={`text-center text-lg font-medium mb-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      {loading ? (
        <div className='flex justify-center items-center h-40'>
          {/* <Spinner /> */}
          <p className="text-xl text-blue-500">Deleting book...</p>
        </div>
      ) : (
        <div className='flex flex-col items-center border-2 border-red-400 rounded-xl w-full md:w-1/2 p-8 mx-auto bg-white shadow-lg'>
          <h3 className='text-2xl text-center text-gray-700'>Are you sure you want to delete this book?</h3>
          <p className="text-center text-gray-500 mb-6">This action cannot be undone.</p>
          <button
            className='p-4 bg-red-600 text-white m-8 w-full rounded-md hover:bg-red-700 transition duration-300'
            onClick={handleDeleteBook}
          >
            Yes, Delete it
          </button>
        </div>
      )}
    </div>
  );
}

export default DeleteBook;