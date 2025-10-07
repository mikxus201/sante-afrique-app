// src/app/feed.xml/route.ts
import { NextResponse } from "next/server";
import articlesData from "../../../data/articles.json";

type Article = {
  id: string | number;
  title: string;
  href: string;
  excerpt?: string;
  publishedAt?: string;
};

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

function abs(u: string) {
  if (/^https?:\/\//i.test(u)) return u;
  return `${BASE}${u.startsWith("/") ? u : `/${u}`}`;
}

export async function GET() {
  const items: Article[] = (articlesData as any) as Article[];
  const latest = items
    .slice()
    .sort(
      (a, b) =>
        new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    )
    .slice(0, 50);

  const xmlItems = latest
    .map((a) => {
      const pub = a.publishedAt ? new Date(a.publishedAt).toUTCString() : new Date().toUTCString();
      return `
        <item>
          <title><![CDATA[${a.title}]]></title>
          <link>${abs(a.href)}</link>
          <guid>${abs(a.href)}</guid>
          <pubDate>${pub}</pubDate>
          ${a.excerpt ? `<description><![CDATA[${a.excerpt}]]></description>` : ""}
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>Santé Afrique — Flux RSS</title>
      <link>${BASE}</link>
      <description>Derniers articles publiés</description>
      ${xmlItems}
    </channel>
  </rss>`;

  return new NextResponse(xml.trim(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
