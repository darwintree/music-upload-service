import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"
import { getFolderStructure } from "@/lib/file-system"

export async function GET(request: NextRequest) {
  try {
    // 验证认证
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)

    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 获取文件夹结构
    const folders = await getFolderStructure()

    return NextResponse.json({ folders })
  } catch (error) {
    console.error("Get folders error:", error)
    return NextResponse.json(
      {
        error: "Failed to load folders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
