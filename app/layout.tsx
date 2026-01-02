import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

export const runtime = 'edge';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "JWT Playground | Free JWT Generator & Verifier",
  description:
    "Generate, decode, and verify JSON Web Tokens in your browser with live validation, syntax highlighting, and signature checks.",
  keywords: [
    "JWT generator",
    "JSON Web Token",
    "JWT verifier",
    "token decoder",
    "HS256",
    "security tools",
    "developer utilities",
  ],
  authors: [{ name: "JWT Playground" }],
  openGraph: {
    title: "JWT Playground | Free JWT Generator & Verifier",
    description:
      "Create, decode, and validate JSON Web Tokens securely in your browser with instant feedback.",
    url: "/",
    siteName: "JWT Playground",
    images: [
      {
        url: "/globe.svg",
        width: 1200,
        height: 630,
        alt: "JWT Playground interface preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JWT Playground | Free JWT Generator & Verifier",
    description:
      "Generate and verify JSON Web Tokens with secure, client-side tools and live validation.",
    images: ["/globe.svg"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    themeColor: "#0c1424",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JWT Playground",
    url: siteUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Generate, decode, and verify JSON Web Tokens in the browser with instant validation and signature checks.",
  };

  return (
    <html lang="en">
      <head>
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MHL924LF');`}
        </Script>
      </head>
      <body
        data-theme="business"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MHL924LF" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
