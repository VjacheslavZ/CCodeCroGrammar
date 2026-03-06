import { useTranslation } from 'react-i18next';
import { View, Text, StyleSheet } from 'react-native';

export default function ExercisesScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('nav.exercises')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600' },
});
