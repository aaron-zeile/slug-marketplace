import type { ReactNode } from 'react';
import LogoutButton from './LogoutButton';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <nav>
        <LogoutButton />
      </nav>
      {children}
    </>
  );
}
