import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"
import { saveUploadedFile } from "@/lib/file-system"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    // 验证认证
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)

    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 解析表单数据
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folder = (formData.get("folder") as string) || "/"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // 验证文件类型
    if (!file.name.toLowerCase().endsWith(".m4a")) {
      return NextResponse.json({ error: "Only .m4a files are allowed" }, { status: 400 })
    }

    // 验证文件大小 (100MB)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 100MB limit" }, { status: 400 })
    }

    // 构建目标路径
    const targetPath = path.join(folder, file.name)

    // 保存文件
    const success = await saveUploadedFile(file, targetPath)

    if (!success) {
      return NextResponse.json({ error: "Failed to save file" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      fileName: file.name,
      fileSize: file.size,
      targetPath,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
