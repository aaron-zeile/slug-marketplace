import ItemDisplay from './ItemDisplay';

interface ItemPageProps {
  params: Promise<{
    id: string;
  }>;
}

const page = async ({ params }: ItemPageProps) => {
  const { id } = await params;

  return <ItemDisplay id={id} />;
};

export default page;
