# EAS Build (내부 테스트)

프로젝트는 이미 Expo에 연결됨: `@mike4403/route-j` (`app.json` → `extra.eas.projectId`).

## Git 오류가 날 때 (Windows)

터미널에 `git command not found` 또는 `git --help exited with status undefined` 가 나오면:

1. **당장 빌드만**: Git 없이 EAS 사용 (권장 워크어라운드)

   **PowerShell**

   ```powershell
   cd route-j
   $env:EAS_NO_VCS = "1"
   npx eas-cli build:configure --platform android
   npx eas-cli build --profile preview --platform android
   ```

   **CMD**

   ```cmd
   set EAS_NO_VCS=1
   npx eas-cli build --profile preview --platform android
   ```

2. **장기적으로**: [Git for Windows](https://git-scm.com/download/win) 설치 후 터미널을 다시 열고 `git --version` 확인. 그다음에는 `EAS_NO_VCS` 없이도 `eas build` 가능.

> `EAS_NO_VCS=1` 이면 변경 파일을 Git 기준으로 묶지 않고 **현재 폴더 전체**를 업로드합니다. `.env` 등 비밀 파일이 프로젝트에 있으면 **빌드에 포함되지 않도록** `.easignore` / `.gitignore` 를 확인하세요.

## 빌드 프로필 (`eas.json`)

| 프로필 | 용도 |
|--------|------|
| `preview` | 내부 테스트 APK (Android) / 실기기 iOS |
| `development` | 개발 클라이언트 |
| `production` | 스토어 제출용 |

## 첫 Android 내부 테스트

```powershell
$env:EAS_NO_VCS = "1"
npx eas-cli build --profile preview --platform android
```

완료 후 Expo 대시보드에서 **APK 다운로드** → 폰에 설치.

## iOS (TestFlight)

Apple Developer 계정 필요. 같은 방식으로:

```powershell
$env:EAS_NO_VCS = "1"
npx eas-cli build --profile preview --platform ios
```

## 환경 변수

EAS Build는 **클라우드 빌드**이므로 `.env` 는 로컬에만 있으면 앱에 안 들어갑니다. Supabase URL/anon key 는 EAS 대시보드 → Project → **Environment variables** 에 `EXPO_PUBLIC_*` 로 등록하거나 `eas secret:create` 사용.

## 로그인

```bash
npx eas-cli login
```
