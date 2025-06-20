// frontend/src/pages/EditBook.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
// import Spinner from '../components/Spinner'; // Jika Anda punya komponen spinner
import { useAuth } from '../contexts/AuthContext';
import { IoSearch } from 'react-icons/io5'; // Untuk ikon pencarian

function EditBook() {
  // States untuk data buku
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publishYear, setPublishYear] = useState('');
  const [status, setStatus] = useState('To Read');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [format, setFormat] = useState('Paperback');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // States untuk proses loading dan pesan
  const [loading, setLoading] = useState(false); // Untuk proses simpan/update
  const [message, setMessage] = useState('');

  // States untuk pencarian Google Books API (sama seperti CreateBook)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const { id } = useParams(); // Mengambil ID buku dari URL
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // useEffect untuk memuat data buku saat komponen pertama kali di-render
  useEffect(() => {
    setLoading(true);
    setMessage('');
    if (!token) {
      setMessage('You are not authenticated. Please login.');
      logout();
      setLoading(false);
      return;
    }

    axios.get(`/books/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const bookData = response.data;
        setTitle(bookData.title || '');
        setAuthor(bookData.author || '');
        setPublishYear(bookData.publishYear || '');
        setStatus(bookData.status || 'To Read');
        setCurrentPage(bookData.currentPage || 0);
        setTotalPages(bookData.totalPages || '');
        setRating(bookData.rating || 0);
        setNotes(bookData.notes || '');
        setCoverImage(bookData.coverImage || '');
        setFormat(bookData.format || 'Paperback');
        setStartDate(bookData.startDate ? new Date(bookData.startDate).toISOString().split('T')[0] : '');
        setEndDate(bookData.endDate ? new Date(bookData.endDate).toISOString().split('T')[0] : '');
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        console.error('Error fetching book for editing:', error);
        if (error.response && error.response.status === 401) {
          setMessage('Unauthorized: Your session has expired. Please log in again.');
          logout();
        } else if (error.response && error.response.status === 404) {
          setMessage('Book not found.');
        } else {
          setMessage(`Error loading book: ${error.response?.data?.message || error.message}`);
        }
      });
  }, [id, token, logout]); // Dependensi: id, token, dan logout

  // --- LOGIKA PENCARIAN GOOGLE BOOKS (SAMA SEPERTI CREATEBOOK) ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query.');
      return;
    }
    setSearchLoading(true);
    setSearchResults([]);
    setSearchError(null);
    try {
      if (!token) {
        setSearchError('Not authenticated for search. Please log in.');
        setSearchLoading(false);
        return;
      }
      const response = await axios.get(`/books/external-search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.items) {
        setSearchResults(response.data.items);
      } else {
        setSearchResults([]);
        setSearchError('No results found.');
      }
    } catch (error) {
      console.error('Error during Google Books search:', error);
      setSearchError(error.response?.data?.message || 'Failed to fetch search results from Google Books API.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectBook = (book) => {
    const volumeInfo = book.volumeInfo;
    setTitle(volumeInfo.title || '');
    setAuthor(volumeInfo.authors ? volumeInfo.authors.join(', ') : '');

    if (volumeInfo.publishedDate) {
      const yearMatch = volumeInfo.publishedDate.match(/\d{4}/);
      setPublishYear(yearMatch ? yearMatch[0] : '');
    } else {
      setPublishYear('');
    }

    setTotalPages(volumeInfo.pageCount || '');
    setCoverImage(volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || '');

    setSearchResults([]);
    setSearchQuery('');
    setSearchError(null);
    setMessage('Book details pre-filled from search. Please review and save.');
  };
  // --- AKHIR LOGIKA PENCARIAN GOOGLE BOOKS ---

  // Fungsi untuk menangani update buku
  const handleEditBook = async () => {
    if (!token) {
      setMessage('You are not authenticated. Please login.');
      return;
    }

    if (!title || !author || !publishYear || !status || !totalPages) {
        setMessage('Please fill in all required fields (Title, Author, Publish Year, Status, Total Pages).');
        return;
    }
    if (parseInt(totalPages) <= 0) {
        setMessage('Total pages must be a positive number.');
        return;
    }
    if (currentPage < 0) {
        setMessage('Current page cannot be negative.');
        return;
    }
    if (parseInt(currentPage) > parseInt(totalPages)) {
        setMessage('Current page cannot exceed total pages.');
        return;
    }

    const data = {
      title,
      author,
      publishYear: Number(publishYear),
      status,
      currentPage: Number(currentPage),
      totalPages: Number(totalPages),
      rating: Number(rating),
      notes,
      coverImage,
      format,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    setLoading(true);
    setMessage('');
    try {
      await axios.put(`/books/${id}`, data, { // Menggunakan PUT untuk update
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      setMessage('Book updated successfully!');
      navigate('/'); // Kembali ke homepage setelah update
    } catch (error) {
      setLoading(false);
      console.error('Error updating book:', error);
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className='p-4 bg-gray-50 min-h-screen'>
      <BackButton />
      <h1 className='text-3xl font-bold text-center my-8 text-gray-800'>Edit Book</h1>

      {message && (
        <p className={`text-center text-lg font-medium mb-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      {/* Bagian Pencarian Google Books (sama seperti CreateBook) */}
      <div className="flex flex-col border-2 border-purple-400 rounded-xl w-full md:w-3/4 lg:w-1/2 p-4 mx-auto bg-white shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Search from Google Books to Update Details</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            className="border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition duration-300"
            disabled={searchLoading}
          >
            {searchLoading ? 'Searching...' : <IoSearch className="text-xl" />}
          </button>
        </div>
        {searchError && (
          <p className="text-red-600 text-sm mb-4">{searchError}</p>
        )}
        {searchResults.length > 0 && (
          <div className="border border-gray-200 rounded-md max-h-80 overflow-y-auto">
            {searchResults.map((book) => (
              <div key={book.id} className="flex items-center gap-4 p-3 border-b last:border-b-0 hover:bg-gray-50">
                {book.volumeInfo.imageLinks?.thumbnail && (
                  <img 
                    src={book.volumeInfo.imageLinks.thumbnail} 
                    alt="Book Cover" 
                    className="w-16 h-20 object-cover rounded" 
                  />
                )}
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-800">{book.volumeInfo.title}</h3>
                  <p className="text-sm text-gray-600">
                    {book.volumeInfo.authors ? `by ${book.volumeInfo.authors.join(', ')}` : 'Unknown Author'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {book.volumeInfo.publishedDate ? `Published: ${book.volumeInfo.publishedDate.split('-')[0]}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleSelectBook(book)}
                  className="bg-sky-500 hover:bg-sky-600 text-white text-sm py-1 px-3 rounded-md transition duration-300"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulir Edit Buku */}
      <div className='flex flex-col border-2 border-sky-400 rounded-xl w-full md:w-3/4 lg:w-1/2 p-4 mx-auto bg-white shadow-lg'>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Edit Details</h2>
        {/* Field Title */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Title</label>
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          />
        </div>
        {/* Field Author */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Author</label>
          <input
            type='text'
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          />
        </div>
        {/* Field Publish Year */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Publish Year</label>
          <input
            type='number'
            value={publishYear}
            onChange={(e) => setPublishYear(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          />
        </div>
        {/* Field Total Pages */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Total Pages</label>
          <input
            type='number'
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          />
        </div>
        {/* Field Cover Image URL */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Cover Image URL</label>
          <input
            type='text'
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          />
          {coverImage && (
            <img src={coverImage} alt="Cover Preview" className="mt-2 w-24 h-32 object-contain border border-gray-200 rounded" />
          )}
        </div>

        {/* Personal Details (Bisa diubah juga) */}
        <h3 className="text-xl font-semibold mb-2 mt-6 text-gray-800 border-t pt-4">Your Personal Details for this Book:</h3>
        {/* Field Status */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          >
            <option value="To Read">To Read</option>
            <option value="Reading">Reading</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        {/* Field Current Page */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Current Page</label>
          <input
            type='number'
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          />
        </div>
        {/* Field Rating */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Rating (0-5)</label>
          <input
            type='number'
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            min="0"
            max="5"
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          />
        </div>
        {/* Field Notes */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500 h-24'
          ></textarea>
        </div>
        {/* Field Format */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          >
            <option value="Paperback">Paperback</option>
            <option value="Hardcover">Hardcover</option>
            <option value="Ebook">Ebook</option>
            <option value="Audiobook">Audiobook</option>
          </select>
        </div>
        {/* Field Start Date */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>Start Date</label>
          <input
            type='date'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          />
        </div>
        {/* Field End Date */}
        <div className='my-4'>
          <label className='text-xl mr-4 text-gray-700'>End Date</label>
          <input
            type='date'
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className='border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-sky-500'
          />
        </div>
        <button 
          className='p-2 bg-sky-600 m-8 text-white rounded-md hover:bg-sky-700 transition duration-300'
          onClick={handleEditBook} // Menggunakan handleEditBook
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default EditBook;