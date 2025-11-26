import { Package } from "lucide-react"
import Link from "next/link"

export function AnnouncementBanner() {
  return (
    <div className="w-full border-b border-border bg-muted">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium">
              Integrate Polypuls3 into your app with our new SDK
            </span>
          </div>
          <Link
            href="https://www.npmjs.com/package/@polypuls3/sdk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            Learn more
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
