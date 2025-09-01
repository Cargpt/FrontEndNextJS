import FixedBottomMessage from '@/components/common/FixedBottomMessage'
import Header from '@/components/Header/Header'
import TestDriveDashboard from '@/components/Testdrive/TestDriveDashboard'
import React from 'react'

type Props = {}

const page = (props: Props) => {
  return (
    <div>
         <Header />
     
        <TestDriveDashboard/>
         <FixedBottomMessage  message="By messaging AiCarAdvisor (TM), you agree to our Terms and have read our Privacy Policy. See Cookie Preferences.
            "/>

    </div>
  )
}

export default page