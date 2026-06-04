import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StitchScreen } from '@/components/stitch/StitchScreen';
import { LEGAL_URLS } from '@/constants/legal';
import { safeGoBack } from '@/lib/navigation';
import { colors, spacing, type } from '@/constants/theme';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <StitchScreen header={{ variant: 'back', title: '개인정보처리방침', onBack: () => safeGoBack(router, '/(tabs)/profile') }}>
      <ScrollView>
        <Text style={type.bodySm}>최종 업데이트: {LEGAL_URLS.lastUpdated}</Text>
        <Text style={[type.headlineSm, styles.section]}>수집 항목</Text>
        <Text style={type.body}>
          · 계정: 이메일, 닉네임{'\n'}
          · 서비스 이용: 루트·장소명·주소·사진·별점, 좋아요·찜·신고 기록{'\n'}
          · 위치: 이용자가 입력한 장소 좌표(선택){'\n'}
          · 결제: RouteJ Plus 구독 시 스토어 결제 식별자(Apple/Google)
        </Text>
        <Text style={[type.headlineSm, styles.section]}>이용 목적</Text>
        <Text style={type.body}>
          서비스 제공, 커플 연결, 인기 루트 노출, 제휴 혜택 제공, 부정 이용 방지, 고객 문의 응대.
        </Text>
        <Text style={[type.headlineSm, styles.section]}>보관·파기</Text>
        <Text style={type.body}>
          회원 탈퇴 또는 목적 달성 시 관련 법령에 따라 보관 후 파기합니다. 업로드 사진은 Supabase Storage에
          저장됩니다.
        </Text>
        <Text style={[type.headlineSm, styles.section]}>제3자 제공</Text>
        <Text style={type.body}>
          인프라(Supabase), 지도·로그인(카카오 등 OAuth 설정 시), 앱 스토어 결제 처리에 필요한 범위에서만
          제공됩니다.
        </Text>
        <Text style={[type.headlineSm, styles.section]}>문의·권리</Text>
        <Text style={type.body}>
          열람·정정·삭제 요청: {LEGAL_URLS.supportEmail}
        </Text>
      </ScrollView>
    </StitchScreen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.primary },
});
