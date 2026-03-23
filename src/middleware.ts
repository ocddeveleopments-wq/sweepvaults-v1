import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import createIntlMiddleware from "next-intl/middleware"

const locales = ["en", "fr"]
const defaultLocale = "en"

const handleI18n = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  if (isAdminRoute(req)) {
    await auth.protect()
    return NextResponse.next()
  }

  return handleI18n(req)
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}