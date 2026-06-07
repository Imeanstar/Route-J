const appJson = require('./app.json');

/** EAS Build 시 EXPO_PUBLIC_* 가 extra에도 들어가도록 (APK env 누락 대비) */
module.exports = () => ({
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    EXPO_PUBLIC_SUPABASE_URL: (process.env.EXPO_PUBLIC_SUPABASE_URL ?? '').trim(),
    EXPO_PUBLIC_SUPABASE_ANON_KEY: (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '').trim(),
    EXPO_PUBLIC_KAKAO_REST_API_KEY: (process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? '').trim(),
    EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY: (process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY ?? '').trim(),
  },
});
