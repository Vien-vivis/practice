import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServices } from './api';

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