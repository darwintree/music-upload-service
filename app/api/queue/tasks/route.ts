import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"
import { getQueueTasks } from "@/lib/queue"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Queue tasks API called")

    // 验证认证
    const authHeader = request.headers.get("authorization")

    const token = extractTokenFromHeader(authHeader)

    if (!token || !validateToken(token)) {
      console.log("[v0] Token validation failed")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Token validation successful")

    // 获取任务列表
    const tasks = getQueueTasks()
    console.log("[v0] Queue tasks:", tasks.length, "tasks found")

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error("[v0] Queue tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
