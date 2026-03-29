import Image from "next/image"
import { cn } from "@repo/ui/lib/utils"

type BrandLogoProps = {
  className?: string
  alt?: string
  priority?: boolean
}

export function BrandLogo({
  className,
  alt = "Codeforces logo",
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/codeforces.jpeg"
      alt={alt}
      width={256}
      height={256}
      priority={priority}
      className={cn("rounded-[18%] object-cover", className)}
    />
  )
}
