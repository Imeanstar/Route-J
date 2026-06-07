import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StitchButton } from '@/components/stitch/StitchButton';
import { StitchLogo } from '@/components/stitch/StitchLogo';
import { StitchScreen } from '@/components/stitch/StitchScreen';
import { colors, radius, shadow, spacing, type } from '@/constants/theme';
import { LEGAL_URLS } from '@/constants/legal';
import { useAuth } from '@/lib/auth';
import { openOurRoutes } from '@/lib/navigation';
import { usePlus } from '@/lib/plus';
import { isSupabaseConfigured, supabaseConfigStatus } from '@/lib/supabase';

const TIER_LABEL = { guest: '비회원', member: '회원', couple: '커플 회원' } as const;

export default function ProfileScreen() {
  const { tier, user, couple, signOut, loading } = useAuth();
  const { isPlus, openPlusInfo } = usePlus();
  const router = useRouter();
  const supabaseStatus = supabaseConfigStatus();

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <StitchScreen header={{ variant: 'brand' }}>
      <Text style={type.headlineSm}>내 계정</Text>

      <View style={[styles.card, shadow.card]}>
        <StitchLogo size={40} showWordmark />
        <Text style={[type.headlineMd, styles.tier]}>{TIER_LABEL[tier]}</Text>
        {isPlus && (
          <View style={styles.plusBadge}>
            <Text style={styles.plusBadgeText}>RouteJ Plus</Text>
          </View>
        )}
        {user ? (
          <Text style={[type.bodySm, styles.email]}>{user.email}</Text>
        ) : (
          <Text style={[type.bodySm, styles.email]}>로그인하면 모든 루트를 볼 수 있어요</Text>
        )}
        {couple?.status === 'active' && (
          <Text style={styles.coupleCode}>연결 코드 · {couple.invite_code}</Text>
        )}
      </View>

      {!isSupabaseConfigured && (
        <Text style={styles.warn}>
          Supabase 미연결 — EAS 환경 변수 등록 후 preview 빌드를 다시 해주세요.
        </Text>
      )}
      <Text style={styles.configHint}>
        서버: {supabaseStatus.ok ? supabaseStatus.host : '미설정'}
      </Text>

      <View style={styles.actions}>
        {tier === 'guest' && (
          <>
            <StitchButton label="로그인하기" onPress={() => router.push('/auth/login')} />
            <StitchButton
              label="이메일로 가입하기"
              variant="secondary"
              onPress={() => router.push('/auth/sign-up')}
            />
          </>
        )}
        {tier === 'member' && (
          <StitchButton label="커플 연결하러 가기" onPress={() => router.push('/couple/connect')} />
        )}
        {tier === 'couple' && (
          <>
            <StitchButton label="우리 루트 보기" onPress={() => openOurRoutes(router, 'profile')} />
            <StitchButton
              label="커플 연결 정보"
              variant="secondary"
              onPress={() => router.push('/couple/connect')}
            />
          </>
        )}
        {tier !== 'guest' && !isPlus && (
          <StitchButton label="RouteJ Plus 알아보기" variant="secondary" onPress={openPlusInfo} />
        )}
        {user && <StitchButton label="로그아웃" variant="ghost" onPress={signOut} />}
      </View>

      <View style={styles.legal}>
        <StitchButton
          label="이용약관"
          variant="ghost"
          onPress={() => router.push('/legal/terms')}
        />
        <StitchButton
          label="개인정보처리방침"
          variant="ghost"
          onPress={() => router.push('/legal/privacy')}
        />
      </View>
      <Text style={styles.footerNote}>{LEGAL_URLS.supportEmail}</Text>
    </StitchScreen>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  card: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tier: { marginTop: spacing.sm },
  email: { marginTop: spacing.xs },
  coupleCode: { ...type.meta, marginTop: spacing.md, color: colors.primary },
  plusBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  plusBadgeText: { ...type.labelSm, color: colors.onSecondaryContainer },
  warn: { ...type.bodySm, color: colors.error, marginTop: spacing.sm },
  configHint: { ...type.bodySm, color: colors.outline, marginTop: spacing.xs },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
  legal: { marginTop: spacing.xl, gap: 4 },
  footerNote: { ...type.bodySm, textAlign: 'center', marginTop: spacing.md, color: colors.outline },
});
