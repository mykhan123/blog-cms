import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">Blog CMS</h1>
          <Link
            href="/admin/login"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          Latest Posts
        </h2>

        {posts.length === 0 ? (
          <p className="text-gray-500 text-sm">No posts published yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                {post.category && (
                  <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full mb-3">
                    {post.category.name}
                  </span>
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}