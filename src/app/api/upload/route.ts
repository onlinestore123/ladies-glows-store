import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { verifyAdminPassword } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let password = "";
        try {
          const parsed = clientPayload ? JSON.parse(clientPayload) : {};
          password = parsed.password ?? "";
        } catch {
          password = "";
        }

        const isValid = await verifyAdminPassword(password);
        if (!isValid) {
          throw new Error("غير مصرح لك برفع الملفات");
        }

        return {
          allowedContentTypes: ["image/*", "video/*"],
          addRandomSuffix: true,
          maximumSizeInBytes: 60 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        // لا حاجة لأي إجراء إضافي بعد اكتمال الرفع
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "تعذر رفع الملف" },
      { status: 400 }
    );
  }
}
