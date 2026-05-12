import Topbar from '../../buyer/topbar';
import SearchList from './SearchList';

interface ItemPageProps {
  params: Promise<{
    searchText: string;
  }>;
}

const page = async ({ params }: ItemPageProps) => {
  const { searchText } = await params;

  return (
    <>
      <Topbar />
      <SearchList searchText={searchText} />
    </>
  );
};

export default page;
