import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

export const metadata: Metadata = {
  title: "SwiftCompiler - Professional Web IDE & Code Compiler",
  description:
    "Modern web-based IDE and compiler supporting 15+ programming languages. Create, edit, compile, and run code projects with real-time collaboration and cloud storage.",
  keywords:
    "web IDE, online compiler, code editor, programming languages, JavaScript, Python, Java, C++, React, Node.js",
  authors: [{ name: "SwiftCompiler Team" }],
  creator: "SwiftCompiler",
  publisher: "SwiftCompiler",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://swiftcompiler.vercel.app"),
  openGraph: {
    title: "SwiftCompiler - Professional Web IDE",
    description: "Modern web-based IDE and compiler for all major programming languages",
    url: "/",
    siteName: "SwiftCompiler",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SwiftCompiler Web IDE",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SwiftCompiler - Professional Web IDE",
    description: "Modern web-based IDE and compiler for all major programming languages",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              {children}
              <Toaster />
            </ThemeProvider>
          </Suspense>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  )
}
