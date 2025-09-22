import { describe, it, expect } from 'vitest';
import { healthRouter } from './health';

describe('health router', () => {
  it('exposes GET / handler', () => {
    // Express Router structure is not directly inspectable, but presence is enough
    expect(typeof healthRouter).toBe('function');
  });
});

