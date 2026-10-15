export interface MediaFormat {
  url: string;
  width: number;
  height: number;
}

export interface Media {
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, MediaFormat>;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Author {
  id: number;
  name: string;
  avatar?: Media | null;
  bio?: string | null;
}

export interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon?: string | null;
  image?: Media | null;
  order?: number | null;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  cover?: Media | null;
  excerpt?: string | null;
  content: any;
  category?: Category[] | null;
  authors?: Author[] | null;
  publishedAt: string;
}

export interface Seo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: Media | null;
}

export interface Contacts {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

export interface GlobalData {
  siteName: string;
  logo?: Media | null;
  seo?: Seo | null;
  contacts?: Contacts | null;
}