import { StyleSheet, Text, View } from 'react-native';
import { APP_NAME } from '@/constants/app';
import { colors, type } from '@/constants/theme';

type Props = { size?: number; showWordmark?: boolean };

/** RouteJ 핀 로고 (SVG 대신 RN View) */
export function BrandLogo({ size = 32, showWordmark = true }: Props) {
  const pinH = size * 0.9;
  const pinW = size * 0.72;
  return (
    <View style={styles.row}>
      <View style={[styles.pin, { width: pinW, height: pinH, borderRadius: pinW / 2 }]}>
        <View style={[styles.pinInner, { width: pinW * 0.5, height: pinW * 0.5, borderRadius: pinW * 0.25 }]} />
        <View style={[styles.smile, { width: pinW * 0.35 }]} />
      </View>
      {showWordmark && <Text style={type.brand}>{APP_NAME}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pin: {
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '18%',
  },
  pinInner: {
    backgroundColor: colors.surface,
    marginBottom: 2,
  },
  smile: {
    height: 3,
    borderBottomWidth: 3,
    borderBottomColor: colors.primaryContainer,
    borderRadius: 4,
    marginTop: 2,
  },
});
