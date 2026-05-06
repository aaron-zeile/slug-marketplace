// common test stuff here
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { TextDecoder, TextEncoder } from 'util'

import { MockRouter } from './test/mockRouter'

class TestTextEncoder extends TextEncoder {
  encode(input?: string) {
    return new Uint8Array(super.encode(input))
  }
}

globalThis.TextEncoder = TestTextEncoder
globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder

vi.mock("server-only", () => { return { } })

vi.mock('next/navigation', () => {
  return {
    useRouter: vi.fn().mockImplementation(() => {
      return MockRouter
    }),
  }
})

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup()
})
