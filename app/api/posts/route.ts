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

async function generateUniqueSlug(baseSlug: string) {
  let slug = baseSlug || 'untitled-post'
  let counter = 2

  while (true) {
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!existingPost) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
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

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    const baseSlug = slugify(
      requestedSlug?.trim() || title
    )

    if (!baseSlug) {
      return NextResponse.json(
        {
          error:
            'Please provide a valid title or slug',
        },
        { status: 400 }
      )
    }

    const slug = await generateUniqueSlug(baseSlug)

    const postStatus =
      status === 'PUBLISHED'
        ? 'PUBLISHED'
        : 'DRAFT'

    const tagRecords = await getOrCreateTags(
      Array.isArray(tags) ? tags : []
    )

    let finalPublishedAt: Date | null = null

    if (postStatus === 'PUBLISHED') {
      if (publishedAt) {
        const parsedDate = new Date(publishedAt)

        if (!Number.isNaN(parsedDate.getTime())) {
          finalPublishedAt = parsedDate
        } else {
          finalPublishedAt = new Date()
        }
      } else {
        finalPublishedAt = new Date()
      }
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        coverImage:
          coverImage?.trim() || null,
        status: postStatus,
        publishedAt: finalPublishedAt,
        authorId: session.user.id,
        categoryId: categoryId || null,

        tags: {
          connect: tagRecords.map((tag) => ({
            id: tag.id,
          })),
        },
      },
      include: {
        category: true,
        tags: true,
      },
    })

    await prisma.activity.create({
      data: {
        action:
          postStatus === 'PUBLISHED'
            ? 'PUBLISHED'
            : 'CREATED',
        postTitle: post.title,
        postId: post.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json(post, {
      status: 201,
    })
  } catch (error: any) {
    console.error('Create post error:', error)

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
        error: 'Failed to create post',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
        tags: true,
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Get posts error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch posts',
      },
      { status: 500 }
    )
  }
}