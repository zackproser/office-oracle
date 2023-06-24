import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import OfficeOracle from '@/app/oracle-images/office-oracle-7.png'
import Image from 'next/image'

export const runtime = 'edge'

export default function IndexPage() {
  const id = nanoid()

  return (
    <>
      <Image src={OfficeOracle} alt="Office Oracle" />
      <Chat id={id} />
    </>
  )
}
