import {
  PROJECT_IMAGE_ALLOWED_TYPES,
  PROJECT_IMAGE_MAX_SIZE_BYTES,
  isValidProjectImagePath,
  projectImageUploadPayloadSchema,
} from "@/lib/blob/projectImage";
import { authConfig } from "@/lib/auth/auth";
import { del } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const parsedPayload = parseClientPayload(clientPayload);

        if (!parsedPayload.success || parsedPayload.data.userId !== session.user.id) {
          throw new Error("Invalid upload payload");
        }

        if (!isValidProjectImagePath(pathname, session.user.id)) {
          throw new Error("Invalid upload pathname");
        }

        return {
          allowedContentTypes: [...PROJECT_IMAGE_ALLOWED_TYPES],
          maximumSizeInBytes: PROJECT_IMAGE_MAX_SIZE_BYTES,
          addRandomSuffix: true,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async () => {
        return;
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload project image",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { url?: string };

  if (!body.url) {
    return NextResponse.json({ error: "Image url is required" }, { status: 400 });
  }

  try {
    const parsedUrl = new URL(body.url);

    if (!isValidProjectImagePath(parsedUrl.pathname.slice(1), session.user.id)) {
      return NextResponse.json({ error: "Invalid image url" }, { status: 400 });
    }

    await del(body.url);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete project image",
      },
      { status: 400 },
    );
  }
}

function parseClientPayload(clientPayload: string | null) {
  if (!clientPayload) {
    return {
      success: false as const,
    };
  }

  try {
    return projectImageUploadPayloadSchema.safeParse(JSON.parse(clientPayload));
  } catch {
    return {
      success: false as const,
    };
  }
}
