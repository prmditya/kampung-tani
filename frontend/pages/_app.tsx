import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { ThemeProvider } from "../components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
