import Topbar from '../../buyer/topbar';

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
      {searchText}
    </>
  );
};

export default page;