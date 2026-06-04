import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { CoupleConnectionCard } from '@/components/CoupleConnectionCard';
import { StitchButton } from '@/components/stitch/StitchButton';
import { StitchField } from '@/components/stitch/StitchField';
import { StitchScreen } from '@/components/stitch/StitchScreen';
import { colors, spacing, type } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { createInvite, fetchCoupleSummary, joinWithCode, type CoupleSummary } from '@/lib/couple';
import { openOurRoutes, safeGoBack } from '@/lib/navigation';

export default function CoupleConnectScreen() {
  const { couple, refreshCouple, tier, user } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [inviteCode, setInviteCode] = useState<string | null>(couple?.invite_code ?? null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<CoupleSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const loadSummary = useCallback(async () => {
    if (!couple || couple.status !== 'active' || !user) return;
    setSummaryLoading(true);
    const { summary: s, error } = await fetchCoupleSummary(couple, user.id);
    setSummaryLoading(false);
    if (error) setSummary(null);
    else setSummary(s);
  }, [couple, user]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const onCreate = async () => {
    setBusy(true);
    const { couple: row, error } = await createInvite();
    setBusy(false);
    if (error) Alert.alert('오류', error);
    else {
      setInviteCode(row?.invite_code ?? null);
      await refreshCouple();
      Alert.alert('초대 코드 생성', `상대에게 코드를 알려주세요: ${row?.invite_code}`);
    }
  };

  const onJoin = async () => {
    setBusy(true);
    const { error } = await joinWithCode(code);
    setBusy(false);
    if (error) Alert.alert('연결 실패', error);
    else {
      await refreshCouple();
      Alert.alert('연결 완료', '이제 루트를 작성할 수 있어요!');
      safeGoBack(router, '/(tabs)/profile');
    }
  };

  const goBack = () => safeGoBack(router, '/(tabs)/profile');

  if (tier === 'couple' && couple?.status === 'active') {
    return (
      <StitchScreen header={{ variant: 'back', title: '커플 연결', onBack: goBack }}>
        <CoupleConnectionCard
          summary={summary}
          loading={summaryLoading}
          onOurRoutes={() => openOurRoutes(router, 'couple')}
        />
        <StitchButton
          label="새 데이트 루트 올리기"
          variant="secondary"
          onPress={() => router.push('/route/create')}
        />
      </StitchScreen>
    );
  }

  return (
    <StitchScreen header={{ variant: 'back', title: '커플 연결', onBack: goBack }}>
      <Text style={type.headlineSm}>6자리 코드로 연결</Text>
      <Text style={[type.bodySm, { marginBottom: spacing.lg }]}>
        한 명이 코드를 만들고, 상대가 입력합니다.
      </Text>
      <StitchButton label="초대 코드 만들기" onPress={onCreate} disabled={busy} />
      {inviteCode ? (
        <Text style={styles.code}>내 코드: {inviteCode}</Text>
      ) : null}
      <Text style={[type.labelMd, styles.divider]}>— 또는 상대 코드 입력 —</Text>
      <StitchField
        placeholder="6자리 코드"
        autoCapitalize="characters"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />
      <StitchButton label="연결하기" variant="secondary" onPress={onJoin} disabled={busy || code.length < 6} />
    </StitchScreen>
  );
}

const styles = StyleSheet.create({
  code: {
    ...type.headlineMd,
    textAlign: 'center',
    marginVertical: spacing.md,
    color: colors.primary,
    letterSpacing: 4,
  },
  divider: { textAlign: 'center', marginVertical: spacing.md, color: colors.outline },
});
