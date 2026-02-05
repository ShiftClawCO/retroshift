import type { Metadata } from "next";
import { Nunito_Sans, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/theme-provider';
import { ConvexClientProvider } from '@/components/ConvexClientProvider';
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
  title: "RetroShift - Retrospettive Anonime per Team Agile",
  description: "Crea retrospettive anonime e asincrone per il tuo team. Niente silenzi imbarazzanti, solo feedback onesto.",
  keywords: ["retrospettiva", "agile", "scrum", "team", "feedback", "anonimo"],
  openGraph: {
    title: "RetroShift - Retrospettive Anonime per Team Agile",
    description: "Crea retrospettive anonime e asincrone per il tuo team.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RetroShift",
    description: "Retrospettive anonime e asincrone per team agile.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

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
          <ConvexClientProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
            </NextIntlClientProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
