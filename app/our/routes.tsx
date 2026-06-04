import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StitchButton } from '@/components/stitch/StitchButton';
import { StitchFeedCard } from '@/components/stitch/StitchFeedCard';
import { StitchScreen } from '@/components/stitch/StitchScreen';
import { EmptyRoutes } from '@/components/EmptyRoutes';
import { colors, spacing, type } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { leaveOurRoutes } from '@/lib/navigation';
import { fetchCoupleRoutes } from '@/lib/routes';
import type { Route } from '@/types/database';

/** 프로필·커플 연결에서만 진입 (탭 our 사용 시 뒤로가기가 피드로 가는 문제 방지) */
export default function OurRoutesScreen() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { tier } = useAuth();
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const goBack = () => leaveOurRoutes(router, from);

  const load = useCallback(async () => {
    if (tier !== 'couple') {
      setLoading(false);
      return;
    }
    const { routes: list } = await fetchCoupleRoutes();
    setRoutes(list);
    setLoading(false);
    setRefreshing(false);
  }, [tier]);

  useEffect(() => {
    load();
  }, [load]);

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
  );

  if (tier === 'guest') {
    return (
      <StitchScreen header={{ variant: 'back', title: '우리 루트', onBack: goBack }} scroll={false}>
        <View style={styles.centered}>
          <Text style={[type.body, styles.msg]}>
            로그인하고 커플을 연결하면, 둘이 만든 데이트 루트를 이곳에서 관리할 수 있어요.
          </Text>
          <StitchButton label="로그인하기" onPress={() => router.push('/auth/login')} />
        </View>
      </StitchScreen>
    );
  }

  if (tier === 'member') {
    return (
      <StitchScreen header={{ variant: 'back', title: '우리 루트', onBack: goBack }}>
        <Text style={[type.bodySm, styles.msg]}>
          커플 연결 후 공개·우리만 보기 루트가 모두 여기에 모여요.
        </Text>
        <StitchButton label="커플 연결하기" onPress={() => router.push('/couple/connect')} />
      </StitchScreen>
    );
  }

  return (
    <StitchScreen header={{ variant: 'back', title: '우리 루트', onBack: goBack }} refreshControl={refreshControl}>
      <Text style={[type.headlineSm, { marginBottom: spacing.sm }]}>
        우리 루트 {routes.length ? `· ${routes.length}개` : ''}
      </Text>
      <StitchButton
        label="새 데이트 루트 올리기"
        onPress={() => router.push('/route/create')}
        style={{ marginBottom: spacing.md }}
      />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : routes.length === 0 ? (
        <EmptyRoutes tier="couple" onPrimary={() => router.push('/route/create')} />
      ) : (
        routes.map((item) => (
          <StitchFeedCard
            key={item.id}
            route={item}
            authorLabel="우리"
            onPress={() => router.push(`/route/${item.id}`)}
          />
        ))
      )}
    </StitchScreen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  msg: { textAlign: 'center', lineHeight: 24 },
});
