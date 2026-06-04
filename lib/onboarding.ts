import { createAuthStorage } from '@/lib/auth-storage';

const KEY = 'routej_onboarding_done';
const storage = createAuthStorage();

export async function isOnboardingDone(): Promise<boolean> {
  const v = await storage.getItem(KEY);
  return v === '1';
}

export async function completeOnboarding() {
  await storage.setItem(KEY, '1');
}

export const ONBOARDING_STEPS = [
  {
    title: '인기 데이트 코스 탐색',
    body: '다른 커플이 공유한 루트를 지역·테마별로 찾아보세요.',
  },
  {
    title: '우리만의 루트 만들기',
    body: '커플 연결 후 장소·사진·별점으로 코스를 기록하고 공개할 수 있어요.',
  },
  {
    title: 'RouteJ Plus (준비 중)',
    body: '제휴 매장 할인과 Plus 전용 기능이 곧 연결됩니다.',
  },
] as const;
