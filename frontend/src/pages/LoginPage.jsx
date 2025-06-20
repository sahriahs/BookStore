// frontend/src/pages/LoginPage.jsx (dengan Tailwind CSS)
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { login, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email || !password) {
      setMessage('Email and password are required.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      setMessage('Login successful!');
      navigate('/'); // Redirect ke halaman utama setelah login
    } else {
      setMessage(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Login</h2>
        <form onSubmit={handleSubmit}>
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
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            disabled={loadingAuth}
          >
            {loadingAuth ? 'Logging In...' : 'Login'}
          </button>
          {message && (
            <p className={`mt-4 text-sm ${message.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </form>
        <p className="mt-6 text-gray-600 text-sm">
          Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;