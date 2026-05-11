import Topbar from '../../buyer/topbar';
import ItemDisplay from './ItemDisplay';

interface ItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: ItemPageProps) => {
  const { id } = await params;
  return (
    <>
      <Topbar />
      <ItemDisplay id={id} />
    </>
  );
};

export default page;
