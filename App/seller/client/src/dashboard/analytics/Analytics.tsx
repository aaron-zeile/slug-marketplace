import React from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import RatingCard from "./SellerRating"
import StarGraph from './StarGraph'
// import SalesGraph from './SalesGraph'

export default function Analytics() {
  return (
    <Box sx={{p: 3}}>
      <Stack
        direction={{xs: 'column', md: 'row'}}
        spacing={3}
        alignItems={{xs: 'stretch', md: 'center'}}
      >
        <RatingCard/>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            bgcolor: 'background.paper',
            boxShadow: '0 10px 28px rgba(15, 23, 42, 0.08)',
            p: 2,
          }}
        >
          <StarGraph/>
        </Box>
      </Stack>
      {/* <SalesGraph/> */}
    </Box>
  )
}
