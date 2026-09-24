'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

type Post = {
  id: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED'
  createdAt: string
  category: {
    name: string
  } | null
}

export default function PostsTable({
  posts,
}: {
  posts: Post[]
}) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (
    id: string,
    title: string
  ) => {
    const confirmed = window.confirm(
      `Delete "${title}"?\n\nThis action cannot be undone.`
    )

    if (!confirmed) return

    setDeletingId(id)

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        alert(data.error || 'Failed to delete post')
        return
      }

      router.refresh()
    } catch {
      alert('Something went wrong while deleting the post.')
    } finally {
      setDeletingId(null)
    }
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
          📝
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          No posts found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          We couldn't find any posts matching your current
          filters. Try changing your search or create a new
          post.
        </p>

        <Link
          href="/admin/posts/new"
          className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          + Create New Post
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Post
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Category
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </th>

                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="transition hover:bg-gray-50"
                >
                  {/* Post */}
                  <td className="max-w-md px-5 py-4">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="block truncate font-semibold text-gray-900 hover:text-indigo-600"
                    >
                      {post.title}
                    </Link>

                    <p className="mt-1 truncate text-xs text-gray-400">
                      /{post.slug}
                    </p>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4 text-gray-500">
                    {post.category?.name || (
                      <span className="text-gray-400">
                        Uncategorized
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={post.status} />
                  </td>

                  {/* Date */}
                  <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                    {formatDate(post.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {post.status === 'PUBLISHED' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-500 hover:text-gray-800"
                        >
                          View
                        </a>
                      )}

                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </Link>

                      <button
                        type="button"
                        disabled={deletingId === post.id}
                        onClick={() =>
                          handleDelete(
                            post.id,
                            post.title
                          )
                        }
                        className="text-sm font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === post.id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {posts.map((post) => (
          <div
            key={post.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="block font-semibold text-gray-900 hover:text-indigo-600"
                >
                  {post.title}
                </Link>

                <p className="mt-1 truncate text-xs text-gray-400">
                  /{post.slug}
                </p>
              </div>

              <StatusBadge status={post.status} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
              <span>
                {post.category?.name || 'Uncategorized'}
              </span>

              <span>•</span>

              <span>
                {formatDate(post.createdAt)}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3">
              {post.status === 'PUBLISHED' && (
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  View
                </a>
              )}

              <Link
                href={`/admin/posts/${post.id}/edit`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Edit
              </Link>

              <button
                type="button"
                disabled={deletingId === post.id}
                onClick={() =>
                  handleDelete(
                    post.id,
                    post.title
                  )
                }
                className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deletingId === post.id
                  ? 'Deleting...'
                  : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function StatusBadge({
  status,
}: {
  status: 'DRAFT' | 'PUBLISHED'
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        status === 'PUBLISHED'
          ? 'bg-green-100 text-green-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {status === 'PUBLISHED'
        ? 'Published'
        : 'Draft'}
    </span>
  )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}