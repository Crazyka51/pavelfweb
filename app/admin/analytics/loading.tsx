"use client"

/**
 * Suspense fallback for /admin/analytics.
 * Required because the page uses useSearchParams().
 */

export default function AnalyticsLoading() {
  return (
    <div className="flex w-full items-center justify-center py-20">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="animate-pulse text-sm text-muted-foreground">Načítám statistiky...</span>
      </div>
    </div>
  )
}
