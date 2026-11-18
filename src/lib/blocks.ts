type BlockNode = {
  type: string;
  text?: string;
  children?: BlockNode[];
  [key: string]: any;
};

const STRAPI_URL = import.meta.env.STRAPI_URL ?? 'http://localhost:1337';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Блоки приходят из Strapi как обычный текст, но вставляются в разметку через
 * set:html. Без экранирования символы <, > и & ломают HTML и «съедают» часть
 * статьи или описания услуги.
 */
function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

/** Strapi хранит ссылки на медиа относительными (/uploads/...). */
function toAbsoluteUrl(url?: string | null): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

function renderNode(node: BlockNode): string {
  if (!node || typeof node !== 'object') return '';

  if (node.type === 'text') {
    let text = escapeHtml(node.text);
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.strikethrough) text = `<s>${text}</s>`;
    if (node.code) text = `<code>${text}</code>`;
    return text;
  }

  const inner = (node.children ?? []).map(renderNode).join('');

  switch (node.type) {
    case 'paragraph':  return `<p>${inner}</p>`;
    case 'heading': {
      const level = Math.min(6, Math.max(1, Number(node.level) || 2));
      return `<h${level}>${inner}</h${level}>`;
    }
    case 'list': {
      const tag = node.format === 'ordered' ? 'ol' : 'ul';
      return `<${tag}>${inner}</${tag}>`;
    }
    case 'list-item': return `<li>${inner}</li>`;
    case 'link': {
      const href = escapeHtml(toAbsoluteUrl(node.url));
      return `<a href="${href}" rel="noopener noreferrer">${inner}</a>`;
    }
    case 'quote':     return `<blockquote>${inner}</blockquote>`;
    case 'code':      return `<pre><code>${inner}</code></pre>`;
    case 'image': {
      const src = escapeHtml(toAbsoluteUrl(node.image?.url));
      const alt = escapeHtml(node.image?.alternativeText ?? '');
      return src ? `<img src="${src}" alt="${alt}" loading="lazy" />` : '';
    }
    default:          return inner;
  }
}

function isRoot(blocks: any): blocks is { type: 'root'; children: BlockNode[] } {
  return Boolean(blocks) && blocks.type === 'root' && Array.isArray(blocks.children);
}

export function blocksToHtml(blocks: any): string {
  if (!blocks) return '';
  if (typeof blocks === 'string') return blocks;

  if (isRoot(blocks)) {
    return blocks.children.map(renderNode).join('');
  }

  if (Array.isArray(blocks)) {
    return blocks.map(renderNode).join('');
  }

  if (typeof blocks === 'object' && typeof blocks.type === 'string') {
    return renderNode(blocks);
  }

  return '';
}

function collectText(node: any, parts: string[]): void {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'text' && node.text) parts.push(String(node.text));
  if (Array.isArray(node.children)) {
    node.children.forEach((child: any) => collectText(child, parts));
  }
}

/**
 * Плоский текст из блоков — для meta-описания и превью, где HTML недопустим.
 */
export function blocksToText(blocks: any): string {
  if (!blocks) return '';
  if (typeof blocks === 'string') {
    return blocks.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  const parts: string[] = [];
  if (isRoot(blocks)) {
    blocks.children.forEach((child) => collectText(child, parts));
  } else if (Array.isArray(blocks)) {
    blocks.forEach((child) => collectText(child, parts));
  } else {
    collectText(blocks, parts);
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
