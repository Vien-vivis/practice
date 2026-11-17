import { describe, it, expect } from 'vitest';
import { blocksToHtml, blocksToText } from './blocks';

const root = (children: any[]) => ({ type: 'root', children });

describe('blocksToHtml', () => {
  it('экранирует текст, чтобы < и & не ломали разметку', () => {
    const html = blocksToHtml(root([
      { type: 'paragraph', children: [{ type: 'text', text: '5 < 7 & "кавычки"' }] },
    ]));
    expect(html).toBe('<p>5 &lt; 7 &amp; &quot;кавычки&quot;</p>');
  });

  it('сохраняет жирный текст и заголовки', () => {
    const html = blocksToHtml(root([
      { type: 'heading', level: 3, children: [{ type: 'text', text: 'Заголовок' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'важно', bold: true }] },
    ]));
    expect(html).toBe('<h3>Заголовок</h3><p><strong>важно</strong></p>');
  });

  it('делает ссылки на медиа абсолютными и экранирует alt', () => {
    const html = blocksToHtml([{ type: 'image', image: { url: '/uploads/a.png', alternativeText: 'a "b"' } }]);
    expect(html).toContain('src="http://localhost:1337/uploads/a.png"');
    expect(html).toContain('alt="a &quot;b&quot;"');
  });

  it('поддерживает строку, массив и одиночный блок', () => {
    expect(blocksToHtml('<p>raw</p>')).toBe('<p>raw</p>');
    expect(blocksToHtml([{ type: 'paragraph', children: [{ type: 'text', text: 'x' }] }])).toBe('<p>x</p>');
    expect(blocksToHtml({ type: 'paragraph', children: [{ type: 'text', text: 'y' }] })).toBe('<p>y</p>');
    expect(blocksToHtml(null)).toBe('');
  });

  it('не падает на битых блоках', () => {
    expect(blocksToHtml(root([{ type: 'paragraph' }] as any))).toBe('<p></p>');
    expect(blocksToHtml(root([{ type: 'image' }] as any))).toBe('');
  });
});

describe('blocksToText', () => {
  it('собирает плоский текст без тегов', () => {
    const text = blocksToText(root([
      { type: 'heading', level: 2, children: [{ type: 'text', text: 'Заголовок' }] },
      { type: 'paragraph', children: [{ type: 'text', text: 'Описание' }] },
    ]));
    expect(text).toBe('Заголовок Описание');
  });

  it('чистит HTML-строку', () => {
    expect(blocksToText('<p>Привет <b>мир</b></p>')).toBe('Привет мир');
  });

  it('возвращает пустую строку для пустых данных', () => {
    expect(blocksToText(null)).toBe('');
    expect(blocksToText({})).toBe('');
  });
});
