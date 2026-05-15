// common test stuff here
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { TextDecoder, TextEncoder } from 'util';

import { MockRouter } from './test/mockRouter';

// --------------------
// TextEncoder / Decoder fix (Node vs JSDOM compatibility)
// --------------------
class TestTextEncoder extends TextEncoder {
  encode(input?: string) {
    return new Uint8Array(super.encode(input));
  }
}

globalThis.TextEncoder = TestTextEncoder;
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder;

// --------------------
// Next.js mocks
// --------------------

vi.mock('server-only', () => ({}));

// navigation (you already had this)
vi.mock('next/navigation', () => {
  return {
    useRouter: vi.fn().mockImplementation(() => {
      return MockRouter;
    }),
  };
});

vi.mock('next/headers', () => {
  return {
    cookies: () => ({
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn(),
      getAll: vi.fn(() => []),
    }),

    headers: () => ({
      get: vi.fn(),
      has: vi.fn(),
      entries: vi.fn(() => []),
    }),
  };
});

// --------------------
// lifecycle hooks
// --------------------
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});
