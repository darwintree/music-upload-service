import { type NextRequest, NextResponse } from "next/server"
import { validateToken, extractTokenFromHeader } from "@/lib/auth"
import { getQueueStats } from "@/lib/queue"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Queue status API called")

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

    // 获取队列状态
    const stats = getQueueStats()
    console.log("[v0] Queue stats:", stats)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("[v0] Queue status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
