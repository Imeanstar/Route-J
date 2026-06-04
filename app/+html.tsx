import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root { height: 100%; margin: 0; }
              body {
                background-color: #f9f9ff;
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
                -webkit-font-smoothing: antialiased;
              }
              button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible {
                outline: 2px solid #f2d9dc;
                outline-offset: 2px;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
