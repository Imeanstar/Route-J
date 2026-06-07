import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';

/** 스플래시·첫 화면 이후에 OAuth 핸들러 로드 — 시작 시 WebBrowser 번들 로딩 방지 */
export function DeferredAuthOAuthLinkHandler() {
  const [Handler, setHandler] = useState<ComponentType | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      import('@/components/AuthOAuthLinkHandler')
        .then((m) => setHandler(() => m.AuthOAuthLinkHandler))
        .catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!Handler) return null;
  return <Handler />;
}
