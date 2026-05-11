import FrontPage from './FrontPage';
import Topbar from './buyer/topbar';
import SearchBar from './buyer/components/SearchBar';

export default function Home() {
  return (
    <>
      <Topbar />
      <SearchBar />
      <FrontPage />
    </>
  );
}
