import Topbar from '../buyer/topbar';
import CartItem from './CartItem';

// remove later
const item = {
  id: '11111111-1111-1111-1111-111111111111',
  seller: {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Avery Parks',
  },
  name: 'GIGABYTE GeForce RTX 5070 WINDFORCE OC SFF 12G Graphics Card',
  description:
    '12GB 192-bit GDDR7, PCIe 5.0, compact graphics card built for gaming and creative work.',
  images: [
    'https://m.media-amazon.com/images/I/71ii5ow8slL._AC_UY218_.jpg',
  ],
  price: 635.99,
  created_at: '2026-05-11T12:00:00.000Z',
};

export default function Home() {
  return (
    <>
      <Topbar />
      Cart Page WIP
      <CartItem item={item}/>
    </>
  );
}
