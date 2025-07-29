import FixedBottomMessage from '@/components/common/FixedBottomMessage'
import Header from '@/components/Header/Header'
import ProfilePage from '@/components/Profile/ProfilePage'
import React from 'react'

type Props = {}

function page({}: Props) {
  return (
    <>
              <Header />

    <ProfilePage/>
                <FixedBottomMessage  message="By messaging AiCarAdvisor, you agree to our Terms and have read our Privacy Policy. See Cookie Preferences.
            "/>

    </>

  )
}

export default page