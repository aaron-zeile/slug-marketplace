import GoogleLogin from './buyer/login';
import ItemCard from './components/ItemCard';

// remove this later
const singleItem = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Wireless Headphones',
  price: 59.99,
  imageurl: [
    "https://www.kroger.com/product/images/xlarge/front/0081006114507", 
    "https://i5.walmartimages.com/seo/VILINICE-Noise-Cancelling-Headphones-Wireless-Bluetooth-Over-Ear-Headphones-with-Microphone-Black-Q8_2dd0cd25-ccde-4bfe-9ac6-45193648f675.57b0ee17de9936327708f9325732d1ef.jpeg"
  ]
}

export default function Home() {
  return (
    <>
      <GoogleLogin />
      <ItemCard item={singleItem}/>
    </>
  );
}
