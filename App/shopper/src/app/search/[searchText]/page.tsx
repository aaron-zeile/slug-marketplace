import Topbar from '../../buyer/topbar';
import SearchList, { type SearchFilters } from './SearchList';

interface ItemPageProps {
  params: Promise<{
    searchText: string;
  }>;
  searchParams?: Promise<{
    category?: string;
    maxPrice?: string;
    minPrice?: string;
    minStars?: string;
    sortBy?: SearchFilters['sortBy'];
  }>;
}

function toNumber(value?: string) {
  if (value === undefined) {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

const page = async ({ params, searchParams }: ItemPageProps) => {
  const { searchText } = await params;
  const filters = (await searchParams) ?? {};

  return (
    <>
      <Topbar />
      <SearchList
        filters={{
          category: filters.category,
          maxPrice: toNumber(filters.maxPrice),
          minPrice: toNumber(filters.minPrice),
          minStars: toNumber(filters.minStars),
          sortBy: filters.sortBy,
        }}
        searchText={searchText}
      />
    </>
  );
};

export default page;
