import { redirect } from 'next/navigation';

import Topbar from '../../buyer/topbar';
import Payment from '../../buyer/payment/Payment';
import { checkLogin } from '../../buyer/login/actions';

interface CheckoutPaymentPageProps {
  searchParams: Promise<{
    addressId?: string;
  }>;
}

export default async function CheckoutPaymentPage({
  searchParams,
}: CheckoutPaymentPageProps) {
  const session = await checkLogin();
  const { addressId } = await searchParams;

  if (!session.user) {
    redirect('/');
  }

  if (!addressId) {
    redirect('/checkout/shipping');
  }

  return (
    <>
      <Topbar />
      <Payment addressId={addressId} />
    </>
  );
}
