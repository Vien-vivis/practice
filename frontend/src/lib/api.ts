import type {
  Service, Post, GlobalData, Category,
} from './types';

const BASE = import.meta.env.STRAPI_URL ?? 'http://localhost:1337';
const TOKEN = import.meta.env.STRAPI_TOKEN ?? '';

function headers(): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

function flatten(item: any): any {
  if (!item) return item;
  if (item.attributes) return { id: item.id, ...item.attributes };
  return item;
}

async function request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}/api/${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error(`Strapi API error ${res.status} on ${path}`);
  const json = await res.json();
  return json.data;
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
  url.searchParams.set('populate[cover]', 'true');
  url.searchParams.set('populate[category]', 'true');
  url.searchParams.set('populate[authors]', 'true');

  if (category && category.trim() !== '') {
    url.searchParams.set('filters[category][slug][$eq]', category.trim());
  }

  const res = await fetch(url.toString(), { headers: headers() });
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

  const res = await fetch(url.toString(), { headers: headers() });
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

  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch post');
  const json = await res.json();
  return json.data && json.data[0] ? json.data[0] : null;
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

  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ? flatten(json.data) : null;
}

export async function createRequest(payload: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  const res = await fetch(`${BASE}/api/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: payload }),
  });
  if (!res.ok) throw new Error('Failed to send request');
}