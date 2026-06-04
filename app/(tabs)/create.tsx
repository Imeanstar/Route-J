import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

/** 하단 탭 "만들기" — 코스 등록 화면으로 이동 */
export default function CreateTabRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.push('/route/create');
  }, [router]);
  return <View />;
}
