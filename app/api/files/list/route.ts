import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"
import { listFiles } from "@/lib/file-system"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Files list API called")

    // 验证认证
    const authHeader = request.headers.get("authorization")
    console.log("[v0] Auth header:", authHeader ? "present" : "missing")

    const token = extractTokenFromHeader(authHeader)
    console.log("[v0] Extracted token:", token ? "present" : "missing")

    if (!token || !validateToken(token)) {
      console.log("[v0] Token validation failed")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Token validation successful")

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const folderPath = searchParams.get("path") || "/"
    console.log("[v0] Folder path:", folderPath)

    const uploadDir = process.env.UPLOAD_DIR
    console.log("[v0] UPLOAD_DIR environment variable:", uploadDir || "not set, using default ./uploads")

    // 获取文件列表
    const files = await listFiles(folderPath)
    console.log("[v0] Files found:", files.length)

    return NextResponse.json({ files })
  } catch (error) {
    console.error("[v0] List files error:", error)
    return NextResponse.json(
      {
        error: "Failed to load files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
