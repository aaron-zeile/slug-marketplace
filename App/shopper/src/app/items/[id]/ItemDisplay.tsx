'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Divider,
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
} from '@mui/material';
import { Item } from '../../../item';
import { fetchItemAction } from './actions';

interface Props {
  id: string;
}

const ItemDisplay = ({ id }: Props) => {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    fetchItemAction(id).then((result) => {
      if (result.success && result.data) {
        setItem(result.data);
        setMainImage(result.data.images[0]);
      } else {
        router.push('/');
      }
      setLoading(false);
    });
  }, [id, router]);

  if (loading || !item) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

  const handleMainImageChange = (image: string) => {
    setMainImage(image);
  };

  return (
    <Paper elevation={5}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          padding: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            padding: 1,
          }}
        >
          <Typography sx={{ fontSize: '1.5rem' }}>{item.name}</Typography>
          <Typography sx={{ color: 'grey', textAlign: 'center' }}>
            {item.description}
          </Typography>
        </Box>
        <Box sx={{}}>
          <Typography sx={{ color: '' }}>Seller: {item.seller.name}</Typography>
          {/* <Typography>{item.seller.id}</Typography> USE THIS ID TO LINK TO SELLERS PROFILE / STORE?! */}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Main Image */}
          <Box
            sx={{
              width: '100%',
              height: '40vh',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Image
              key={mainImage}
              src={mainImage}
              fill
              alt="thumbnail"
              style={{ objectFit: 'contain' }}
            />
          </Box>
          {/* Images to select from */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {item.images.map((image) => (
              <Box
                key={image}
                onClick={() => handleMainImageChange(image)}
                sx={{
                  position: 'relative',
                  width: '80px',
                  height: '80px',
                  flexShrink: 0,
                  border:
                    image !== mainImage
                      ? '1px solid #ddd'
                      : '2px solid #c45500',
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  opacity: image !== mainImage ? 1 : 0.5,
                }}
              >
                <Image
                  src={image}
                  fill
                  alt="thumbnail"
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        <Divider />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 'bold', fontSize: '3rem' }}>
              ${item.price.toFixed(2)}
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ color: 'green', fontSize: '2rem' }}>
              In Stock
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              sx={{
                width: '100%',
                height: '5vh',
              }}
            >
              Add to cart
            </Button>
            <Button
              variant="contained"
              sx={{
                width: '100%',
                height: '5vh',
                backgroundColor: 'gold',
                color: 'black',
              }}
            >
              Add to wishlist
            </Button>
          </Box>

          {/* USE THIS MAYBE?
          <Box>
            <Typography>Item ID</Typography>
            <Typography>{item.id}</Typography>
          </Box> */}

          <Box>
            <Typography sx={{ color: 'gray' }}>
              Created {new Date(item.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        {/* REVIEWS GO HERE */}
        <Box> Reviews</Box>
      </Box>
    </Paper>
  );
};

export default ItemDisplay;
