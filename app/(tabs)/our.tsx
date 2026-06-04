import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { openOurRoutes } from '@/lib/navigation';

/** 숨김 탭 — 직접 URL로 들어오면 프로필 경유 우리 루트로 리다이렉트 */
export default function OurTabRedirect() {
  const router = useRouter();

  useEffect(() => {
    openOurRoutes(router, 'profile');
  }, [router]);

  return null;
}
