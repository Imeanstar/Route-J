import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CoupleRequiredModal } from '@/components/CoupleRequiredModal';
import { colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { canCreateRoute } from '@/lib/navigation';

const COUPLE_ONLY_MESSAGE = '루트 등록은 커플 연결된 회원만 가능해요!';

/** 만들기 탭 — 커플이면 등록 화면, 아니면 안내 모달 */
export default function CreateTabScreen() {
  const router = useRouter();
  const { tier, loading } = useAuth();
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (canCreateRoute(tier)) {
      router.replace('/route/create');
      return;
    }
    setShowGate(true);
  }, [loading, router, tier]);

  const isGuest = tier === 'guest';
  const question = isGuest
    ? '로그인 화면으로 이동할까요?'
    : '커플 연결 화면으로 이동할까요?';

  const goNext = () => {
    router.push(isGuest ? '/auth/login' : '/couple/connect');
  };

  const goBack = () => {
    setShowGate(false);
    router.replace('/(tabs)/explore');
  };

  if (loading || (canCreateRoute(tier) && !showGate)) {
    return (
      <View style={styles.wrap}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <CoupleRequiredModal
        visible={showGate}
        message={COUPLE_ONLY_MESSAGE}
        question={question}
        onConfirm={goNext}
        onBack={goBack}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
