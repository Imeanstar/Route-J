import { LinearGradient } from 'expo-linear-gradient';
import type { StyleProp, ViewStyle } from 'react-native';

type Props = {
  colors?: string[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const DEFAULT = ['#FBDAD3', '#FCEAE3', '#FBF3EC'];

export function GradientSurface({ colors = DEFAULT, style, children }: Props) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 0.9, y: 1 }} style={style}>
      {children}
    </LinearGradient>
  );
}
