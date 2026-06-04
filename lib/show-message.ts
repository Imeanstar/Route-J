import { Alert, Platform } from 'react-native';

/** 웹에서는 RN Alert가 보이지 않는 경우가 많아 window.confirm 사용 */
export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
) {
  const body = message ? `${title}\n\n${message}` : title;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(body)) {
      onConfirm();
    } else {
      onCancel?.();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: '취소', style: 'cancel', onPress: onCancel },
    { text: '확인', onPress: onConfirm },
  ]);
}

/** 웹에서는 RN Alert가 보이지 않는 경우가 많아 window.alert 사용 */
export function showMessage(
  title: string,
  message?: string,
  onOk?: () => void,
) {
  const body = message ? `${title}\n\n${message}` : title;

  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.alert(body);
      onOk?.();
    } else {
      onOk?.();
    }
    return;
  }

  if (message) {
    Alert.alert(title, message, onOk ? [{ text: '확인', onPress: onOk }] : undefined);
  } else {
    Alert.alert(title, onOk ? [{ text: '확인', onPress: onOk }] : undefined);
  }
}
