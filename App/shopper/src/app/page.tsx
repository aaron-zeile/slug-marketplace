import ItemCard from './buyer/components/ItemCard';
import ItemCarousel from './buyer/components/ItemCarousel';
import Topbar from './buyer/topbar';

// remove this later
import { items, singleItem } from './buyer/components/items';

export default function Home() {
  return (
    <>
      <Topbar />
      <ItemCard item={singleItem}/>
      <ItemCarousel items={items} carouselTitle="Featured Items"/>
    </>
  );
}
