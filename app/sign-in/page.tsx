import { auth } from '@/auth'
import { LoginButton } from '@/components/login-button'
import { redirect } from 'next/navigation'

import OracleImage from '@/components/office-oracle-image'

export default async function SignInPage() {
  const session = await auth()
  // redirect to home if user is already logged in
  if (session?.user) {
    redirect('/')
  }
  return (
    <>
      <div className="items-center inline-grid gap-4 justify-center grid-cols-j grid-rows-1 py-10">
        <h1>Welcome to The Office Oracle</h1>
        {OracleImage()}
        <div><LoginButton /></div>
      </div>
    </>
  )
}
