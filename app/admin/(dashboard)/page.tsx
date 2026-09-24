import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await auth()

  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalCategories,
    recentPosts,
    recentActivities,
  ] = await Promise.all([
    // Total posts
    prisma.post.count(),

    // Published posts
    prisma.post.count({
      where: {
        status: 'PUBLISHED',
      },
    }),

    // Draft posts
    prisma.post.count({
      where: {
        status: 'DRAFT',
      },
    }),

    // Total categories
    prisma.category.count(),

    // Recent posts
    prisma.post.findMany({
      take: 5,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        category: true,
      },
    }),

    // Recent activities
    prisma.activity.findMany({
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {session?.user?.name || 'Admin'}!
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="inline-flex w-fit items-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          + New Post
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Posts"
          value={totalPosts}
          description="All blog posts"
          icon="📝"
          iconBg="bg-blue-100"
          iconText="text-blue-600"
        />

        <StatCard
          title="Published"
          value={publishedPosts}
          description="Live on your blog"
          icon="✓"
          iconBg="bg-green-100"
          iconText="text-green-600"
        />

        <StatCard
          title="Drafts"
          value={draftPosts}
          description="Waiting to publish"
          icon="✎"
          iconBg="bg-amber-100"
          iconText="text-amber-600"
        />

        <StatCard
          title="Categories"
          value={totalCategories}
          description="Blog categories"
          icon="▦"
          iconBg="bg-violet-100"
          iconText="text-violet-600"
        />
      </div>

      {/* Recent Posts */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Posts
            </h2>

            <p className="text-sm text-gray-500">
              Your latest blog posts
            </p>
          </div>

          <Link
            href="/admin/posts"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xl">
              📝
            </div>

            <h3 className="font-medium text-gray-900">
              No posts yet
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Create your first blog post to get started.
            </p>

            <Link
              href="/admin/posts/new"
              className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Create a post →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="block truncate font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {post.title}
                  </Link>

                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      {post.category?.name || 'Uncategorized'}
                    </span>

                    <span>•</span>

                    <span>
                      {formatDate(post.updatedAt)}
                    </span>
                  </div>
                </div>

                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                    post.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {post.status === 'PUBLISHED'
                    ? 'Published'
                    : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h2>

          <p className="text-sm text-gray-500">
            Overview of your latest content activity
          </p>
        </div>

        {recentActivities.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-lg">
              🕐
            </div>

            <h3 className="font-medium text-gray-900">
              No recent activity
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Your post activity will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentActivities.map((activity) => {
              const activityInfo = getActivityInfo(
                activity.action
              )

              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  {/* Activity Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${activityInfo.iconBg} ${activityInfo.iconText}`}
                  >
                    {activityInfo.icon}
                  </div>

                  {/* Activity Details */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activityInfo.label}
                    </p>

                    <p className="mt-0.5 truncate text-sm text-gray-500">
                      {activity.postTitle}
                    </p>
                  </div>

                  {/* Time */}
                  <span className="shrink-0 text-xs text-gray-400">
                    {formatRelativeTime(activity.createdAt)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------
   Stats Card
------------------------------------------------------- */

function StatCard({
  title,
  value,
  description,
  icon,
  iconBg,
  iconText,
}: {
  title: string
  value: number
  description: string
  icon: string
  iconBg: string
  iconText: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg text-lg ${iconBg} ${iconText}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------
   Activity Information
------------------------------------------------------- */

function getActivityInfo(action: string) {
  switch (action) {
    case 'CREATED':
      return {
        label: 'New post created',
        icon: '+',
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600',
      }

    case 'UPDATED':
      return {
        label: 'Post updated',
        icon: '✎',
        iconBg: 'bg-amber-100',
        iconText: 'text-amber-600',
      }

    case 'PUBLISHED':
      return {
        label: 'Post published',
        icon: '✓',
        iconBg: 'bg-green-100',
        iconText: 'text-green-600',
      }

    case 'UNPUBLISHED':
      return {
        label: 'Post unpublished',
        icon: '↓',
        iconBg: 'bg-orange-100',
        iconText: 'text-orange-600',
      }

    case 'DELETED':
      return {
        label: 'Post deleted',
        icon: '×',
        iconBg: 'bg-red-100',
        iconText: 'text-red-600',
      }

    default:
      return {
        label: 'Post activity',
        icon: '•',
        iconBg: 'bg-gray-100',
        iconText: 'text-gray-600',
      }
  }
}

/* -------------------------------------------------------
   Date Helpers
------------------------------------------------------- */

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatRelativeTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'Just now'
  }

  if (minutes < 60) {
    return `${minutes} min ago`
  }

  if (hours < 24) {
    return `${hours} hr ago`
  }

  if (days === 1) {
    return 'Yesterday'
  }

  if (days < 7) {
    return `${days} days ago`
  }

  return formatDate(date)
}