import { supabase } from '@/lib/supabase';

/** Storage public URL for route stop / cover photos */
export function routePhotoUrl(photoPath: string | null | undefined): string | null {
  if (!photoPath?.trim()) return null;
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  const { data } = supabase.storage.from('route-photos').getPublicUrl(photoPath);
  return data.publicUrl;
}
