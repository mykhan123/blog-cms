export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 rounded-lg bg-gray-200" />
          <div className="mt-2 h-4 w-48 rounded bg-gray-200" />
        </div>

        <div className="h-10 w-28 rounded-lg bg-gray-200" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="h-4 w-24 rounded bg-gray-200" />

                <div className="mt-3 h-9 w-12 rounded bg-gray-200" />

                <div className="mt-2 h-3 w-28 rounded bg-gray-200" />
              </div>

              <div className="h-11 w-11 rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-44 rounded bg-gray-200" />
        </div>

        <div className="divide-y divide-gray-100">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-5 py-5"
            >
              <div>
                <div className="h-4 w-64 rounded bg-gray-200" />

                <div className="mt-2 h-3 w-40 rounded bg-gray-200" />
              </div>

              <div className="h-6 w-20 rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="h-5 w-36 rounded bg-gray-200" />

          <div className="mt-2 h-3 w-56 rounded bg-gray-200" />
        </div>

        <div className="divide-y divide-gray-100">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-5 py-5"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />

              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-gray-200" />

                <div className="mt-2 h-3 w-64 rounded bg-gray-200" />
              </div>

              <div className="h-3 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}