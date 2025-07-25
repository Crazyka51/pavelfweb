import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4 py-12 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="text-lg font-medium">Načítání administrace...</p>
      </div>
    </div>
  )
}
