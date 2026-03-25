import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/lib/ThemeContext";

export const metadata: Metadata = {
  title: {
    default: "BookStory",
    template: "%s | BookStory",
  },
  description:
    "デザイナーフレンドリーなコンポーネントカタログ。Figma から直接コードへ、ターミナル不要。",
  applicationName: "BookStory",
  authors: [{ name: "BookStory Team" }],
  keywords: ["design system", "component catalog", "Figma", "React", "MUI", "storybook alternative"],
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "BookStory",
    title: "BookStory",
    description: "デザイナーフレンドリーなコンポーネントカタログ。Figma から直接コードへ。",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookStory",
    description: "デザイナーフレンドリーなコンポーネントカタログ。Figma から直接コードへ。",
  },
  appleWebApp: {
    capable: true,
    title: "BookStory",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d1a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0 }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
