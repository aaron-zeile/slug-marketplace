import Box from '@mui/material/Box'

import RatingCard from "./SellerRating"
import StarGraph from './StarGraph'

export default function Analytics() {
  return (
    <Box sx={{p: 3}}>
      <RatingCard/>
      <StarGraph/>
    </Box>
  )
}
