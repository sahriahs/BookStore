// frontend/src/pages/CreateBook.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
// import Spinner from '../components/Spinner'; // Jika Anda punya komponen spinner
import { useAuth } from '../contexts/AuthContext';
import { IoSearch } from 'react-icons/io5'; // Import ikon pencarian

function CreateBook() {
  // States untuk data buku
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publishYear, setPublishYear] = useState('');
  const [status, setStatus] = useState('To Read'); // Default status
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState('');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [format, setFormat] = useState('Paperback'); // Default format
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // States untuk proses loading dan pesan
  const [loading, setLoading] = useState(false); // Untuk proses simpan buku ke database
  const [message, setMessage] = useState('');

  // States baru untuk pencarian Google Books API
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const navigate = useNavigate();
  const { token, logout } = useAuth();

  // --- LOGIKA PENCARIAN GOOGLE BOOKS ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) { // Pastikan query tidak kosong
      setSearchError('Please enter a search query.');
      return;
    }
    setSearchLoading(true);
    setSearchResults([]); // Reset hasil sebelumnya
    setSearchError(null); // Reset error sebelumnya
    try {
      if (!token) { // Pastikan user terautentikasi untuk request API
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
      if (error.response && error.response.status === 401) {
        setSearchError('Unauthorized: Your session has expired. Please log in again.');
        logout();
      } else {
        setSearchError(error.response?.data?.message || 'Failed to fetch search results from Google Books API.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectBook = (book) => {
    const volumeInfo = book.volumeInfo;
    setTitle(volumeInfo.title || ''); // Judul
    setAuthor(volumeInfo.authors ? volumeInfo.authors.join(', ') : ''); // Penulis (join array jadi string)

    // Tahun terbit (ambil hanya tahunnya)
    if (volumeInfo.publishedDate) {
      const yearMatch = volumeInfo.publishedDate.match(/\d{4}/);
      setPublishYear(yearMatch ? yearMatch[0] : '');
    } else {
      setPublishYear('');
    }

    setTotalPages(volumeInfo.pageCount || ''); // Jumlah halaman
    setCoverImage(volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || ''); // Gambar sampul

    // Reset search state setelah memilih
    setSearchResults([]);
    setSearchQuery('');
    setSearchError(null);
    setMessage('Book details pre-filled from search. Please review and save.');
  };
  // --- AKHIR LOGIKA PENCARIAN GOOGLE BOOKS ---


  const handleSaveBook = async () => {
    if (!token) {
      setMessage('You are not authenticated. Please login.');
      return;
    }

    // Validasi dasar sebelum menyimpan
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
      publishYear: Number(publishYear), // Pastikan ini number
      status,
      currentPage: Number(currentPage),
      totalPages: Number(totalPages),
      rating: Number(rating),
      notes,
      coverImage,
      format,
      startDate: startDate || undefined, // Set undefined jika kosong
      endDate: endDate || undefined,     // Set undefined jika kosong
    };

    setLoading(true);
    setMessage(''); // Bersihkan pesan sebelumnya
    try {
      await axios.post('/books', data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      setMessage('Book created successfully!');
      navigate('/'); // Kembali ke homepage
    } catch (error) {
      setLoading(false);
      console.error('Error creating book:', error);
      if (error.response && error.response.status === 401) {
        setMessage('Unauthorized: Your session has expired. Please log in again.');
        logout();
      } else {
        setMessage(`Error: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <div className='p-4 bg-gray-50 min-h-screen'>
      <BackButton />
      <h1 className='text-3xl font-bold text-center my-8 text-gray-800'>Add New Book</h1>

      {message && (
        <p className={`text-center text-lg font-medium mb-4 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      {/* Bagian Pencarian Google Books */}
      <div className="flex flex-col border-2 border-purple-400 rounded-xl w-full md:w-3/4 lg:w-1/2 p-4 mx-auto bg-white shadow-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Search from Google Books</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => { // Memungkinkan pencarian dengan tombol Enter
              if (e.key === 'Enter') handleSearch();
            }}
            className="border-2 border-gray-300 px-4 py-2 w-full rounded-md focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition duration-300"
            disabled={searchLoading} // Disable saat loading
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
                {book.volumeInfo.imageLinks?.thumbnail && ( // Tampilkan thumbnail jika ada
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

      {/* Formulir Manual (akan diisi otomatis jika memilih dari pencarian) */}
      <div className='flex flex-col border-2 border-sky-400 rounded-xl w-full md:w-3/4 lg:w-1/2 p-4 mx-auto bg-white shadow-lg'>
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Or Enter Details Manually</h2>
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
          {coverImage && ( // Pratinjau gambar jika URL ada
            <img src={coverImage} alt="Cover Preview" className="mt-2 w-24 h-32 object-contain border border-gray-200 rounded" />
          )}
        </div>

        {/* Personal Details (Pengguna isi sendiri) */}
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
          onClick={handleSaveBook}
          disabled={loading} // Disable tombol saat loading
        >
          {loading ? 'Saving...' : 'Save Book'}
        </button>
      </div>
    </div>
  );
}

export default CreateBook;