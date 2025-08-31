import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"
import { cancelTask } from "@/lib/queue"

export async function POST(request: NextRequest) {
  try {
    // 验证认证
    const authHeader = request.headers.get("authorization")
    const token = extractTokenFromHeader(authHeader)

    if (!token || !validateToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 解析请求体
    const { taskId } = await request.json()

    if (!taskId || typeof taskId !== "string") {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 })
    }

    // 取消任务
    const success = cancelTask(taskId)

    if (!success) {
      return NextResponse.json({ error: "Failed to cancel task or task not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Task cancelled successfully",
    })
  } catch (error) {
    console.error("Cancel task error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
