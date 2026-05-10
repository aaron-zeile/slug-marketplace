'use client';

import React from 'react';
import ItemCard from './buyer/components/ItemCard';
import ItemCarousel from './buyer/components/ItemCarousel';
import { fetchRandomItemsAction } from './items/[id]/actions';
import { Item } from '../item';
import { type CardItem } from './buyer/components/ItemCard';

const toCardItem = (item: Item): CardItem => ({
  id: item.id,
  name: item.name,
  price: item.price,
  imageurl: item.images,
});

export default function FrontPage() {
  const [singleItem, setSingleItem] = React.useState<CardItem>();
  const [carouselItems, setCarouselItems] = React.useState<CardItem[]>([]);

  React.useEffect(() => {
    fetchRandomItemsAction(1).then((result) => {
      if (result.success && result.data) {
        setSingleItem(toCardItem(result.data[0]));
      }
    });

    fetchRandomItemsAction(15).then((result) => {
      if (result.success && result.data) {
        setCarouselItems(result.data.map(toCardItem));
      }
    });
  }, []);

  return (
    <div>
      {singleItem && <ItemCard item={singleItem} />}
      <ItemCarousel items={carouselItems} carouselTitle="Featured Items" />
    </div>
  );
}
