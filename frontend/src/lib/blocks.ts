type BlockNode = {
  type: string;
  text?: string;
  children?: BlockNode[];
  [key: string]: any;
};

function renderNode(node: BlockNode): string {
  if (node.type === 'text') {
    let text = node.text ?? '';
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.code) text = `<code>${text}</code>`;
    return text;
  }

  const inner = (node.children ?? []).map(renderNode).join('');

  switch (node.type) {
    case 'paragraph':  return `<p>${inner}</p>`;
    case 'heading': {
      const level = node.level ?? 2;
      return `<h${level}>${inner}</h${level}>`;
    }
    case 'list': {
      const tag = node.format === 'ordered' ? 'ol' : 'ul';
      return `<${tag}>${inner}</${tag}>`;
    }
    case 'list-item': return `<li>${inner}</li>`;
    case 'link':      return `<a href="${node.url}">${inner}</a>`;
    case 'quote':     return `<blockquote>${inner}</blockquote>`;
    case 'code':      return `<pre><code>${inner}</code></pre>`;
    case 'image':
      return `<img src="${node.image?.url}" alt="${node.image?.alternativeText ?? ''}" />`;
    default:          return inner;
  }
}

export function blocksToHtml(blocks: any): string {
  if (!blocks) return '';
  if (typeof blocks === 'string') return blocks;

  if (blocks.type === 'root' && Array.isArray(blocks.children)) {
    return blocks.children.map(renderNode).join('');
  }

  if (Array.isArray(blocks)) {
    return blocks.map(renderNode).join('');
  }

  return '';
}