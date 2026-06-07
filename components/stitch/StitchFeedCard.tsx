import { AppIcon } from '@/components/AppIcon';
import { LikeCount } from '@/components/LikeCount';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { STITCH_FEED_IMAGES } from '@/constants/stitch-assets';
import { colors, radius, shadow, spacing, type } from '@/constants/theme';
import type { Route } from '@/types/database';

type Props = {
  route: Route;
  imageUri?: string;
  stopCount?: number;
  authorLabel?: string;
  timeLabel?: string;
  tags?: string[];
  onPress: () => void;
};

function hashIndex(id: string, len: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % len;
  return h;
}

export function StitchFeedCard({
  route,
  imageUri,
  stopCount,
  authorLabel = 'RouteJ',
  timeLabel,
  tags,
  onPress,
}: Props) {
  const cover =
    imageUri ?? STITCH_FEED_IMAGES[hashIndex(route.id, STITCH_FEED_IMAGES.length)];
  const stopsLabel = stopCount != null ? `${stopCount} stops` : '코스';
  const hashTags =
    tags ??
    (route.description
      ? route.description
          .split(/\s+/)
          .filter((w) => w.startsWith('#'))
          .slice(0, 3)
      : []);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.96 }]}
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
            <Text style={styles.badgeSecondaryText}>{stopsLabel}</Text>
          </View>
          <View style={styles.badgeGlass}>
            <LikeCount count={route.like_count} />
          </View>
        </View>
        <View style={styles.favBtn}>
          <AppIcon name="heart" size={22} color={colors.primary} />
        </View>
      </View>
      <View style={styles.body}>
        <Text style={type.headlineSm} numberOfLines={2}>
          {route.title}
        </Text>
        {hashTags.length > 0 && (
          <View style={styles.tags}>
            {hashTags.map((t) => (
              <Text key={t} style={styles.tag}>
                {t.startsWith('#') ? t : `#${t}`}
              </Text>
            ))}
          </View>
        )}
        <View style={styles.footer}>
          <View style={styles.author}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {authorLabel.slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <Text style={type.labelMd}>{authorLabel}</Text>
          </View>
          {timeLabel ? <Text style={styles.time}>{timeLabel}</Text> : null}
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
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerLow,
    ...shadow.card,
  },
  imageWrap: { height: 280, position: 'relative' },
  image: { width: '100%', height: '100%' },
  badges: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  badgeSecondary: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSecondaryText: {
    ...type.labelSm,
    color: colors.onSecondaryContainer,
  },
  badgeGlass: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeGlassText: { ...type.labelSm, color: '#fff' },
  favBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, marginBottom: 12 },
  tag: { ...type.labelMd, color: colors.secondary },
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
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onPrimaryContainer,
  },
  time: { ...type.labelSm, color: colors.outline },
});
