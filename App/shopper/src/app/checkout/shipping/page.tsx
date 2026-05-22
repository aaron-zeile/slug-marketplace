import { redirect } from 'next/navigation';

import Topbar from '../../buyer/topbar';
import { checkLogin } from '../../buyer/login/actions';
import CheckoutShipping from './CheckoutShipping';

export default async function CheckoutShippingPage() {
  const session = await checkLogin();

  if (!session.user) {
    redirect('/');
  }

  return (
    <>
      <Topbar />
      <CheckoutShipping />
    </>
  );
}
