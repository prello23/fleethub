export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-4 w-56 bg-gray-200 rounded animate-pulse mt-2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                <div className="h-5 w-28 bg-gray-200 rounded" />
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="h-4 w-24 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-4 w-16 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
