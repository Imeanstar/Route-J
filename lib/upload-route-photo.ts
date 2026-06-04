import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { showMessage } from '@/lib/show-message';
import { supabase } from '@/lib/supabase';

export type UploadedRoutePhoto = {
  path: string;
  previewUri: string;
};

/** 갤러리에서 선택 후 route-photos 버킷에 업로드 */
export async function pickAndUploadRoutePhoto(
  coupleId: string,
): Promise<UploadedRoutePhoto | null> {
  if (Platform.OS !== 'web') {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      showMessage('사진 접근', '갤러리 접근 권한이 필요합니다. 설정에서 허용해 주세요.');
      return null;
    }
  }

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: Platform.OS !== 'web',
    aspect: [16, 9],
  });

  if (res.canceled || !res.assets?.[0]) return null;

  const asset = res.assets[0];
  const uri = asset.uri;
  const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
  const contentType = ext === 'png' ? 'image/png' : 'image/jpeg';
  const path = `${coupleId}/${Date.now()}.${ext}`;

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const { error } = await supabase.storage.from('route-photos').upload(path, blob, {
      contentType: blob.type && blob.type !== 'application/octet-stream' ? blob.type : contentType,
      upsert: true,
    });
    if (error) {
      showMessage('업로드 실패', 'Storage 버킷 route-photos를 생성했는지 확인해주세요.');
      return null;
    }
    return { path, previewUri: uri };
  } catch {
    showMessage('업로드 실패', '이미지를 불러오지 못했습니다.');
    return null;
  }
}
