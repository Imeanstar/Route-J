import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { showMessage } from '@/lib/show-message';
import { Link, useRouter } from 'expo-router';
import { StitchButton } from '@/components/stitch/StitchButton';
import { StitchField } from '@/components/stitch/StitchField';
import { StitchLogo } from '@/components/stitch/StitchLogo';
import { StitchScreen } from '@/components/stitch/StitchScreen';
import { colors, spacing, type } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { signInWithKakao } from '@/lib/kakao';
import { safeGoBack } from '@/lib/navigation';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setBusy(true);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      const hint =
        error.toLowerCase().includes('email not confirmed') ||
        error.toLowerCase().includes('not confirmed')
          ? '\n\n이메일 확인 링크를 누르거나, 개발용으로 Supabase에서 Confirm email 을 끄세요.'
          : '';
      showMessage('로그인 실패', error + hint);
    } else safeGoBack(router, '/(tabs)/profile');
  };

  const onKakao = async () => {
    setBusy(true);
    const { error } = await signInWithKakao();
    setBusy(false);
    if (error) showMessage('카카오 로그인', error);
  };

  return (
    <StitchScreen header={{ variant: 'back', title: '로그인', onBack: () => safeGoBack(router, '/(tabs)/profile') }}>
      <View style={styles.brand}>
        <StitchLogo size={48} />
        <Text style={type.brand}>RouteJ</Text>
      </View>
      <StitchField
        label="이메일"
        placeholder="you@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <StitchField
        label="비밀번호"
        placeholder="비밀번호"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <StitchButton label={busy ? '로그인 중…' : '로그인'} onPress={onSubmit} disabled={busy} />
      <StitchButton label="카카오로 시작하기" variant="secondary" onPress={onKakao} disabled={busy} />
      <Link href="/auth/sign-up" style={styles.link}>
        <Text style={styles.linkText}>회원가입</Text>
      </Link>
      <Text style={styles.note}>
        카카오는 Supabase Auth에 Kakao Provider를 연결하면 동작합니다.
      </Text>
    </StitchScreen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginBottom: spacing.lg, gap: spacing.sm },
  link: { marginTop: spacing.md, alignSelf: 'center' },
  linkText: { ...type.labelMd, color: colors.primary },
  note: { ...type.bodySm, marginTop: spacing.md, textAlign: 'center' },
});
