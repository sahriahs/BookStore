// frontend/src/pages/RegisterPage.jsx (dengan Tailwind CSS)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { register, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!username || !email || !password) {
      setMessage('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    const result = await register(username, email, password);
    if (result.success) {
      setMessage('Registration successful! Redirecting to home...');
      navigate('/');
    } else {
      setMessage(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-left">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={loadingAuth}
            />
          </div>
          <div className="mb-4 text-left">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={loadingAuth}
            />
          </div>
          <div className="mb-6 text-left">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              disabled={loadingAuth}
            />
          </div>
          <button 
            type="submit" 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loadingAuth}
          >
            {loadingAuth ? 'Registering...' : 'Register'}
          </button>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </form>
        <p className="mt-6 text-gray-600 text-sm">
          Already have an account? <Link to="/login" className="text-green-500 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;