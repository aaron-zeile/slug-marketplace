import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/app/buyer/topbar', () => ({
  default: function MockTopbar() {
    return <header data-testid="mock-topbar">Topbar</header>;
  },
}));

vi.mock('../src/app/items/[id]/ItemDisplay', () => ({
  default: function MockItemDisplay({ id }: { id: string }) {
    return <main data-testid="mock-item-display">{id}</main>;
  },
}));

import ItemPage from '../src/app/items/[id]/page';

describe('items/[id] page', () => {
  it('awaits params and renders Topbar with ItemDisplay for the route id', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const tree = await ItemPage({
      params: Promise.resolve({ id }),
    });

    render(tree);

    expect(screen.getByTestId('mock-topbar')).toBeDefined();
    expect(screen.getByTestId('mock-item-display').textContent).toBe(id);
  });
});
