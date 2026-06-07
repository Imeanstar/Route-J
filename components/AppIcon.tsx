import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

type IonName = ComponentProps<typeof Ionicons>['name'];

export type AppIconName =
  | 'home'
  | 'search'
  | 'add'
  | 'person'
  | 'back'
  | 'more'
  | 'edit'
  | 'image-add'
  | 'camera'
  | 'delete'
  | 'location'
  | 'share'
  | 'heart'
  | 'bookmark'
  | 'notifications'
  | 'offer'
  | 'mic'
  | 'add-location'
  | 'star'
  | 'cafe'
  | 'restaurant'
  | 'park'
  | 'museum';

const ICONS: Record<AppIconName, { outline: IonName; filled?: IonName }> = {
  home: { outline: 'home-outline', filled: 'home' },
  search: { outline: 'search-outline', filled: 'search' },
  add: { outline: 'add-circle-outline', filled: 'add-circle' },
  person: { outline: 'person-outline', filled: 'person' },
  back: { outline: 'arrow-back' },
  more: { outline: 'ellipsis-vertical' },
  edit: { outline: 'create-outline', filled: 'create' },
  'image-add': { outline: 'image-outline' },
  camera: { outline: 'camera-outline' },
  delete: { outline: 'trash-outline' },
  location: { outline: 'location-outline' },
  share: { outline: 'share-outline' },
  heart: { outline: 'heart-outline', filled: 'heart' },
  bookmark: { outline: 'bookmark-outline', filled: 'bookmark' },
  notifications: { outline: 'notifications-outline' },
  offer: { outline: 'pricetag-outline' },
  mic: { outline: 'mic-outline' },
  'add-location': { outline: 'add-circle-outline' },
  star: { outline: 'star-outline', filled: 'star' },
  cafe: { outline: 'cafe-outline' },
  restaurant: { outline: 'restaurant-outline' },
  park: { outline: 'leaf-outline' },
  museum: { outline: 'color-palette-outline' },
};

type Props = {
  name: AppIconName;
  size: number;
  color: string;
  filled?: boolean;
};

/** Android APK에서 MaterialIcons 폰트 누락 대비 — Ionicons만 사용 */
export function AppIcon({ name, size, color, filled }: Props) {
  const set = ICONS[name];
  const ion = filled && set.filled ? set.filled : set.outline;
  return <Ionicons name={ion} size={size} color={color} />;
}
