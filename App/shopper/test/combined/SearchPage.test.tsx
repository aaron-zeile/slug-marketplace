import { it } from 'vitest'
import { render } from '@testing-library/react'

import SearchPage from '../../src/app/search/[searchText]/page'

it('Renders', async () => {
  const result = await SearchPage({
    params: Promise.resolve({ searchText: "test" }),
  });

  render(result);
})