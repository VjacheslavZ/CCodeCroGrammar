import { Box, Button, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function LoginPage() {
  const { t } = useTranslation();

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          {t('common.appName')}
        </Typography>
        <Button variant="contained" fullWidth onClick={handleGoogleLogin} size="large">
          {t('auth.signInWithGoogle')}
        </Button>
        <Button variant="outlined" fullWidth disabled size="large">
          {t('auth.signInWithApple')}
        </Button>
      </Box>
    </Container>
  );
}
