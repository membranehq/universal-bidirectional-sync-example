import "./globals.css";
import { ThemeProvider } from "@/app/providers";
import { Toaster } from "sonner";
import { Instrument_Sans } from "next/font/google";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { IntegrationAppProvider } from "./integration-app-provider";
import { Header } from "@/components/header";
import { AuthenticatedContent } from "@/components/authenticated-content";
import { AuthProvider } from "./contexts/auth-context";
import { AuthModal } from "@/components/auth-modal";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bidirectional Sync Example",
    template: "%s | Bidirectional Sync Example",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${instrumentSans.className} antialiased bg-white text-gray-900`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
        >
          <AuthProvider>
            <IntegrationAppProvider>
              <AuthenticatedContent>
                <Header />
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  {children}
                </main>
              </AuthenticatedContent>
            </IntegrationAppProvider>
            <AuthModal />
          </AuthProvider>
        </ThemeProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
