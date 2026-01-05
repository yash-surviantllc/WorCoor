import Image from "next/image"

interface FullLogoProps {
  className?: string
}

export function FullLogo({ className = "" }: FullLogoProps) {
  return (
    <div className={`relative ${className}`} style={{ height: "40px" }}>
      <Image
        src="https://worcoor.s3.ap-south-1.amazonaws.com/assets-web/general/logo_full_b.png"
        alt="Worcoor Logo"
        width={180}
        height={40}
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  )
}
