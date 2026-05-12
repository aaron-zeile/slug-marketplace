import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { expect, it, beforeEach, vi } from 'vitest';
import ItemDisplay from '../src/app/items/[id]/ItemDisplay';
import { Item } from '../src/item';

vi.mock('../src/app/items/[id]/actions', () => ({
  fetchItemAction: vi.fn(),
}));

import { fetchItemAction } from '../src/app/items/[id]/actions';

const mockItem: Item = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  seller: {
    id: '6a74cd3c-0c10-4507-ab92-a700174f4b15',
    name: 'Riley Quinn',
  },
  name: 'Throw Pillow 336',
  description: 'Sleek modern design that fits seamlessly into any lifestyle.',
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  price: 894.74,
  created_at: '2025-10-07T18:56:33.000Z',
};

const mockRouter = {
  push: vi.fn(),
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchItemAction).mockResolvedValue({
    success: true,
    data: mockItem,
  });
});

it('renders the item name', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(mockItem.name)).toBeDefined();
  });
});

it('renders the item description', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(mockItem.description)).toBeDefined();
  });
});

it('renders the item price formatted', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(`$${mockItem.price.toFixed(2)}`)).toBeDefined();
  });
});

it('renders the seller name', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getByText(`Seller: ${mockItem.seller.name}`)).toBeDefined();
  });
});

it('renders the created date', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  const expectedDate = new Date(mockItem.created_at).toLocaleDateString();

  await waitFor(() => {
    expect(screen.getByText(`Created ${expectedDate}`)).toBeDefined();
  });
});

it('redirects to home when fetchItemAction returns failure', async () => {
  vi.mocked(fetchItemAction).mockResolvedValue({
    success: false,
    error: 'Item not found',
  });

  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });
});

it('displays the first image as the main image on load', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    const mainImage = screen.getAllByAltText('thumbnail')[0];
    expect(mainImage.getAttribute('src')).toContain('image1');
  });
});

it('updates the main image when a thumbnail is clicked', async () => {
  render(<ItemDisplay id={mockItem.id} />);

  await waitFor(() => {
    expect(screen.getAllByAltText('thumbnail')).toHaveLength(3);
  });

  fireEvent.click(screen.getAllByAltText('thumbnail')[2]);

  await waitFor(() => {
    const mainImage = screen.getAllByAltText('thumbnail')[0];
    expect(mainImage.getAttribute('src')).toContain('image2');
  });
});
