// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomaPage';
import LoginPage from './pages/LoginPage'; // Pastikan path benar
import RegisterPage from './pages/RegisterPage'; // Pastikan path benar
import CreateBook from './pages/CreateBook';
import ShowBook from './pages/ShowBook';
import EditBook from './pages/EditBook';
import DeleteBook from './pages/DeleteBook';


const ProtectedRoute = ({ children }) => {
  const { user, loadingAuth } = useAuth();

  // --- TAMBAH LOG INI ---
  console.log('ProtectedRoute Rendered. User:', user, 'LoadingAuth:', loadingAuth);
  // --- END LOG ---

  if (loadingAuth) {
    // --- TAMBAH LOG INI ---
    console.log('ProtectedRoute: Still loading auth. Displaying loading message.');
    // --- END LOG ---
    return <p className="text-center text-lg mt-10">Loading authentication...</p>;
  }

  if (!user) {
    // --- TAMBAH LOG INI ---
    console.log('ProtectedRoute: User is null, attempting to redirect to /login.');
    // --- END LOG ---
    return <Navigate to="/login" replace />;
  }
  // --- TAMBAH LOG INI ---
  console.log('ProtectedRoute: User exists, rendering children.');
  // --- END LOG ---
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/"
            element={<ProtectedRoute><HomePage /></ProtectedRoute>}
          />
          <Route
            path="/books/create"
            element={<ProtectedRoute><CreateBook /></ProtectedRoute>}
          />
          <Route // <--- Tambahkan rute ini untuk ShowBook
            path="/books/details/:id" // :id adalah parameter untuk ID buku
            element={<ProtectedRoute><ShowBook /></ProtectedRoute>}
          />
          <Route // <--- Tambahkan rute ini untuk EditBook
            path="/books/edit/:id" // :id adalah parameter untuk ID buku yang akan diedit
            element={<ProtectedRoute><EditBook /></ProtectedRoute>}
          />
          <Route // <--- Tambahkan rute ini untuk EditBook
            path="/books/delete/:id" // :id adalah parameter untuk ID buku yang akan diedit
            element={<ProtectedRoute><DeleteBook /></ProtectedRoute>}
          />
        </Routes>

      </Router>
    </AuthProvider>
  );
}

export default App;