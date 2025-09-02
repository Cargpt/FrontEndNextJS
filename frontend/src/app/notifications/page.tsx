import Notifications from '@/components/Notifications/Notifications'
import React, { Suspense } from 'react'
import { CircularProgress, Box } from '@mui/material'

type Props = {}

function NotificationsPage({}: Props) {
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
      <Notifications />
    </Suspense>
  )
}

export default NotificationsPage