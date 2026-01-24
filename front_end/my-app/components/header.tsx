import Image from 'next/image'  // ← This imports the Image COMPONENT

export default function Header() {
  return (
    <header className="border-2 border-black p-4">
      <div className="text-center">
        <Image 
          src="/image/logo.png"  // ← This points to your ACTUAL image file
          alt="REFEX Logo" 
          width={200}
          height={100}
        />
        <p className="text-sm">reference validation System</p>
      </div>
    </header>
  )
}