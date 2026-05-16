import FrontPage from './FrontPage';
import Topbar from './buyer/topbar';
import Payment from './buyer/payment/Payment';

export default function Home() {
  return (
    <>
      <Topbar />
      <FrontPage />
<Payment />
    </>
  );
}
