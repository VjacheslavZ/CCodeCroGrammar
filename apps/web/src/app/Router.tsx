import { Routes, Route, Navigate } from 'react-router-dom';

import { LoginPage } from '../features/auth/LoginPage';

import { HomePage } from './pages/HomePage';

export function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
