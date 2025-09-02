import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"
import { getFolderStructure } from "@/lib/file-system"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Folders API called")

    // 验证认证
    const authHeader = request.headers.get("authorization")

    const token = extractTokenFromHeader(authHeader)                     

    if (!token || !validateToken(token)) {
      console.log("[v0] Token validation failed")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Token validation successful")

    const uploadDir = env.get('UPLOAD_DIR')
    console.log("[v0] UPLOAD_DIR environment variable:", uploadDir)

    // 获取文件夹结构
    const folders = await getFolderStructure()
    console.log("[v0] Folders found:", folders.length)

    return NextResponse.json({ folders })
  } catch (error) {
    console.error("[v0] Get folders error:", error)
    return NextResponse.json(
      {
        error: "Failed to load folders",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
