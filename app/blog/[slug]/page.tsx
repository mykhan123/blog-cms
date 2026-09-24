import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const post = await prisma.post.findUnique({
    where: { slug },
    include: { category: true, author: true },
  })

  if (!post || post.status !== 'PUBLISHED') {
    notFound()
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <article className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full max-h-[500px] object-contain"
          />
        )}

        <div className="p-8">
          {post.category && (
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-medium px-3 py-1 rounded-full mb-4">
              {post.category.name}
            </span>
          )}

          <h1 className="text-3xl font-semibold text-gray-900 mb-3 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <span>{post.author.name}</span>
            <span>·</span>
            <span>{formattedDate}</span>
          </div>

          {post.excerpt && (
            <p className="text-gray-600 text-base mb-6 italic">
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>
        </div>
      </article>
    </div>
  )
}