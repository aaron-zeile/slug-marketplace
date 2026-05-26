import { Suspense } from 'react';

import CartExpiredToast from './buyer/components/CartExpiredToast';
import FrontPage from './FrontPage';
import Topbar from './buyer/topbar';

export default function Home() {
  return (
    <>
      <Topbar />
      <FrontPage />
      <Suspense fallback={null}>
        <CartExpiredToast />
      </Suspense>
    </>
  );
}
