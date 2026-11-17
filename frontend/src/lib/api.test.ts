import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServices, safeLoad } from './api';

describe('getServices', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns flattened array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { id: 1, attributes: { title: 'A', slug: 'a', description: 'x' } },
          { id: 2, attributes: { title: 'B', slug: 'b', description: 'y' } },
        ],
      }),
    } as any);

    const res = await getServices();
    expect(res).toHaveLength(2);
    expect(res[0].title).toBe('A');
    expect(res[0].id).toBe(1);
  });

  it('throws on bad response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as any);

    await expect(getServices()).rejects.toThrow();
  });
});

describe('safeLoad', () => {
  it('возвращает данные, если загрузка удалась', async () => {
    const res = await safeLoad(async () => [1, 2, 3], []);
    expect(res).toEqual({ data: [1, 2, 3], failed: false });
  });

  it('не падает при ошибке API и отдаёт фолбэк', async () => {
    const res = await safeLoad(async () => {
      throw new Error('fetch failed');
    }, [] as number[]);
    expect(res).toEqual({ data: [], failed: true });
  });
});