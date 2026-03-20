import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/complete-profile",
        "/admin/",
        "/profile/edit",
        "/provider/edit",
        "/provider/portfolio",
        "/become-provider",
        "/favorites",
        "/callback",
        "/offline",
      ],
    },
    sitemap: "https://www.eufacooservico.com.br/sitemap.xml",
  };
}
