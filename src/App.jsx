import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import CarPage from './pages/CarPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminCarsPage from './pages/admin/AdminCarsPage';
import CarFormPage from './pages/admin/CarFormPage';

export default function App() {
  return (
      <>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
              <Route
                  path="/admin/cars/new"
                  element={
                      <ProtectedRoute roles={['ADMIN']}>
                          <CarFormPage />
                      </ProtectedRoute>
                  }
              />
              <Route
                  path="/admin/cars/:id/edit"
                  element={
                      <ProtectedRoute roles={['ADMIN']}>
                          <CarFormPage />
                      </ProtectedRoute>
                  }
              />
            <Route path="/cars" element={<CatalogPage />} />
            <Route path="/cars/:id" element={<CarPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
              <Route
                  path="/admin/cars"
                  element={
                      <ProtectedRoute roles={['ADMIN']}>
                          <AdminCarsPage />
                      </ProtectedRoute>
                  }
              />
          </Routes>
        </main>
      </>
  );
}