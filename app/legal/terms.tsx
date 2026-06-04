import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StitchScreen } from '@/components/stitch/StitchScreen';
import { LEGAL_URLS } from '@/constants/legal';
import { safeGoBack } from '@/lib/navigation';
import { colors, spacing, type } from '@/constants/theme';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <StitchScreen header={{ variant: 'back', title: '이용약관', onBack: () => safeGoBack(router, '/(tabs)/profile') }}>
      <ScrollView>
        <Text style={type.bodySm}>최종 업데이트: {LEGAL_URLS.lastUpdated}</Text>
        <Text style={[type.headlineSm, styles.section]}>제1조 (목적)</Text>
        <Text style={type.body}>
          본 약관은 {LEGAL_URLS.companyName}(이하 「회사」)가 제공하는 RouteJ 서비스(이하 「서비스」)의
          이용과 관련하여 회사와 이용자 간 권리·의무를 정합니다.
        </Text>
        <Text style={[type.headlineSm, styles.section]}>제2조 (서비스)</Text>
        <Text style={type.body}>
          서비스는 커플이 데이트 루트(장소·동선)를 등록·공유·열람하는 플랫폼입니다. 회사는 서비스 내용을
          변경할 수 있습니다.
        </Text>
        <Text style={[type.headlineSm, styles.section]}>제3조 (이용자 콘텐츠)</Text>
        <Text style={type.body}>
          이용자가 등록한 루트·사진·텍스트에 대한 책임은 이용자에게 있습니다. 타인의 권리를 침해하거나
          불법·음란·혐오 콘텐츠를 게시해서는 안 됩니다.
        </Text>
        <Text style={[type.headlineSm, styles.section]}>제4조 (RouteJ Plus·제휴)</Text>
        <Text style={type.body}>
          유료 구독 및 제휴 매장 할인은 별도 안내에 따르며, 제휴 혜택은 매장 정책에 따라 변경·종료될 수
          있습니다.
        </Text>
        <Text style={[type.headlineSm, styles.section]}>문의</Text>
        <Text style={type.body}>{LEGAL_URLS.supportEmail}</Text>
      </ScrollView>
    </StitchScreen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.primary },
});
