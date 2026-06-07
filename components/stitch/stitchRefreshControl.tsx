import { cloneElement, isValidElement, type ReactElement } from 'react';
import { Platform, RefreshControl, type RefreshControlProps } from 'react-native';
import { colors } from '@/constants/theme';
import { stitchRefreshProgressOffset } from './StitchHeader';

type Options = {
  insetsTop: number;
  /** ScrollView가 헤더 높이만큼 marginTop 된 레이아웃 */
  scrollBelowHeader?: boolean;
};

export function stitchRefreshControl(
  element: ReactElement<RefreshControlProps>,
  { insetsTop, scrollBelowHeader = false }: Options,
) {
  if (!isValidElement(element)) return element;

  const offset = stitchRefreshProgressOffset(insetsTop, scrollBelowHeader);

  return cloneElement(element, {
    colors: element.props.colors ?? [colors.primary],
    tintColor: element.props.tintColor ?? colors.primary,
    progressViewOffset:
      element.props.progressViewOffset ??
      (Platform.OS === 'android' ? offset : undefined),
  });
}
