import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import DashboardShell from '@/components/dashboard/DashboardShell';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const store = await cookies();
  const currentLocale = store.get('locale')?.value ?? 'en';
  return <DashboardShell currentLocale={currentLocale}>{children}</DashboardShell>;
}
