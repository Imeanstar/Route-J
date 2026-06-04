import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';
import {
  StitchHeader,
  stitchContentTopInset,
  stitchHeaderContentGap,
  stitchHeaderHeight,
  type StitchHeaderProps,
} from './StitchHeader';

type Props = {
  header: StitchHeaderProps;
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  bottomPad?: number;
  refreshControl?: React.ReactElement<RefreshControlProps>;
};

export function StitchScreen({
  header,
  children,
  scroll = true,
  contentStyle,
  bottomPad = 100,
  refreshControl,
}: Props) {
  const insets = useSafeAreaInsets();
  const headerH = stitchHeaderHeight(insets.top);
  const contentPad = { paddingBottom: bottomPad + insets.bottom };

  return (
    <View style={styles.root}>
      <View style={[styles.headerFixed, { height: headerH }]} pointerEvents="box-none">
        <StitchHeader {...header} />
      </View>
      {scroll ? (
        <ScrollView
          style={[styles.scroll, { marginTop: headerH }]}
          contentContainerStyle={[
            styles.content,
            { paddingTop: stitchHeaderContentGap },
            contentPad,
            contentStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.content,
            styles.flex,
            { marginTop: headerH, paddingTop: stitchHeaderContentGap },
            contentPad,
            contentStyle,
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerFixed: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50 },
  scroll: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: spacing.gutter,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
});
