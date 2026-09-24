import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const media = await prisma.media.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("Get media error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch media",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json(
        {
          error: "Media ID is required",
        },
        { status: 400 }
      );
    }

    const media = await prisma.media.findUnique({
      where: {
        id,
      },
    });

    if (!media) {
      return NextResponse.json(
        {
          error: "Media not found",
        },
        { status: 404 }
      );
    }

    await cloudinary.uploader.destroy(media.publicId);

    await prisma.media.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete media error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete media",
      },
      { status: 500 }
    );
  }
}