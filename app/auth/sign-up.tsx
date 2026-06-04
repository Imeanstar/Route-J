import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StitchButton } from '@/components/stitch/StitchButton';
import { StitchField } from '@/components/stitch/StitchField';
import { StitchLogo } from '@/components/stitch/StitchLogo';
import { StitchScreen } from '@/components/stitch/StitchScreen';
import { colors, spacing, type } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { showMessage } from '@/lib/show-message';
import { safeGoBack } from '@/lib/navigation';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const onSubmit = async () => {
    setStatus(null);
    const trimmedEmail = email.trim();

    if (!isSupabaseConfigured) {
      const msg = '.env에 Supabase URL·anon key가 없습니다. 설정 후 npx expo start --clear';
      setStatus(msg);
      showMessage('설정 필요', msg);
      return;
    }
    if (!displayName.trim()) {
      setStatus('닉네임을 입력해 주세요.');
      showMessage('입력 확인', '닉네임을 입력해 주세요.');
      return;
    }
    if (!trimmedEmail.includes('@')) {
      setStatus('올바른 이메일을 입력해 주세요.');
      showMessage('입력 확인', '올바른 이메일을 입력해 주세요.');
      return;
    }
    if (password.length < 6) {
      setStatus('비밀번호는 6자 이상이어야 합니다.');
      showMessage('입력 확인', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setBusy(true);
    try {
      const { error, needsEmailConfirmation, signedIn } = await signUp(
        trimmedEmail,
        password,
        displayName.trim(),
      );

      if (error) {
        setStatus(error);
        showMessage('가입 실패', error);
        return;
      }

      if (signedIn) {
        setStatus('가입 완료! 탐색 화면으로 이동합니다.');
        router.replace('/(tabs)/explore');
        return;
      }

      if (needsEmailConfirmation) {
        const msg =
          '가입은 접수되었습니다. 이메일 확인 링크를 누른 뒤 로그인해 주세요.';
        setStatus(msg);
        showMessage('이메일 인증 필요', msg, () => router.replace('/auth/login'));
        return;
      }

      setStatus('가입되었습니다. 로그인해 주세요.');
      showMessage('가입 완료', '로그인해 주세요.', () => router.replace('/auth/login'));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
      setStatus(msg);
      showMessage('가입 실패', msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <StitchScreen header={{ variant: 'back', title: '회원가입', onBack: () => safeGoBack(router, '/(tabs)/profile') }}>
      <View style={styles.brand}>
        <StitchLogo size={48} />
        <Text style={type.brand}>RouteJ</Text>
      </View>
      {!isSupabaseConfigured && (
        <Text style={styles.warn}>.env Supabase 설정이 없습니다.</Text>
      )}
      <StitchField label="닉네임" placeholder="표시 이름" value={displayName} onChangeText={setDisplayName} />
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
        placeholder="6자 이상"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      {status ? (
        <Text style={[styles.status, status.includes('완료') ? styles.statusOk : styles.statusErr]}>
          {status}
        </Text>
      ) : null}
      <StitchButton label={busy ? '가입 중…' : '가입하기'} onPress={onSubmit} disabled={busy} />
    </StitchScreen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginBottom: spacing.lg, gap: spacing.sm },
  warn: { ...type.bodySm, color: colors.error, marginBottom: spacing.sm },
  status: { ...type.bodySm, marginBottom: spacing.md, textAlign: 'center' },
  statusOk: { color: colors.primary },
  statusErr: { color: colors.error },
});
