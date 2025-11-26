"use client"

import * as React from "react"
import Link from "next/link"
import { X, ChevronLeft, ChevronRight, Rocket, Sparkles, Coins } from "lucide-react"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

interface BannerItem {
  id: string
  icon: React.ReactNode
  text: string
  linkText: string
  href: string
  gradient: string
}

const STORAGE_KEY = "polypuls3-promo-banner-dismissed"
const BANNER_VERSION = "1" // Increment to show banner again after updates

export function PromoBanner() {
  const [isDismissed, setIsDismissed] = React.useState(true) // Start hidden to prevent flash
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [count, setCount] = React.useState(0)

  const idoUrl = process.env.NEXT_PUBLIC_IDO_URL || "https://polido-beta.vercel.app"

  const bannerItems: BannerItem[] = [
    {
      id: "ido",
      icon: <Rocket className="h-4 w-4" />,
      text: "PULSE Token IDO is now live! Get early access to exclusive token allocation.",
      linkText: "Join IDO",
      href: idoUrl,
      gradient: "from-purple-600 to-indigo-600 dark:from-purple-500 dark:to-indigo-500",
    },
    {
      id: "sdk",
      icon: <Sparkles className="h-4 w-4" />,
      text: "Integrate Polypuls3 into your app with our new SDK",
      linkText: "Learn more",
      href: "https://www.npmjs.com/package/@polypuls3/sdk",
      gradient: "from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500",
    },
    {
      id: "staking",
      icon: <Coins className="h-4 w-4" />,
      text: "Stake PULSE tokens to earn rewards and unlock premium features",
      linkText: "Coming soon",
      href: idoUrl,
      gradient: "from-amber-600 to-orange-600 dark:from-amber-500 dark:to-orange-500",
    },
  ]

  // Check localStorage on mount
  React.useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed !== BANNER_VERSION) {
      setIsDismissed(false)
    }
  }, [])

  // Track carousel state
  React.useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  const handleDismiss = () => {
    setIsDismissed(true)
    localStorage.setItem(STORAGE_KEY, BANNER_VERSION)
  }

  if (isDismissed) return null

  return (
    <div className="relative w-full border-b border-border bg-gradient-to-r from-background via-muted to-background overflow-hidden">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {bannerItems.map((item) => (
            <CarouselItem key={item.id} className="pl-0">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-center gap-2 text-center">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-white",
                      item.gradient
                    )}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium">
                      {item.text}
                    </span>
                  </div>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "ml-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white transition-all hover:opacity-90 bg-gradient-to-r",
                      item.gradient
                    )}
                  >
                    {item.linkText}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation dots */}
        {count > 1 && (
          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === current
                    ? "w-4 bg-purple-600 dark:bg-purple-400"
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Navigation arrows */}
        <button
          onClick={() => api?.scrollPrev()}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => api?.scrollNext()}
          className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </Carousel>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
