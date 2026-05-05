'use client';

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

const page = async ({ params }: ItemPageProps) => {
  const { id } = await params;
  // with this ID, fetch the item and return all its info.
  // then display it all here.
  return <div>{id}</div>;
};

export default page;
