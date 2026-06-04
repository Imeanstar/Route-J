import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '@/constants/theme';

type Props = { size?: number; showWordmark?: boolean };

export function StitchLogo({ size = 32, showWordmark = false }: Props) {
  if (showWordmark) {
    return (
      <Svg width={size * 2.2} height={size} viewBox="0 0 200 200">
        <Path
          d="M100 40C80 40 60 60 60 90C60 130 100 170 100 170C100 170 140 130 140 90C140 60 120 40 100 40Z"
          fill={colors.primaryContainer}
        />
        <Circle cx="100" cy="90" r="25" fill="#FFFFFF" />
        <Path
          d="M85 90C85 85 90 80 100 80C110 80 115 85 115 90"
          stroke={colors.primaryContainer}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
        <SvgText
          x="100"
          y="195"
          fontSize="20"
          fontWeight="700"
          fill="#111827"
          textAnchor="middle"
        >
          RouteJ
        </SvgText>
      </Svg>
    );
  }
  const h = size;
  const w = size;
  return (
    <Svg width={w} height={h} viewBox="0 0 100 100">
      <Path
        d="M50 20C40 20 30 30 30 45C30 65 50 85 50 85C50 85 70 65 70 45C70 30 60 20 50 20Z"
        fill={colors.primaryContainer}
      />
      <Circle cx="50" cy="45" r="12" fill="#FFFFFF" />
      <Path
        d="M42 45C42 42 45 40 50 40C55 40 58 42 58 45"
        stroke={colors.primaryContainer}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}
