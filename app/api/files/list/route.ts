import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"
import { listFiles } from "@/lib/file-system"

export async function GET(request: NextRequest) {
  try {
    // 验证认证
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)

    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get("path") || "/"

    // 获取文件列表
    const files = await listFiles(folderPath)

    return NextResponse.json({ files })
  } catch (error) {
    console.error("List files error:", error)
    return NextResponse.json(
      {
        error: "Failed to load files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
