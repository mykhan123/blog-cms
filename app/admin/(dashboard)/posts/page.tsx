import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PostsTable from './PostsTable'

type PostsPageProps = {
  searchParams: Promise<{
    search?: string
    status?: string
    category?: string
    page?: string
  }>
}

const POSTS_PER_PAGE = 8

export default async function PostsPage({
  searchParams,
}: PostsPageProps) {
  const params = await searchParams

  const search = params.search?.trim() || ''
  const status =
    params.status === 'DRAFT' ||
    params.status === 'PUBLISHED'
      ? params.status
      : ''

  const categoryId = params.category || ''

  const currentPage = Math.max(
    Number(params.page) || 1,
    1
  )

  const where = {
    ...(search
      ? {
          title: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}),

    ...(status
      ? {
          status: status as 'DRAFT' | 'PUBLISHED',
        }
      : {}),

    ...(categoryId
      ? {
          categoryId,
        }
      : {}),
  }

  const [posts, totalPosts, categories] =
    await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (currentPage - 1) * POSTS_PER_PAGE,
        take: POSTS_PER_PAGE,
      }),

      prisma.post.count({
        where,
      }),

      prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
    ])

  const totalPages = Math.ceil(
    totalPosts / POSTS_PER_PAGE
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Posts
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create, manage and publish your blog posts.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex w-fit items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          + New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <form
          method="GET"
          className="grid grid-cols-1 gap-3 md:grid-cols-4"
        >
          {/* Search */}
          <div className="relative md:col-span-2">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />

              <path
                d="m20 20-4-4"
                strokeLinecap="round"
              />
            </svg>

            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search posts..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Status */}
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">
              All Statuses
            </option>

            <option value="PUBLISHED">
              Published
            </option>

            <option value="DRAFT">
              Draft
            </option>
          </select>

          {/* Category */}
          <select
            name="category"
            defaultValue={categoryId}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">
              All Categories
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>

          {/* Buttons */}
          <div className="flex gap-2 md:col-span-4">
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Apply Filters
            </button>

            {(search || status || categoryId) && (
              <Link
                href="/admin/posts"
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Clear
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Result Summary */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Showing{' '}
          <span className="font-medium text-gray-900">
            {posts.length}
          </span>{' '}
          of{' '}
          <span className="font-medium text-gray-900">
            {totalPosts}
          </span>{' '}
          posts
        </p>

        {search && (
          <p className="text-sm text-gray-500">
            Search: "{search}"
          </p>
        )}
      </div>

      {/* Posts Table */}
      <PostsTable
        posts={posts.map((post) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status,
          createdAt: post.createdAt.toISOString(),
          category: post.category
            ? {
                name: post.category.name,
              }
            : null,
        }))}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          search={search}
          status={status}
          category={categoryId}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------
   Pagination
------------------------------------------------------- */

function Pagination({
  currentPage,
  totalPages,
  search,
  status,
  category,
}: {
  currentPage: number
  totalPages: number
  search: string
  status: string
  category: string
}) {
  function createUrl(page: number) {
    const params = new URLSearchParams()

    if (search) {
      params.set('search', search)
    }

    if (status) {
      params.set('status', status)
    }

    if (category) {
      params.set('category', category)
    }

    params.set('page', String(page))

    return `/admin/posts?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </p>

      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={createUrl(currentPage - 1)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            ← Previous
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-300">
            ← Previous
          </span>
        )}

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        )
          .filter((page) => {
            return (
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1
            )
          })
          .map((page, index, pages) => (
            <div
              key={page}
              className="flex items-center gap-2"
            >
              {index > 0 &&
                page - pages[index - 1] > 1 && (
                  <span className="px-1 text-gray-400">
                    ...
                  </span>
                )}

              <Link
                href={createUrl(page)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium ${
                  page === currentPage
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </Link>
            </div>
          ))}

        {currentPage < totalPages ? (
          <Link
            href={createUrl(currentPage + 1)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Next →
          </Link>
        ) : (
          <span className="cursor-not-allowed rounded-lg border border-gray-100 px-3 py-2 text-sm font-medium text-gray-300">
            Next →
          </span>
        )}
      </div>
    </div>
  )
}