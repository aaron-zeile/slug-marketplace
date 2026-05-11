import FrontPage from './FrontPage';
import Topbar from './buyer/topbar';
import Payment from './buyer/payment/Payment';
import SearchBar from './buyer/components/SearchBar';

export default function Home() {
  return (
    <>
          
      <Topbar />
      <SearchBar />
      <FrontPage />
<Payment />
    </>
  );
}
