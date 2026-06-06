import { describe, expect, it } from 'vitest';

import { itemStatusCaseSql, statusForQuantity } from '../src/item/status';

describe('item status helpers', () => {
  it('marks zero or negative stock as sold', () => {
    expect(statusForQuantity(0)).toBe('sold');
    expect(statusForQuantity(-1)).toBe('sold');
  });

  it('marks positive stock as active', () => {
    expect(statusForQuantity(1)).toBe('active');
  });

  it('builds the SQL case expression for quantity status', () => {
    expect(itemStatusCaseSql('quantity_expr')).toContain(
      'WHEN (quantity_expr) <= 0',
    );
  });
});
