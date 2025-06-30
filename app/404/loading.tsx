export default function NotFoundLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded w-32 mx-auto"></div>
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-56 mx-auto"></div>
          <div className="h-12 bg-gray-200 rounded w-40 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}
