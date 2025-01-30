import Image from 'next/image'
import loader from '@/assets/loader.gif'

export default function LoadingPage() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100wv'
      }}>
      <Image src={loader} alt="Loading..." height={150} width={150} />
    </div>
  )
}
