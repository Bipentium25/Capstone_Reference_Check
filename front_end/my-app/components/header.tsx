// components/header.tsx
import Image from 'next/image'

export default function Header() {
  return (
    <div className="header-shell-inner">
      <div className="logo-wrapper">
        <Image
          src="/image/Gemini_Generated_Image_2rq56o2rq56o2rq5-Picsart-BackgroundRemover.png"
          alt="REFEX Logo"
          priority
          fill
          sizes="(max-width: 768px) 200px, 300px"
        />
      </div>
    </div>
  )
}