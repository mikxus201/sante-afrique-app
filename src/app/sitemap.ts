// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import articlesData from "../../data/articles.json";
import { sections } from "../../data/sections";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Article = { href: string; publishedAt?: string };

function abs(u: string) {
  if (/^https?:\/\//i.test(u)) return u;
  return `${BASE}${u.startsWith("/") ? u : `/${u}`}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const core: MetadataRoute.Sitemap = [
    { url: abs("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: abs("/articles"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: abs("/les-plus-lus"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: abs("/rubriques"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: abs("/dossiers"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: abs("/interviews"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: abs("/tribunes"), lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: abs("/recherche"), lastModified: now, changeFrequency: "weekly", priority: 0.4 },
    { url: abs("/cookies"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: abs("/cookies-preferences"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const rubriquePages: MetadataRoute.Sitemap = sections.map((s) => ({
    url: abs(`/rubriques/${s.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const articlePages: MetadataRoute.Sitemap = (articlesData as Article[]).map((a) => ({
    url: abs(a.href),
    lastModified: a.publishedAt ? new Date(a.publishedAt) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...core, ...rubriquePages, ...articlePages];
}
