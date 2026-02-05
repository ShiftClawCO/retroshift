import type { Metadata } from "next";
import { Nunito_Sans, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { getUser } from '@/lib/auth';
import { ThemeProvider } from '@/components/theme-provider';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
import { AuthProvider, UserSync } from '@/components/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import "./globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RetroShift — Anonymous Async Retrospectives for Agile Teams",
    template: "%s | RetroShift",
  },
  description: "Run anonymous, async retrospectives your team will actually enjoy. No awkward silences — just honest feedback. Free to start.",
  keywords: [
    "retrospective", "agile", "scrum", "team", "feedback", "anonymous",
    "async retrospective", "sprint retrospective", "remote team",
    "retrospettiva", "anonimo", "team agile",
  ],
  metadataBase: new URL("https://retroshift.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RetroShift — Anonymous Async Retrospectives",
    description: "Run anonymous, async retrospectives your team will actually enjoy. No awkward silences — just honest feedback.",
    type: "website",
    url: "https://retroshift.vercel.app",
    siteName: "RetroShift",
  },
  twitter: {
    card: "summary_large_image",
    title: "RetroShift — Anonymous Async Retrospectives",
    description: "Run anonymous, async retrospectives your team will actually enjoy. Free to start.",
    creator: "@ShiftclawC",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  
  // Get WorkOS user (null if not authenticated)
  const workosUser = await getUser();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${nunitoSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider workosUser={workosUser}>
            <ConvexClientProvider>
              <UserSync />
              <NextIntlClientProvider messages={messages}>
                {children}
              </NextIntlClientProvider>
            </ConvexClientProvider>
          </AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
