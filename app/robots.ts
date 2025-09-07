import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://swiftcompiler.vercel.app"

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/error", "/auth/sign-up-success"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
