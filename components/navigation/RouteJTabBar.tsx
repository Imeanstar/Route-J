import { CommonActions } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon, type AppIconName } from '@/components/AppIcon';
import { colors, type } from '@/constants/theme';

const TAB_ICONS: Record<string, AppIconName> = {
  explore: 'home',
  search: 'search',
  create: 'add',
  profile: 'person',
};

function isTabVisible(
  route: BottomTabBarProps['state']['routes'][number],
  descriptors: BottomTabBarProps['descriptors'],
) {
  const options = descriptors[route.key].options;
  if (options.href === null) return false;
  const itemStyle = StyleSheet.flatten(options.tabBarItemStyle);
  if (itemStyle && 'display' in itemStyle && itemStyle.display === 'none') return false;
  return true;
}

/** 하단 탭 — 라벨 맨 아래 활성 강조선 */
export function RouteJTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const visibleRoutes = state.routes.filter((route) => isTabVisible(route, descriptors));

  return (
    <View
      style={[
        styles.bar,
        { paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 8 : 4) },
      ]}
    >
      <View style={styles.row}>
        {visibleRoutes.map((route) => {
          const routeIndex = state.routes.indexOf(route);
          const focused = state.index === routeIndex;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;
          const tint = focused ? colors.primary : colors.outline;
          const iconName = TAB_ICONS[route.name] ?? 'home';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              onPress={onPress}
              style={styles.tab}
            >
              <View style={styles.tabInner}>
                <AppIcon name={iconName} size={24} color={tint} filled={focused} />
                <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
              <View style={[styles.indicator, focused && styles.indicatorActive]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.95)' : colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minHeight: 52,
    paddingBottom: 2,
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
  },
  label: {
    ...type.labelMd,
    fontSize: 11,
    marginTop: 4,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    borderRadius: 3,
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: colors.primary,
  },
});
