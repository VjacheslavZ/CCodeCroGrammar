import { Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        {t('common.appName')}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {t('auth.welcome')}
      </Typography>
    </Container>
  );
}
