import { vi } from 'vitest'

export const MockRouter = {
  push: vi.fn()
}

export const routerSpy = vi.spyOn(MockRouter, 'push');
