import type {
  Service, Post, GlobalData, Category,
} from './types';

const BASE = import.meta.env.STRAPI_URL ?? 'http://localhost:1337';
const TOKEN = import.meta.env.STRAPI_TOKEN ?? '';

/**
 * Strapi может быть выключен, недоступен или отвечать дольше, чем длится рендер
 * страницы. Без таймаута `fetch` в SSR-странице висит до бесконечности, а без
 * перехвата ошибок любая недоступность API превращается в 500 на всём сайте.
 */
const TIMEOUT_MS = 8000;

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

function flatten(item: any): any {
  if (!item) return item;
  if (item.attributes) return { id: item.id, ...item.attributes };
  return item;
}

async function fetchStrapi(url: URL | string, init: RequestInit = {}): Promise<Response> {
  const merged: RequestInit = {
    ...init,
    headers: { ...headers(), ...((init.headers as Record<string, string> | undefined) ?? {}) },
  };
  try {
    merged.signal = AbortSignal.timeout(TIMEOUT_MS);
  } catch {
    // Старые окружения без AbortSignal.timeout — работаем без таймаута.
  }
  return fetch(url.toString(), merged);
}

async function request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}/api/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetchStrapi(url);
  if (!res.ok) throw new Error(`Strapi API error ${res.status} on ${path}`);
  const json = await res.json();
  return json.data;
}

/**
 * Загружает данные и не даёт ошибке API уронить рендер страницы:
 * при любой проблеме возвращает фолбэк и флаг `failed`.
 */
export async function safeLoad<T>(
  load: () => Promise<T>,
  fallback: T,
): Promise<{ data: T; failed: boolean }> {
  try {
    return { data: await load(), failed: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[api] данные недоступны, показываю фолбэк: ${message}`);
    return { data: fallback, failed: true };
  }
}

export async function getServices(): Promise<Service[]> {
  const data = await request<any[]>('services', {
    'sort': 'order:asc',
    'populate[image]': 'true',
  });
  return (data ?? []).map(flatten);
}

export async function getService(slug: string): Promise<Service | null> {
  const data = await request<any[]>('services', {
    'filters[slug][$eq]': slug,
    'populate[image]': 'true',
  });
  return data && data[0] ? flatten(data[0]) : null;
}

export async function getPosts(opts: {
  page?: number;
  pageSize?: number;
  category?: string;
} = {}): Promise<{ items: Post[]; total: number; pageCount: number; page: number }> {
  const { page = 1, pageSize = 6, category } = opts;

  const url = new URL(`${BASE}/api/posts`);
  url.searchParams.set('sort', 'publishedAt:desc');
  url.searchParams.set('pagination[page]', String(page));
  url.searchParams.set('pagination[pageSize]', String(pageSize));

  // Запрашиваем связи
  url.searchParams.set('populate[cover]', 'true');
  url.searchParams.set('populate[category]', 'true');
  url.searchParams.set('populate[authors]', 'true');

  // Фильтр по категории
  if (category && category.trim() !== '') {
    url.searchParams.set('filters[category][slug][$eq]', category.trim());
  }

  const res = await fetchStrapi(url);
  if (!res.ok) throw new Error(`Strapi API error ${res.status} on posts`);
  const json = await res.json();

  return {
    items: json.data ?? [],
    total: json.meta?.pagination?.total ?? 0,
    pageCount: json.meta?.pagination?.pageCount ?? 1,
    page,
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const url = new URL(`${BASE}/api/posts`);
  url.searchParams.set('sort', 'publishedAt:desc');
  url.searchParams.set('pagination[pageSize]', '100');
  url.searchParams.set('populate[cover]', 'true');
  url.searchParams.set('populate[category]', 'true');
  url.searchParams.set('populate[authors]', 'true');

  const res = await fetchStrapi(url);
  if (!res.ok) throw new Error('Failed to fetch posts');
  const json = await res.json();
  return json.data ?? [];
}

export async function getPost(slug: string): Promise<Post | null> {
  const url = new URL(`${BASE}/api/posts`);
  url.searchParams.set('filters[slug][$eq]', slug);
  url.searchParams.set('populate[cover]', 'true');
  url.searchParams.set('populate[category]', 'true');
  url.searchParams.set('populate[authors]', 'true');

  const res = await fetchStrapi(url);
  if (!res.ok) throw new Error('Failed to fetch post');
  const json = await res.json();
  return json.data && json.data[0] ? flatten(json.data[0]) : null;
}

export async function getCategories(): Promise<Category[]> {
  const data = await request<any[]>('categories', { 'sort': 'name:asc' });
  return (data ?? []).map(flatten);
}

export async function getGlobal(): Promise<GlobalData | null> {
  const url = new URL(`${BASE}/api/global`);
  url.searchParams.set('populate[logo]', 'true');
  url.searchParams.set('populate[seo][populate][ogImage]', 'true');
  url.searchParams.set('populate[contacts]', 'true');

  const res = await fetchStrapi(url);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ? flatten(json.data) : null;
}

export async function createRequest(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const res = await fetchStrapi(`${BASE}/api/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  });
  if (!res.ok) throw new Error('Failed to send request');
}

export async function getReviews(): Promise<any[]> {
  const url = new URL(`${BASE}/api/reviews`);
  url.searchParams.set('populate', '*'); // Чтобы подтянулись данные пользователя

  const res = await fetchStrapi(url);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  const json = await res.json();
  return json.data ?? [];
}
