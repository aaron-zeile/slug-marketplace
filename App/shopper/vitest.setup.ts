// common test stuff here
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

import { MockRouter } from './test/mockRouter'

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