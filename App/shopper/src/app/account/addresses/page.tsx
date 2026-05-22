import { redirect } from 'next/navigation';

import Topbar from '../../buyer/topbar';
import { checkLogin } from '../../buyer/login/actions';
import AccountAddresses from './AccountAddresses';

export default async function AccountAddressesPage() {
  const session = await checkLogin();

  if (!session.user) {
    redirect('/');
  }

  return (
    <>
      <Topbar />
      <AccountAddresses />
    </>
  );
}
