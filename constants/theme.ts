/**
 * RouteJ 디자인 토큰 (Material 3 기반 목업)
 * https://hgko-dev.tistory.com/555 — 틴티드 뉴트럴, 카드 중첩 최소화
 */
import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  background: '#f9f9ff',
  surface: '#FFFFFF',
  surfaceDim: '#d3daef',
  surfaceContainer: '#e9edff',
  surfaceContainerHigh: '#e1e8fd',
  surfaceContainerLow: '#f1f3ff',
  surfaceContainerHighest: '#dce2f7',
  surfaceVariant: '#dce2f7',
  subtleGray: '#F3F4F6',

  primary: '#6c5a5c',
  onPrimary: '#ffffff',
  primaryContainer: '#f2d9dc',
  onPrimaryContainer: '#705e60',
  primaryFixed: '#f6dcdf',

  secondary: '#4e6450',
  onSecondary: '#ffffff',
  secondaryContainer: '#d0e9cf',
  onSecondaryContainer: '#546a55',

  tertiary: '#625d5e',
  tertiaryContainer: '#e5ddde',
  onTertiaryContainer: '#666162',

  onSurface: '#141b2b',
  onSurfaceVariant: '#4e4446',
  onBackground: '#141b2b',
  outline: '#807475',
  outlineVariant: '#d1c3c4',

  error: '#ba1a1a',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',

  /** @deprecated use onSurface */
  ink: '#141b2b',
  inkSoft: '#4e4446',
  inkFaint: '#807475',
  line: '#d1c3c4',
  lineStrong: '#807475',
  text: '#141b2b',
  textSecondary: '#4e4446',
  border: '#d1c3c4',
  primaryMuted: '#f2d9dc',
  primaryPress: '#534245',
  primaryInk: '#534245',
  primarySoft: '#f2d9dc',
  surfaceAlt: '#e9edff',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  gutter: 16,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

const serif = Platform.select({
  web: "'Noto Serif', serif",
  default: 'NotoSerif_700Bold',
});

const sans = Platform.select({
  web: "'Plus Jakarta Sans', sans-serif",
  default: 'PlusJakartaSans_400Regular',
});

export const fontSerifSemi = Platform.select({
  web: "'Noto Serif', serif",
  default: 'NotoSerif_600SemiBold',
});

export const fontSansSemi = Platform.select({
  web: "'Plus Jakarta Sans', sans-serif",
  default: 'PlusJakartaSans_600SemiBold',
});

export const fontSansBold = Platform.select({
  web: "'Plus Jakarta Sans', sans-serif",
  default: 'PlusJakartaSans_700Bold',
});

export const fontFamily = sans;

export const type: Record<string, TextStyle> = {
  brand: {
    fontFamily: serif,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  display: {
    fontFamily: serif,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.onSurface,
  },
  headlineMd: {
    fontFamily: Platform.OS === 'web' ? serif : fontSerifSemi,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: Platform.OS === 'web' ? '600' : undefined,
    color: colors.onSurface,
  },
  headlineSm: {
    fontFamily: serif,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.onSurface,
  },
  bodyLg: {
    fontFamily: sans,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    color: colors.onSurface,
  },
  body: {
    fontFamily: sans,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.onSurface,
  },
  bodySm: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.onSurfaceVariant,
  },
  labelMd: {
    fontFamily: Platform.OS === 'web' ? sans : fontSansSemi,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: Platform.OS === 'web' ? '600' : undefined,
    letterSpacing: 0.14,
    color: colors.onSurfaceVariant,
  },
  labelSm: {
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  chip: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '600',
  },
  button: {
    fontFamily: Platform.OS === 'web' ? sans : fontSansBold,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: Platform.OS === 'web' ? '700' : undefined,
  },
  /** @deprecated use headlineMd */
  h1: {
    fontFamily: serif,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: colors.onSurface,
  },
  /** @deprecated use headlineSm */
  h2: {
    fontFamily: serif,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.onSurface,
  },
  bodySoft: {
    fontFamily: sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.onSurfaceVariant,
  },
  meta: {
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  sectionLabel: {
    fontFamily: serif,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.onSurface,
  },
};

export const shadow = {
  card: Platform.select<ViewStyle>({
    web: { boxShadow: '0 4px 20px rgba(17, 24, 39, 0.05)' } as ViewStyle,
    default: {
      shadowColor: '#111827',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
  }) as ViewStyle,
  soft: Platform.select<ViewStyle>({
    web: { boxShadow: '0 2px 8px rgba(17, 24, 39, 0.04)' } as ViewStyle,
    default: { shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  }) as ViewStyle,
};

export const touch = { minHeight: 44, minWidth: 44 };

/** 피드 카드용 플레이스홀더 이미지 */
export const FEED_PLACEHOLDERS = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDpq_DvYolY55hxc-JFBWsXZa9Y8VqWO5_ca8EkRMrXwa7bHlTj8TKvxH69snDF_JjRFigLTXa58A4KnU6ahjYUba7PyMbrfj2-wucz_SVu8BKj6HwYNiya3L3TaEBMwyOgFpYptluyiKhI1BCH_aROabsxjHr1jeJK3EG90StfqyK8r1H6IW7FzCb0-FdTz6WgaVZ-JOrlzCFf8u04_Kq9-X6m9JIW9cnUIH3qg9KiSb_PtX0t81FNhnhAY45AHx9b7HcJql9HjtjD',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCg4gLfSqrk0jsCEbcrpmGJY9wqEAdoELY3tR2WHU0miBQpjd-ypHBWGIVIlZfnXXquc0BkvSfQxnzaHhWC9A5PLoNLn19T9gahWYYDsYSmw10DxGCapYv1Pi2CXMir6QlU6j0N7ImWHZPob8Jo1V8O-DRaz8I7h6TeAQ1u9s-S9ThSEh1o4VavU9dGgNwT8DBfYncokYHm6YkbAQox0LPC2v-GYMGLEiJvFwWUBd9DzxeRu780emimd-HGFnvRAHCj090YL4fm4O8r',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA6uKh6nSpe22vMS2VpNeU2pbQB7Yd1OPE1m9QCDMZgfgS8f2XFrlEFyXV8xfmCvfA0x0RYUFzUohGDQWr4DM0lDtZ1LSid7QDOaDBEgWVYQIeSMnbLEkBshTNxWan9sEJEcqptbEXdnusgSdWXOMnsP10q8m2CTMCsKKUkjcH3xDx0eGOe7LKWJPTbpfhJCwyETKp3VfPG2VHb-RQ7bVLShnG6-YecrrofnHL6uNXZAnnIn_6m-MUGofOR1KwNRec62Z5fpb_S9SXI',
];
