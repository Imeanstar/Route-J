import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type KakaoDoc = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name?: string;
  x: string;
  y: string;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  const apiKey = Deno.env.get('KAKAO_REST_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'KAKAO_REST_API_KEY가 설정되지 않았습니다.' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { query, x, y, radius } = await req.json();
    const q = String(query ?? '').trim();
    if (q.length < 2) {
      return new Response(JSON.stringify({ places: [] }), {
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
    url.searchParams.set('query', q);
    url.searchParams.set('size', '15');
    if (x != null && y != null) {
      url.searchParams.set('x', String(x));
      url.searchParams.set('y', String(y));
      url.searchParams.set('radius', String(radius ?? 20000));
    }

    const res = await fetch(url.toString(), {
      headers: { Authorization: `KakaoAK ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      let hint = '';
      try {
        const kakaoErr = JSON.parse(text) as { message?: string; errorType?: string };
        if (res.status === 403) {
          hint =
            '카카오 개발자 콘솔 → 내 애플리케이션 → [제품 설정] → [카카오맵] 또는 [로컬] API 상태를 ON으로 켜 주세요. REST API 키(자바스크립트 키 아님)를 Supabase secret에 넣었는지도 확인하세요.';
          if (kakaoErr.message) hint = `${kakaoErr.message} — ${hint}`;
        } else if (res.status === 401) {
          hint = 'REST API 키가 올바르지 않아요. developers.kakao.com 앱 키 탭의 REST API 키를 확인하세요.';
        }
      } catch {
        /* plain text */
      }
      return new Response(
        JSON.stringify({
          error: hint || `카카오 API 오류 (${res.status})`,
          detail: text,
        }),
        { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } },
      );
    }

    const json = await res.json();
    const places = ((json.documents ?? []) as KakaoDoc[]).map((doc) => ({
      id: doc.id,
      place_name: doc.place_name,
      address: doc.road_address_name || doc.address_name,
      road_address: doc.road_address_name || undefined,
      lat: parseFloat(doc.y),
      lng: parseFloat(doc.x),
    }));

    return new Response(JSON.stringify({ places }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : '검색 실패' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
    );
  }
});
