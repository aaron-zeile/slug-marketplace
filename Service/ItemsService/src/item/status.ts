export type ItemStockStatus = 'active' | 'sold';

export function statusForQuantity(quantity: number): ItemStockStatus {
  return quantity <= 0 ? 'sold' : 'active';
}

/** SQL expression for item.status from a quantity expression (uses pre-update row `data`). */
export function itemStatusCaseSql(quantityExpr: string): string {
  return `CASE
    WHEN (${quantityExpr}) <= 0 THEN 'sold'::item_status
    ELSE 'active'::item_status
  END`;
}
