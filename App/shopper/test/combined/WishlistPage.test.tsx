import { it } from 'vitest';
import { render } from '@testing-library/react';

import WishlistPage from '../../src/app/wishlist/page';

it('Renders', async () => {
  render(<WishlistPage />);
});
