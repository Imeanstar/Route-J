import { useLocalSearchParams } from 'expo-router';
import { RouteEditorScreen } from '@/app/route/create';

export default function EditRouteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!id) return null;
  return <RouteEditorScreen routeId={id} />;
}
