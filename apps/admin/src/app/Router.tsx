import { Typography, Container } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate } from 'react-router-dom';

function DashboardPage() {
  const { t } = useTranslation();
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4">{t('nav.dashboard')}</Typography>
    </Container>
  );
}

export function Router() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
