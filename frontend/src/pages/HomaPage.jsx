// frontend/src/pages/HomePage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox, MdOutlineDelete, MdLogout } from 'react-icons/md';
import { BsInfoCircle } from 'react-icons/bs';
import { AiOutlineEdit } from 'react-icons/ai';
import { FaSortAlphaDown, FaSortAlphaUp, FaSortNumericDown, FaSortNumericUp } from 'react-icons/fa'; // Icons for sorting
import { IoSearchOutline } from 'react-icons/io5'; // Icon for search

// import Spinner from '../components/Spinner'; // Jika Anda punya komponen spinner
import { useAuth } from '../contexts/AuthContext';

function HomePage() {
  const [books, setBooks] = useState([]); // Daftar buku asli dari API
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, user, logout } = useAuth();

  // States untuk Pencarian & Filter & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'To Read', 'Reading', 'Completed'
  const [filterFormat, setFilterFormat] = useState('All'); // 'All', 'Paperback', 'Hardcover', 'Ebook', 'Audiobook'
  const [sortField, setSortField] = useState('createdAt'); // Field untuk sorting default
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' atau 'desc'

  // Mengambil data buku dari API
  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!token) {
      setError('No token found. Please login.');
      setLoading(false);
      logout();
      return;
    }

    axios.get('/books', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        setBooks(response.data.data); // Asumsi respons adalah { count: X, data: [...] }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        if (err.response && err.response.status === 401) {
          setError('Unauthorized: Your session has expired. Please log in again.');
          logout();
        } else {
          setError('Failed to fetch books. Make sure your backend is running.');
        }
        setLoading(false);
      });
  }, [token, logout]); // Dependensi: token dan logout

  // --- Logika Pencarian, Filter, dan Sorting ---
  const filteredAndSortedBooks = useMemo(() => {
    let currentBooks = [...books]; // Buat salinan untuk dimanipulasi

    // 1. Pencarian
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      currentBooks = currentBooks.filter(book =>
        book.title.toLowerCase().includes(lowerCaseQuery) ||
        book.author.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // 2. Filter Status
    if (filterStatus !== 'All') {
      currentBooks = currentBooks.filter(book => book.status === filterStatus);
    }

    // 3. Filter Format
    if (filterFormat !== 'All') {
      currentBooks = currentBooks.filter(book => book.format === filterFormat);
    }

    // 4. Sorting
    currentBooks.sort((a, b) => {
      let valueA, valueB;

      // Penanganan khusus untuk string vs number, dan date
      if (sortField === 'publishYear' || sortField === 'totalPages' || sortField === 'rating' || sortField === 'currentPage') {
        valueA = Number(a[sortField]);
        valueB = Number(b[sortField]);
      } else if (sortField === 'createdAt' || sortField === 'updatedAt' || sortField === 'startDate' || sortField === 'endDate') {
        valueA = new Date(a[sortField]).getTime();
        valueB = new Date(b[sortField]).getTime();
      } else { // Untuk string (title, author, status, format)
        valueA = a[sortField] ? a[sortField].toLowerCase() : '';
        valueB = b[sortField] ? b[sortField].toLowerCase() : '';
      }

      if (valueA < valueB) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return currentBooks;
  }, [books, searchQuery, filterStatus, filterFormat, sortField, sortOrder]);

  // Fungsi untuk toggle sort order
  const toggleSortOrder = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc'); // Default asc saat ganti field
    }
  };

  // Helper untuk icon sorting
  const getSortIcon = (field) => {
    if (sortField === field) {
      if (sortOrder === 'asc') {
        return ['publishYear', 'totalPages', 'rating', 'currentPage', 'createdAt', 'updatedAt', 'startDate', 'endDate'].includes(field) ? <FaSortNumericUp className="inline ml-1" /> : <FaSortAlphaUp className="inline ml-1" />;
      } else {
        return ['publishYear', 'totalPages', 'rating', 'currentPage', 'createdAt', 'updatedAt', 'startDate', 'endDate'].includes(field) ? <FaSortNumericDown className="inline ml-1" /> : <FaSortAlphaDown className="inline ml-1" />;
      }
    }
    return null;
  };


  if (loading) {
    return (
      <div className='p-4 bg-gray-50 min-h-screen flex justify-center items-center'>
        {/* <Spinner /> */}
        <p className="text-xl text-blue-500">Loading books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-gray-50 min-h-screen'>
        <div className='flex justify-end mb-4'>
          {user && <span className='text-gray-700 mr-4'>Hello, {user.username}!</span>}
          <button
            onClick={logout}
            className="flex items-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            <MdLogout className="mr-2" /> Logout
          </button>
        </div>
        <p className="text-center text-red-600 text-xl mt-10">{error}</p>
      </div>
    );
  }

  return (
    <div className='p-4 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold text-gray-800'>My Books</h1>
        <div className='flex items-center gap-4'>
          {user && <span className='text-gray-700 font-medium'>Hello, {user.username}!</span>}
          <Link to='/books/create'>
            <MdOutlineAddBox className='text-sky-800 text-4xl hover:text-sky-600 transition duration-300' />
          </Link>
          <button
            onClick={logout}
            className="flex items-center bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            <MdLogout className="mr-2" /> Logout
          </button>
        </div>
      </div>

      {/* Search, Filter, Sort Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Filter & Sort Books</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search Bar */}
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <IoSearchOutline className="text-gray-500 text-2xl mx-3" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow py-2 px-3 focus:outline-none"
            />
          </div>

          {/* Filter by Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 py-2 px-3 rounded-md focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Statuses</option>
            <option value="To Read">To Read</option>
            <option value="Reading">Reading</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Filter by Format */}
          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="border border-gray-300 py-2 px-3 rounded-md focus:outline-none focus:border-sky-500"
          >
            <option value="All">All Formats</option>
            <option value="Paperback">Paperback</option>
            <option value="Hardcover">Hardcover</option>
            <option value="Ebook">Ebook</option>
            <option value="Audiobook">Audiobook</option>
          </select>
        </div>

        {/* Sort By Options */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-700 text-sm">
          <span className="font-medium mr-2">Sort By:</span>
          <button
            onClick={() => toggleSortOrder('title')}
            className={`py-1 px-2 rounded-md ${sortField === 'title' ? 'bg-sky-100 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Title {getSortIcon('title')}
          </button>
          <button
            onClick={() => toggleSortOrder('author')}
            className={`py-1 px-2 rounded-md ${sortField === 'author' ? 'bg-sky-100 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Author {getSortIcon('author')}
          </button>
          <button
            onClick={() => toggleSortOrder('publishYear')}
            className={`py-1 px-2 rounded-md ${sortField === 'publishYear' ? 'bg-sky-100 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Publish Year {getSortIcon('publishYear')}
          </button>
          <button
            onClick={() => toggleSortOrder('status')}
            className={`py-1 px-2 rounded-md ${sortField === 'status' ? 'bg-sky-100 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Status {getSortIcon('status')}
          </button>
          <button
            onClick={() => toggleSortOrder('rating')}
            className={`py-1 px-2 rounded-md ${sortField === 'rating' ? 'bg-sky-100 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Rating {getSortIcon('rating')}
          </button>
          <button
            onClick={() => toggleSortOrder('createdAt')}
            className={`py-1 px-2 rounded-md ${sortField === 'createdAt' ? 'bg-sky-100 font-semibold' : 'hover:bg-gray-100'}`}
          >
            Added Date {getSortIcon('createdAt')}
          </button>
        </div>
      </div>
      {/* End Search, Filter, Sort Section */}

      {filteredAndSortedBooks.length === 0 ? (
        <p className="text-center text-gray-600 text-xl mt-10">
          No books found matching your criteria.
        </p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
          {filteredAndSortedBooks.map((book) => (
            <div key={book._id} className='bg-white rounded-lg shadow-md overflow-hidden flex flex-col'>
              {book.coverImage && (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-48 object-cover border-b border-gray-100"
                />
              )}
              <div className="p-4 flex-grow">
                <h3 className='text-xl font-semibold text-gray-800 mb-2 line-clamp-2'>
                  {book.title}
                </h3>
                <p className='text-gray-600 text-sm mb-1'>
                  <span className='font-medium'>Author:</span> {book.author}
                </p>
                <p className='text-gray-600 text-sm mb-1'>
                  <span className='font-medium'>Year:</span> {book.publishYear}
                </p>
                <p className='text-gray-600 text-sm mb-1'>
                  <span className='font-medium'>Status:</span> {book.status}
                </p>
                <p className='text-gray-600 text-sm mb-1'>
                  <span className='font-medium'>Rating:</span> {book.rating > 0 ? `${book.rating}/5` : 'N/A'}
                </p>
                <p className='text-gray-600 text-sm'>
                  <span className='font-medium'>Format:</span> {book.format}
                </p>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t">
                <Link
                  to={`/books/details/${book._id}`}
                  className="text-blue-600 hover:text-blue-800 transition duration-300"
                  title="View Details"
                >
                  <BsInfoCircle className="text-2xl" />
                </Link>
                <Link
                  to={`/books/edit/${book._id}`}
                  className="text-yellow-600 hover:text-yellow-800 transition duration-300"
                  title="Edit Book"
                >
                  <AiOutlineEdit className="text-2xl" />
                </Link>
                <Link
                  to={`/books/delete/${book._id}`}
                  className="text-red-600 hover:text-red-800 transition duration-300"
                  title="Delete Book"
                >
                  <MdOutlineDelete className="text-2xl" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;