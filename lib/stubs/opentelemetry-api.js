/**
 * Supabase가 선택적으로 쓰는 OpenTelemetry 패키지 스텁.
 * Metro(웹/네이티브) 번들 시 @opentelemetry/api 미설치로 인한 실패를 방지합니다.
 */
const noop = () => {};
const span = {
  end: noop,
  setAttribute: noop,
  setStatus: noop,
  recordException: noop,
};

module.exports = {
  trace: {
    getTracer: () => ({
      startActiveSpan: (_name, fn) => (typeof fn === 'function' ? fn(span) : span),
      startSpan: () => span,
    }),
    getActiveSpan: () => undefined,
    setSpan: (_ctx, _span) => _ctx,
  },
  context: {
    active: () => ({}),
    with: (_ctx, fn) => (typeof fn === 'function' ? fn() : undefined),
  },
  propagation: {
    inject: noop,
    extract: () => ({}),
  },
};
