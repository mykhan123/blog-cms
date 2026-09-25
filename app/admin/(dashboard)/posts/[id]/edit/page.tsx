'use client'

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useState,
} from 'react'
import { useParams, useRouter } from 'next/navigation'
import RichTextEditor from '@/app/components/RichTextEditor'
import MediaPicker from '@/app/components/MediaPicker'

type Category = {
  id: string
  name: string
}

type Tag = {
  id: string
  name: string
  slug: string
}

type PostData = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string | null
  status: 'DRAFT' | 'PUBLISHED'
  categoryId: string | null
  category: Category | null
  tags: Tag[]
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

function formatDateTimeLocal(
  dateString: string | null
) {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0')

  const day = String(
    date.getDate()
  ).padStart(2, '0')

  const hours = String(
    date.getHours()
  ).padStart(2, '0')

  const minutes = String(
    date.getMinutes()
  ).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()

  const postId = params.id as string

  const [post, setPost] =
    useState<PostData | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
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

  const [tags, setTags] =
    useState<string[]>([])

  const [tagInput, setTagInput] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [deleting, setDeleting] =
    useState(false)

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        const [
          postResponse,
          categoryResponse,
        ] = await Promise.all([
          fetch(`/api/posts/${postId}`),
          fetch('/api/categories'),
        ])

        if (!postResponse.ok) {
          throw new Error(
            'Failed to load post'
          )
        }

        const postData =
          await postResponse.json()

        const categoryData =
          await categoryResponse.json()

        setPost(postData)

        setTitle(postData.title || '')
        setSlug(postData.slug || '')

        setExcerpt(
          postData.excerpt || ''
        )

        setContent(
          postData.content || ''
        )

        setCoverImage(
          postData.coverImage || ''
        )

        setPublishedAt(
          formatDateTimeLocal(
            postData.publishedAt
          )
        )

        setStatus(
          postData.status || 'DRAFT'
        )

        setCategoryId(
          postData.categoryId || ''
        )

        setTags(
          Array.isArray(postData.tags)
            ? postData.tags.map(
                (tag: Tag) => tag.name
              )
            : []
        )

        if (
          Array.isArray(categoryData)
        ) {
          setCategories(categoryData)
        }
      } catch (error: any) {
        setError(
          error?.message ||
            'Failed to load data'
        )
      } finally {
        setLoading(false)
      }
    }

    if (postId) {
      loadData()
    }
  }, [postId])

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

    setTags((prev) => [
      ...prev,
      newTag,
    ])

    setTagInput('')
  }

  const removeTag = (
    tagToRemove: string
  ) => {
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
      setTags((prev) =>
        prev.slice(0, -1)
      )
    }
  }

  const handleSave = async (
    event: FormEvent,
    saveStatus:
      | 'DRAFT'
      | 'PUBLISHED'
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!slug.trim()) {
      setError('Slug is required')
      return
    }

    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        `/api/posts/${postId}`,
        {
          method: 'PUT',
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
            status: saveStatus,
            categoryId,
            tags,
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Failed to update post'
        )
      }

      setPost(data)
      setStatus(data.status)

      setPublishedAt(
        formatDateTimeLocal(
          data.publishedAt
        )
      )

      setSuccess(
        saveStatus === 'PUBLISHED'
          ? 'Post published successfully.'
          : 'Post saved as draft successfully.'
      )

      router.refresh()
    } catch (error: any) {
      setError(
        error?.message ||
          'Something went wrong'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this post?'
      )

    if (!confirmed) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      const response = await fetch(
        `/api/posts/${postId}`,
        {
          method: 'DELETE',
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Failed to delete post'
        )
      }

      router.push('/admin/posts')
      router.refresh()
    } catch (error: any) {
      setError(
        error?.message ||
          'Failed to delete post'
      )

      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 sm:py-10">
        <div className="rounded-xl border border-gray-200 bg-white p-5 text-center text-gray-500 sm:p-8">
          Loading post...
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-4 sm:py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:p-6">
          {error || 'Post not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
      {/* Header */}
      <div className="mb-5 flex flex-col justify-between gap-4 sm:mb-6 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Edit Post
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Update your blog post.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting || saving}
          className="w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {deleting
            ? 'Deleting...'
            : 'Delete Post'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:mb-6">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 sm:mb-6">
          {success}
        </div>
      )}

      <form className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="min-w-0 space-y-4 sm:space-y-6 lg:col-span-2">
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            {/* Title */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                className="min-w-0 w-full rounded-lg border border-gray-300 px-3 py-3 text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:px-4 sm:text-lg"
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
                onChange={(event) =>
                  setSlug(
                    slugify(
                      event.target.value
                    )
                  )
                }
                className="min-w-0 w-full rounded-lg border border-gray-300 px-3 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:px-4"
              />

              <p className="mt-2 break-all text-xs text-gray-500">
                URL: /blog/{slug}
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
                className="min-w-0 w-full resize-none rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:px-4"
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
                Add an image URL for the
                blog cover image.
              </p>
            </div>

            {/* Rich Text Content */}
            <div className="min-w-0">
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
        <div className="min-w-0 space-y-4 sm:space-y-6">
          {/* Publish */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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
                    event.target
                      .value as
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
                className="min-w-0 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-gray-500">
                Select when this post should
                be published.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={(event) =>
                  handleSave(
                    event,
                    'DRAFT'
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? 'Saving...'
                  : 'Save Draft'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={(event) =>
                  handleSave(
                    event,
                    'PUBLISHED'
                  )
                }
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? 'Publishing...'
                  : 'Publish'}
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500"
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
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-gray-900">
                Tags
              </h2>

              <span className="shrink-0 text-xs text-gray-500">
                {tags.length}/{MAX_TAGS}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                >
                  <span className="max-w-[220px] truncate">
                    {tag}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeTag(tag)
                    }
                    className="shrink-0 font-bold text-blue-500 hover:text-blue-700"
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
              onKeyDown={
                handleTagKeyDown
              }
              disabled={
                tags.length >= MAX_TAGS
              }
              placeholder={
                tags.length >= MAX_TAGS
                  ? 'Maximum tags added'
                  : 'Type tag and press Enter'
              }
              className="min-w-0 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
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