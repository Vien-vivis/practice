import type { Service, Post } from '../lib/types';

export const mockServices: Service[] = [
  { id: 1, title: 'Веб-разработка', slug: 'web', description: 'Сайты под ключ' },
  { id: 2, title: 'Дизайн', slug: 'design', description: 'UI/UX и брендинг' },
  { id: 3, title: 'Маркетинг', slug: 'marketing', description: 'SEO и реклама' },
];

export const mockPosts: Post[] = [
  {
    id: 1,
    title: 'Как мы делаем сайты',
    slug: 'how-we-build',
    content: '<p>Пример статьи.</p>',
    excerpt: 'Короткое описание',
    publishedAt: '2025-01-01',
  },
];