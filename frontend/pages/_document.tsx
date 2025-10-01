import { Html, Head, Main, NextScript } from "next/document";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
let apiOrigin: string | null = null;

try {
  const parsed = new URL(apiUrl);
  apiOrigin = `${parsed.protocol}//${parsed.host}`;
} catch {
  apiOrigin = null;
}

export default function Document() {
  return (
    <Html lang="en" className="scroll-smooth">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#047857" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/webp" href="/assets/kt-logo-sm.webp" />
        <link rel="apple-touch-icon" href="/assets/kt-logo-sm.webp" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {apiOrigin && (
          <>
            <link rel="dns-prefetch" href={apiOrigin} />
            <link rel="preconnect" href={apiOrigin} crossOrigin="anonymous" />
          </>
        )}
        <meta
          name="description"
          content="Kampung Tani IoT Monitoring platform for smart agriculture insights."
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
