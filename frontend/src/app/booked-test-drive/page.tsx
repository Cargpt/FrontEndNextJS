import FixedBottomMessage from '@/components/common/FixedBottomMessage'
import Header from '@/components/Header/Header'
import TestDriveDashboard from '@/components/Testdrive/TestDriveDashboard'
import React, { Suspense } from 'react'
import { CircularProgress, Box } from '@mui/material'

type Props = {}

const BookedTestDrivePage = (props: Props) => {
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
      <div>
        <Header />
        
        <TestDriveDashboard/>
        
        <FixedBottomMessage message="By messaging AiCarAdvisor (TM), you agree to our Terms and have read our Privacy Policy. See Cookie Preferences." />
      </div>
    </Suspense>
  )
}

export default BookedTestDrivePage