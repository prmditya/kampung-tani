import type { Metadata } from "next";
import "../styles/globals.css";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { AuthProvider } from "@/shared/hooks/useAuth";

export const metadata: Metadata = {
  title: "Kampung Tani",
  description: "IoT Monitoring System for Agriculture",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
