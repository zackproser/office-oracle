import Image from 'next/image'

import Oracle1 from '@/app/oracle-images/michael-scott-oracle.png';
import Oracle2 from '@/app/oracle-images/michael-scott-oracle-2.png';
import Oracle3 from '@/app/oracle-images/office-oracle-3.png';
import Oracle4 from '@/app/oracle-images/office-oracle-4.png';
import Oracle5 from '@/app/oracle-images/office-oracle-5.png';
import Oracle6 from '@/app/oracle-images/office-oracle-6.png';
import Oracle7 from '@/app/oracle-images/office-oracle-7.png';
import Oracle8 from '@/app/oracle-images/office-oracle-8.png';

const oracleImages = [
  Oracle1,
  Oracle2,
  Oracle3,
  Oracle4,
  Oracle5,
  Oracle6,
  Oracle7,
  Oracle8
]

export default function OracleImage() {

  const selectedSrc = oracleImages[Math.floor(Math.random() * oracleImages.length)]

  return (
    <Image src={selectedSrc} alt="The office oracle" />
  )
}
