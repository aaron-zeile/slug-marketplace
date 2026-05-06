import 'reflect-metadata';
import { Resolver, Query } from 'type-graphql';
import { MonthlyProfit } from './types';
import sql from '@/lib/db';

@Resolver()
export class ProfitResolver {
  @Query(() => [MonthlyProfit])
  async monthlyProfit(): Promise<MonthlyProfit[]> {
    const rows = await sql<{ month: Date; profit: string }[]>`
      SELECT DATE_TRUNC('month', created_at) AS month,
             SUM(fee_amount)                 AS profit
      FROM platform_fees
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    return rows.map((r) => ({
      month: r.month.toISOString().slice(0, 7), // "YYYY-MM"
      profit: parseFloat(r.profit),
    }));
  }
}
