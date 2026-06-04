import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Couple } from '@/types/database';
import type { UserTier } from '@/types/database';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  couple: Couple | null;
  tier: UserTier;
  loading: boolean;
  refreshCouple: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{
    error: string | null;
    needsEmailConfirmation?: boolean;
    signedIn?: boolean;
  }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCouple = useCallback(async () => {
    if (!session?.user) {
      setCouple(null);
      return;
    }
    const { data, error } = await supabase.rpc('get_my_couple');
    if (error) {
      setCouple(null);
      return;
    }
    setCouple((data as Couple | null) ?? null);
  }, [session?.user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      refreshCouple();
    } else {
      setCouple(null);
    }
  }, [session?.user, refreshCouple]);

  const tier: UserTier = useMemo(() => {
    if (!session?.user) return 'guest';
    if (couple?.status === 'active') return 'couple';
    return 'member';
  }, [session?.user, couple]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    if (!isSupabaseConfigured) {
      return { error: '.env에 EXPO_PUBLIC_SUPABASE_URL·ANON_KEY를 설정한 뒤 앱을 다시 시작해 주세요.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) {
      const msg = error.message ?? '가입에 실패했습니다.';
      if (msg.toLowerCase().includes('already registered')) {
        return {
          error: '이미 가입된 이메일입니다. 로그인하거나 비밀번호를 재설정해 주세요.',
        };
      }
      if (msg.toLowerCase().includes('database error')) {
        return {
          error:
            '서버 프로필 생성 오류입니다. Supabase SQL Editor에서 007_auth_profile_fix.sql 을 실행한 뒤 다시 시도해 주세요.',
        };
      }
      return { error: msg };
    }
    if (data.session) {
      return { error: null, signedIn: true };
    }

    // Confirm email OFF여도 session이 없을 때: 이미 가입된 메일 등
    if (data.user?.identities?.length === 0) {
      return {
        error: '이미 가입된 이메일이거나 가입이 완료되지 않았습니다. 로그인을 시도해 주세요.',
      };
    }

    const needsConfirm =
      !!data.user && !data.user.email_confirmed_at && !data.session;
    if (needsConfirm) {
      return { error: null, needsEmailConfirmation: true };
    }

    // 가입은 됐는데 세션 없음 → 로그인 화면으로
    if (data.user) {
      return { error: null, needsEmailConfirmation: false };
    }

    return { error: '가입 응답이 비어 있습니다. Supabase Auth 설정과 .env를 확인해 주세요.' };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCouple(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      couple,
      tier,
      loading,
      refreshCouple,
      signIn,
      signUp,
      signOut,
    }),
    [session, couple, tier, loading, refreshCouple, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
