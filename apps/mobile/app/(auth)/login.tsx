import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGoogleAuth } from '@/hooks/use-google-auth';

export default function LoginScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const { promptAsync, isReady } = useGoogleAuth();

  const handleGoogleSignIn = () => {
    promptAsync();
  };

  // TODO: implement Apple sign-in
  const handleAppleSignIn = () => {};

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">{t('common.appName')}</ThemedText>
        <ThemedText style={styles.subtitle}>{t('auth.welcome')}</ThemedText>
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, styles.googleButton, !isReady && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={!isReady}
        >
          <ThemedText style={styles.googleButtonText}>{t('auth.signInWithGoogle')}</ThemedText>
        </Pressable>

        {Platform.OS === 'ios' && (
          <Pressable
            style={[
              styles.button,
              colorScheme === 'dark' ? styles.appleButtonDark : styles.appleButtonLight,
            ]}
            onPress={handleAppleSignIn}
          >
            <ThemedText
              style={[styles.appleButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}
            >
              {t('auth.signInWithApple')}
            </ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  button: {
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButtonLight: {
    backgroundColor: '#000',
  },
  appleButtonDark: {
    backgroundColor: '#fff',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
