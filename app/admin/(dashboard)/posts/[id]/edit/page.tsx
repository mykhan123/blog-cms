'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

type Category = {
  id: string
  name: string
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)

    fetch(`/api/posts/${id}`)
      .then((res) => res.json())
      .then((post) => {
        setTitle(post.title)
        setContent(post.content)
        setExcerpt(post.excerpt || '')
        setCategoryId(post.categoryId || '')
        setStatus(post.status)
        setLoaded(true)
      })
  }, [id])

  const handleSubmit = async (newStatus: 'DRAFT' | 'PUBLISHED') => {
    setError('')
    setLoading(true)

    const res = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        excerpt,
        status: newStatus,
        categoryId: categoryId || null,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      return
    }

    router.push('/admin/posts')
    router.refresh()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return

    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    router.push('/admin/posts')
    router.refresh()
  }

  if (!loaded) {
    return <p className="text-sm text-gray-500">Loading...</p>
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Edit Post</h1>
        <button
          onClick={handleDelete}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Delete post
        </button>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xl font-medium border-b border-gray-200 pb-2 outline-none focus:border-indigo-500"
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">No category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Short excerpt (optional)"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <textarea
          placeholder="Write your post..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={12}
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            className="border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === 'PUBLISHED' ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  )
}