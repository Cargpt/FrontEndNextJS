"use client";
import FixedBottomMessage from '@/components/common/FixedBottomMessage'
import Header from '@/components/Header/Header'
import TestDriveDashboard from '@/components/Testdrive/TestDriveDashboard'
import React, { Suspense } from 'react'
import { CircularProgress, Box } from '@mui/material'
import Navbar from '@/components/Navbar/Navbar'
import { useRouter } from 'next/navigation';

type Props = {}

const BookedTestDrivePage = (props: Props) => {
  const router = useRouter();
  const backToPrevious = () => {
    router.back();
  }
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
        <Navbar backToPrevious={backToPrevious} />        
        <TestDriveDashboard/>
        
        <FixedBottomMessage message="By messaging AiCarAdvisor (TM), you agree to our Terms and have read our Privacy Policy. See Cookie Preferences." />
      </div>
    </Suspense>
  )
}

export default BookedTestDrivePage