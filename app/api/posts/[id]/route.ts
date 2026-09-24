import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { NextResponse } from 'next/server'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function generateUniqueSlug(
  baseSlug: string,
  currentPostId?: string
) {
  const cleanBaseSlug =
    slugify(baseSlug) || 'untitled-post'

  let slug = cleanBaseSlug
  let counter = 2

  while (true) {
    const existingPost =
      await prisma.post.findUnique({
        where: { slug },
        select: { id: true },
      })

    if (!existingPost) {
      return slug
    }

    if (
      currentPostId &&
      existingPost.id === currentPostId
    ) {
      return slug
    }

    slug = `${cleanBaseSlug}-${counter}`
    counter++
  }
}

async function getOrCreateTags(tags: string[]) {
  const cleanedTags = Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  )

  const tagRecords = []

  for (const tagName of cleanedTags) {
    const tagSlug = slugify(tagName)

    if (!tagSlug) {
      continue
    }

    const tag = await prisma.tag.upsert({
      where: {
        slug: tagSlug,
      },
      update: {},
      create: {
        name: tagName,
        slug: tagSlug,
      },
    })

    tagRecords.push(tag)
  }

  return tagRecords
}

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Get post error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch post',
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const {
      title,
      slug: requestedSlug,
      content,
      excerpt,
      coverImage,
      status,
      categoryId,
      tags,
      publishedAt,
    } = body

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!requestedSlug?.trim()) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      )
    }

    const existingPost =
      await prisma.post.findUnique({
        where: { id },
      })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const newStatus =
      status === 'PUBLISHED'
        ? 'PUBLISHED'
        : 'DRAFT'

    const slug = await generateUniqueSlug(
      requestedSlug,
      id
    )

    const tagRecords = await getOrCreateTags(
      Array.isArray(tags) ? tags : []
    )

    let finalPublishedAt =
      existingPost.publishedAt

    if (newStatus === 'DRAFT') {
      finalPublishedAt = null
    }

    if (newStatus === 'PUBLISHED') {
      if (publishedAt) {
        const parsedDate = new Date(publishedAt)

        if (!Number.isNaN(parsedDate.getTime())) {
          finalPublishedAt = parsedDate
        } else if (!finalPublishedAt) {
          finalPublishedAt = new Date()
        }
      } else if (!finalPublishedAt) {
        finalPublishedAt = new Date()
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        coverImage:
          coverImage?.trim() || null,
        status: newStatus,
        publishedAt: finalPublishedAt,
        categoryId: categoryId || null,

        tags: {
          set: tagRecords.map((tag) => ({
            id: tag.id,
          })),
        },
      },
      include: {
        category: true,
        tags: true,
      },
    })

    let action:
      | 'UPDATED'
      | 'PUBLISHED'
      | 'UNPUBLISHED' =
      'UPDATED'

    if (
      existingPost.status !== 'PUBLISHED' &&
      newStatus === 'PUBLISHED'
    ) {
      action = 'PUBLISHED'
    } else if (
      existingPost.status === 'PUBLISHED' &&
      newStatus === 'DRAFT'
    ) {
      action = 'UNPUBLISHED'
    }

    await prisma.activity.create({
      data: {
        action,
        postTitle: post.title,
        postId: post.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(post)
  } catch (error: any) {
    console.error('Update post error:', error)

    if (error?.code === 'P2002') {
      return NextResponse.json(
        {
          error:
            'A post with this slug already exists.',
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to update post',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const post = await prisma.post.findUnique({
      where: { id },
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    await prisma.activity.create({
      data: {
        action: 'DELETED',
        postTitle: post.title,
        postId: post.id,
        userId: session.user.id,
      },
    })

    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete post error:', error)

    return NextResponse.json(
      {
        error: 'Failed to delete post',
      },
      { status: 500 }
    )
  }
}