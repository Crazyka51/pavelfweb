import { Card, CardContent, CardHeader } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"

export default function NotFoundLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Card className="w-full max-w-md text-center bg-slate-800 border-slate-700">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center">
            <Skeleton className="w-12 h-8" />
          </div>
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>

          <div className="pt-4 border-t border-slate-700">
            <Skeleton className="h-4 w-32 mx-auto mb-3" />
            <div className="flex gap-2 justify-center">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
