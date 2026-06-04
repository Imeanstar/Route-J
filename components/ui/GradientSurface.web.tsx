import { View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  colors?: string[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const DEFAULT = ['#FBDAD3', '#FCEAE3', '#FBF3EC'];

export function GradientSurface({ colors = DEFAULT, style, children }: Props) {
  const gradient = `linear-gradient(160deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`;
  return (
    <View style={[style, { backgroundImage: gradient } as ViewStyle]}>
      {children}
    </View>
  );
}
