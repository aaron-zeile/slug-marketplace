import type { ReactNode } from 'react';
import LogoutButton from './LogoutButton';
import SimpleCharts from './charts/chart';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav>
        <LogoutButton />
      </nav>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          {children}
        </div>
        <section style={{ padding: '16px', border: '1px solid grey', flexShrink: 0 }}>
          <SimpleCharts />
        </section>
      </div>
    </>
  );
}
