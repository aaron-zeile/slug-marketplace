import { render, screen } from '@testing-library/react';
import { expect, it, vi, beforeEach } from 'vitest';
import ItemPage from '../src/app/items/[id]/page';

vi.mock('../src/app/items/[id]/ItemDisplay', () => ({
  default: ({ id }: { id: string }) => (
    <div data-testid="item-display">ItemDisplay: {id}</div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

it('renders ItemDisplay with correct id', async () => {
  const testId = '550e8400-e29b-41d4-a716-446655440000';

  const result = await ItemPage({
    params: Promise.resolve({ id: testId }),
  });

  render(result);

  expect(screen.getByTestId('item-display')).toBeDefined();
  expect(screen.getByText(`ItemDisplay: ${testId}`)).toBeDefined();
});

it('passes different id to ItemDisplay', async () => {
  const testId = '6a74cd3c-0c10-4507-ab92-a700174f4b15';

  const result = await ItemPage({
    params: Promise.resolve({ id: testId }),
  });

  render(result);

  expect(screen.getByText(`ItemDisplay: ${testId}`)).toBeDefined();
});

it('extracts id from params correctly', async () => {
  const testId = 'test-id-12345';

  const result = await ItemPage({
    params: Promise.resolve({ id: testId }),
  });

  render(result);

  expect(screen.getByTestId('item-display')).toBeDefined();
  expect(screen.getByText(`ItemDisplay: ${testId}`)).toBeDefined();
});
