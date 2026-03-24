import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Oswald, Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-oswald",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SweepVaults — Win $25,000 Cash",
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
      <html lang="en" className={`${oswald.variable} ${inter.variable}`}>
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
                  gtag('config', '${gaId}', { page_path: window.location.pathname });
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