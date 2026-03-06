import { useTranslation } from 'react-i18next';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function LoginScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('common.appName')}</Text>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>{t('auth.signInWithGoogle')}</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.appleButton]}>
        <Text style={styles.buttonText}>{t('auth.signInWithApple')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32 },
  button: {
    backgroundColor: '#1565c0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  appleButton: { backgroundColor: '#333' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
