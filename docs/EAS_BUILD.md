# EAS Build (내부 테스트)

프로젝트는 이미 Expo에 연결됨: `@mike4403/route-j` (`app.json` → `extra.eas.projectId`).

## `expo config --json exited with non-zero code: 1`

로컬 Node가 **v24**이면 Expo SDK 52와 충돌할 수 있습니다 (`ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING`).

1. **Node 24 LTS**를 쓰는 경우: `expo-web-browser` config 플러그인 제거 + `app.config.js` 반영으로 `eas build`가 통과하는지 먼저 확인 (현재 저장소 기준)
2. **새로 설치**한다면: Node **22 LTS** (`v22.22.x` 등) — 2026년 기준 **20은 EOL**, Expo 로컬 도구와도 무난한 편
3. 프로젝트 루트 `.nvmrc` = `22` (nvm/fnm: `nvm use` / `fnm use`)
4. `app.config.ts` 대신 `app.config.js` 사용 (이미 반영)
5. `expo-web-browser` config 플러그인은 Node 24에서 config 단계가 깨질 수 있음 — Android `intentFilters`로 OAuth 딥링크 처리

확인:

```powershell
npx expo config --json
```

성공하면 JSON 한 줄이 출력됩니다.

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

EAS Build는 **클라우드 빌드**이므로 `.env` 는 로컬에만 있으면 앱에 안 들어갑니다.

1. EAS 대시보드 → **Environment variables**
2. `EXPO_PUBLIC_SUPABASE_URL` · `EXPO_PUBLIC_SUPABASE_ANON_KEY` — 둘 다 **Sensitive**, **preview** 체크
3. `eas.json` 의 `preview` 프로필에 `"environment": "preview"` (저장소에 반영됨)
4. 빌드 로그에 변수가 잡혔는지 확인 — 예전에 `No environment variables ... preview` 가 나왔다면 그 빌드 APK에는 값이 없음

앱 **프로필** 하단 `서버: mzqlnhvanubhkixggpvh.supabase.co` → 정상. `서버: 미설정` → 환경 변수 미주입, **재빌드** 필요.

## 로그인

```bash
npx eas-cli login
```
