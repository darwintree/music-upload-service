import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"
import { deleteFolder } from "@/lib/file-system"

export async function DELETE(request: NextRequest) {
  try {
    // 验证认证
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)

    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 解析请求体
    const { path: folderPath } = await request.json()

    if (!folderPath || typeof folderPath !== "string") {
      return NextResponse.json({ error: "Folder path is required" }, { status: 400 })
    }

    // 删除文件夹
    const success = await deleteFolder(folderPath)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Folder deleted successfully",
    })
  } catch (error) {
    console.error("Delete folder error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
