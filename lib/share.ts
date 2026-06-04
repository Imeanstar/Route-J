import { Platform, Share } from 'react-native';
import * as Linking from 'expo-linking';
import { trackEvent } from '@/lib/analytics';

export function routeShareUrl(routeId: string) {
  return Linking.createURL(`/route/${routeId}`);
}

export async function shareRoute(routeId: string, title: string) {
  const url = routeShareUrl(routeId);
  const message = `${title}\n\nRouteJ에서 데이트 코스를 확인해 보세요.\n${url}`;
  trackEvent('route_share', { routeId });

  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: message, url });
        return;
      } catch {
        /* fallback */
      }
    }
    await navigator.clipboard?.writeText(message);
    return;
  }

  await Share.share({ message, title, url });
}
