// Utilitaires simples de fetch (SSR friendly)
import { API_PREFIX } from "@/lib/api";


export type HeroSlide = { id:number; title:string; image_url:string; link_url?:string|null };
export type AdSlot = { id:number; slot_key:string; title?:string|null; image_url?:string|null; link_url?:string|null; html_code?:string|null; width?:number|null; height?:number|null };
export type VideoItem = { id:string|number; title:string; youtube_id?:string|null; src?:string|null; thumbnail_url?:string|null; published_at?:string|null };


export async function fetchHeroSlides(options?: RequestInit): Promise<HeroSlide[]> {
const res = await fetch(`${API_PREFIX}/hero-slides`, { ...options, cache: 'no-store', credentials: 'include' });
const json = await res.json();
return json?.items ?? [];
}


export async function fetchAdSlots(keys: string[], options?: RequestInit): Promise<Record<string, AdSlot>> {
const qs = encodeURIComponent(keys.join(','));
const res = await fetch(`${API_PREFIX}/ad-slots?keys=${qs}`, { ...options, cache: 'no-store', credentials: 'include' });
const json = await res.json();
return json?.items ?? {};
}


export async function fetchVideos(options?: RequestInit): Promise<VideoItem[]> {
const res = await fetch(`${API_PREFIX}/videos`, { ...options, cache: 'no-store', credentials: 'include' });
const json = await res.json();
return json?.items ?? [];
}