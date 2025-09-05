import Variants from '@/components/Bookmark/Variants'
import { Box, CircularProgress } from '@mui/material'
import React, { Suspense } from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    }>
    <Variants/>
    </Suspense>
  )
}
export default page