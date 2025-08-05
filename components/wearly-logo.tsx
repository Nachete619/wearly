import Image from "next/image"
import { cn } from "@/lib/utils"

interface WearlyLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showText?: boolean
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
}

export function WearlyLogo({ size = "md", className, showText = false }: WearlyLogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(sizeClasses[size], "relative")}>
        <Image src="/wearly-logo.png" alt="Wearly" fill className="object-contain" priority />
      </div>
      {showText && <span className="font-bold text-xl text-primary">Wearly</span>}
    </div>
  )
}

// Export default for compatibility
export default WearlyLogo
