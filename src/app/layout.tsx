import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import Script from "next/script"
import "./globals.css"

export const metadata: Metadata = {
  title: "SweepVaults 2026 - Get In The Sweepstakes Vault - Spin to Win Sweepstakes!",
  description: "Spin the wheel for your chance to win $25,000 cash. Free entry, no purchase necessary.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
    <ClerkProvider>
      <html>
        <body>
          {gaId && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `}
              </Script>
            </>
          )}
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}