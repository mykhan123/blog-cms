'use client'

import { useEffect, useState } from 'react'

type Category = {
  id: string
  name: string
  slug: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCategories = async () => {
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
      return
    }

    setName('')
    fetchCategories()
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-6">Categories</h1>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500 p-4">No categories yet.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="px-4 py-3 text-sm">
              {cat.name}
            </div>
          ))
        )}
      </div>
    </div>
  )
}