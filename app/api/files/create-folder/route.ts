import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"
import { createFolder } from "@/lib/file-system"

export async function POST(request: NextRequest) {
  try {
    // 验证认证
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)

    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 解析请求体
    const { parentPath, name } = await request.json()

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    // 创建文件夹
    const success = await createFolder(parentPath || "/", name)

    if (!success) {
      return NextResponse.json({ error: "Failed to create folder" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Folder created successfully",
    })
  } catch (error) {
    console.error("Create folder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
