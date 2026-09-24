'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">

        {/* Error Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg
            className="h-7 w-7"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 8v4"
              strokeLinecap="round"
            />

            <path
              d="M12 16h.01"
              strokeLinecap="round"
            />

            <path
              d="M10.3 3.7 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="mt-5 text-xl font-semibold text-gray-900">
          Something went wrong
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          We couldn't load the dashboard right now.
          Please try again.
        </p>

        {/* Retry */}
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          Try Again
        </button>

        {/* Dashboard Link */}
        <button
          type="button"
          onClick={() => {
            window.location.href = '/admin'
          }}
          className="ml-2 mt-6 inline-flex items-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          Refresh
        </button>

      </div>
    </div>
  )
}