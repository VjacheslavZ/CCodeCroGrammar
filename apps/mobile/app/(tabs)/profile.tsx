import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { apiClient } from '@/api/client';
import { clearTokens, getRefreshToken } from '@/api/token-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearUser } from '@/store/auth.slice';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleSignOut = async () => {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken });
      } catch {
        // Logout is best-effort; clear local state regardless
      }
    }
    await clearTokens();
    dispatch(clearUser());
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">{t('profile.title')}</ThemedText>
      {user && <ThemedText style={styles.email}>{user.email}</ThemedText>}
      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <ThemedText style={styles.signOutText}>{t('auth.signOut')}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  email: {
    marginTop: 8,
    opacity: 0.7,
  },
  signOutButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#E53935',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
