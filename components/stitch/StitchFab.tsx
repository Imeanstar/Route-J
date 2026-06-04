import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

type Props = { bottom: number; onPress: () => void };

export function StitchFab({ bottom, onPress }: Props) {
  return (
    <Pressable style={[styles.fab, { bottom }]} onPress={onPress}>
      <MaterialIcons name="edit" size={28} color={colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
