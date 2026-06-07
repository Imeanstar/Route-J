import { AppIcon } from '@/components/AppIcon';
import { LikeCount } from '@/components/LikeCount';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, FEED_PLACEHOLDERS, radius, shadow, spacing, type } from '@/constants/theme';
import type { Route } from '@/types/database';

type Props = {
  route: Route;
  imageUri?: string;
  stopCount?: number;
  onPress: () => void;
};

function hashIndex(id: string, len: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % len;
  return h;
}

export function RouteFeedCard({ route, imageUri, stopCount, onPress }: Props) {
  const cover = imageUri ?? FEED_PLACEHOLDERS[hashIndex(route.id, FEED_PLACEHOLDERS.length)];
  const stopsLabel = stopCount != null ? `${stopCount} stops` : '코스';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: cover }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          locations={[0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.badges}>
          <View style={styles.badgeSecondary}>
            <Text style={styles.badgeText}>{stopsLabel}</Text>
          </View>
          <View style={styles.badgeGlass}>
            <LikeCount count={route.like_count} />
          </View>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={type.headlineSm} numberOfLines={2}>
          {route.title}
        </Text>
        {route.description ? (
          <Text style={[type.bodySm, styles.desc]} numberOfLines={2}>
            {route.description}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <View style={styles.author}>
            <View style={styles.avatar}>
              <AppIcon name="person" size={16} color={colors.onPrimaryContainer} />
            </View>
            <Text style={type.labelMd}>RouteJ</Text>
          </View>
          <Text style={type.labelSm}>조회 {route.view_count}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceContainerLow,
    ...shadow.card,
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.96, transform: [{ scale: 0.995 }] },
  imageWrap: { height: 280, position: 'relative' },
  image: { width: '100%', height: '100%' },
  badges: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    gap: 8,
  },
  badgeSecondary: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeGlass: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: { ...type.labelSm, color: colors.onSecondaryContainer },
  badgeTextLight: { ...type.labelSm, color: '#fff' },
  body: { padding: spacing.md },
  desc: { marginTop: 8, marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  author: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
