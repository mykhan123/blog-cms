'use client'

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import RichTextEditor from '@/app/components/RichTextEditor'
import MediaPicker from "@/app/components/MediaPicker";

type Category = {
  id: string
  name: string
}

const MAX_TAGS = 8

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function NewPostPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] =
    useState(false)

  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')

  const [coverImage, setCoverImage] =
    useState('')

  const [publishedAt, setPublishedAt] =
    useState('')

  const [status, setStatus] =
    useState<'DRAFT' | 'PUBLISHED'>('DRAFT')

  const [categoryId, setCategoryId] =
    useState('')

  const [categories, setCategories] =
    useState<Category[]>([])

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const [loading, setLoading] =
    useState(false)

  const [categoriesLoading, setCategoriesLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(
          '/api/categories'
        )

        if (!response.ok) {
          throw new Error(
            'Failed to load categories'
          )
        }

        const data = await response.json()

        setCategories(data)
      } catch (error) {
        console.error(
          'Category loading error:',
          error
        )
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title))
    }
  }, [title, slugTouched])

  const addTag = () => {
    const newTag = tagInput.trim()

    if (!newTag) {
      return
    }

    if (tags.length >= MAX_TAGS) {
      return
    }

    const alreadyExists = tags.some(
      (tag) =>
        tag.toLowerCase() ===
        newTag.toLowerCase()
    )

    if (alreadyExists) {
      setTagInput('')
      return
    }

    setTags((prev) => [...prev, newTag])
    setTagInput('')
  }

  const removeTag = (tagToRemove: string) => {
    setTags((prev) =>
      prev.filter(
        (tag) => tag !== tagToRemove
      )
    )
  }

  const handleTagKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === 'Enter' ||
      event.key === ','
    ) {
      event.preventDefault()
      addTag()
    }

    if (
      event.key === 'Backspace' &&
      !tagInput &&
      tags.length > 0
    ) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const handleSubmit = async (
    event: FormEvent,
    submitStatus:
      | 'DRAFT'
      | 'PUBLISHED'
  ) => {
    event.preventDefault()

    setError('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!content.trim()) {
      setError('Content is required')
      return
    }

    if (!slug.trim()) {
      setError('Slug is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        '/api/posts',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            title,
            slug,
            excerpt,
            content,
            coverImage,
            publishedAt:
              publishedAt || null,
            status: submitStatus,
            categoryId,
            tags,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Failed to create post'
        )
      }

      router.push('/admin/posts')
      router.refresh()
    } catch (error: any) {
      setError(
        error?.message ||
          'Something went wrong'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Post
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Create and publish a professional
          blog post.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Title */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Enter post title"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Slug */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Slug
              </label>

              <input
                type="text"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true)
                  setSlug(
                    slugify(event.target.value)
                  )
                }}
                placeholder="post-url-slug"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                URL: /blog/
                {slug || 'your-post-slug'}
              </p>
            </div>

            {/* Excerpt */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Excerpt
              </label>

              <textarea
                value={excerpt}
                onChange={(event) =>
                  setExcerpt(
                    event.target.value.slice(
                      0,
                      160
                    )
                  )
                }
                rows={3}
                placeholder="Short description of your post..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="mt-1 text-right text-xs text-gray-500">
                {excerpt.length}/160
              </div>
            </div>

            {/* Cover Image */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Cover Image URL
              </label>

              <MediaPicker
                value={coverImage}
                onChange={setCoverImage}
              />

              <p className="mt-2 text-xs text-gray-500">
                Add an image URL for the blog
                cover image.
              </p>

              {coverImage && (
                <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="h-56 w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Rich Text Content */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Content
              </label>

              <RichTextEditor
                value={content}
                onChange={setContent}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Publish
            </h2>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as
                      | 'DRAFT'
                      | 'PUBLISHED'
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
              >
                <option value="DRAFT">
                  Draft
                </option>

                <option value="PUBLISHED">
                  Published
                </option>
              </select>
            </div>

            {/* Publish Date */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Publish Date
              </label>

              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(event) =>
                  setPublishedAt(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                Leave empty to use the current
                date when publishing.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={(event) =>
                  handleSubmit(
                    event,
                    'DRAFT'
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'Saving...'
                  : 'Save Draft'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={(event) =>
                  handleSubmit(
                    event,
                    'PUBLISHED'
                  )
                }
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? 'Publishing...'
                  : 'Publish'}
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-gray-900">
              Category
            </h2>

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(
                  event.target.value
                )
              }
              disabled={categoriesLoading}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">
                Select category
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Tags
              </h2>

              <span className="text-xs text-gray-500">
                {tags.length}/{MAX_TAGS}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                >
                  {tag}

                  <button
                    type="button"
                    onClick={() =>
                      removeTag(tag)
                    }
                    className="font-bold text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              value={tagInput}
              onChange={(event) =>
                setTagInput(
                  event.target.value
                )
              }
              onKeyDown={handleTagKeyDown}
              disabled={
                tags.length >= MAX_TAGS
              }
              placeholder={
                tags.length >= MAX_TAGS
                  ? 'Maximum tags added'
                  : 'Type tag and press Enter'
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
            />

            <p className="mt-2 text-xs text-gray-500">
              Press Enter or comma to add a
              tag.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}